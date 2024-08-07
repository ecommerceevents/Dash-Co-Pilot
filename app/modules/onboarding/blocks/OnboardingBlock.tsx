import { useNavigate, useParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { OnboardingSessionWithDetails } from "~/modules/onboarding/db/onboardingSessions.db.server";
import { OnboardingSessionActionDto } from "~/modules/onboarding/dtos/OnboardingSessionActionDto";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { OnboardingBlockDto } from "./OnboardingBlockUtils";
import OnboardingVariantModal from "./OnboardingVariantModal";
import { useTypedFetcher } from "remix-typedjson";

export default function OnboardingBlock({
  session,
  item,
  open,
  onClose,
}: {
  session?: OnboardingSessionWithDetails | null;
  item: OnboardingBlockDto;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher();
  const navigate = useNavigate();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();

  const errorModal = useRef<RefErrorModal>(null);

  const [block, setBlock] = useState<OnboardingBlockDto>(item);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    setBlock(item);
  }, [item]);

  useEffect(() => {
    if (session) {
      const stepIdx = session.sessionSteps.findIndex((f) => !f.completedAt);
      if (stepIdx !== undefined && stepIdx !== -1 && stepIdx < item.steps.length) {
        setCurrentStepIdx(stepIdx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stepStates, setStepStates] = useState<{ idx: number; state: { [key: string]: string } }[]>([]);

  useEffect(() => {
    if (session && !session.startedAt) {
      const form = new FormData();
      form.set("action", "started");
      submitSessionForm(form);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onUpdateCurrentStepState(state: { [key: string]: string }) {
    setStepStates((prev) => {
      const idx = prev.findIndex((x) => x.idx === currentStepIdx);
      if (idx === -1) {
        return [...prev, { idx: currentStepIdx, state }];
      }
      return [...prev.slice(0, idx), { idx: currentStepIdx, state }, ...prev.slice(idx + 1)];
    });
  }

  function submitSessionForm(form: FormData, actions?: OnboardingSessionActionDto[]) {
    if (session) {
      if (actions) {
        actions
          .filter((f) => f.value)
          .forEach((action) => {
            form.append("actions[]", JSON.stringify(action));
          });
      }
      fetcher.submit(form, {
        action: "/onboarding/" + session.id,
        method: "post",
      });
    }
  }

  function onDismiss() {
    if (validInput()) {
      if (session && !session.dismissedAt) {
        const form = new FormData();
        form.set("action", "dismissed");
        submitSessionForm(form);
      }
      onClose();
    }
  }

  function setStep(idx: number) {
    const form = new FormData();
    form.set("action", "set-step");
    form.set("fromIdx", currentStepIdx.toString());
    form.set("toIdx", idx.toString());
    const currentState = stepStates.find((x) => x.idx === currentStepIdx);
    const keyValuePairs = Object.entries(currentState?.state || {});
    submitSessionForm(
      form,
      keyValuePairs.map(([key, value]) => {
        return { type: "input", name: key, value };
      })
    );

    const currentStep = block.steps[currentStepIdx];
    currentStep.completedAt = new Date();
    setBlock({ ...block, steps: [...block.steps.slice(0, currentStepIdx), currentStep, ...block.steps.slice(currentStepIdx + 1)] });

    if (validInput()) {
      setCurrentStepIdx(idx);
    }
  }

  function validInput() {
    const missingFields = getMissingFields();
    if (missingFields.length === 0) {
      return true;
    } else {
      errorModal.current?.show(t("shared.error"), t("onboarding.errors.missingInput", { 0: missingFields.join(", ") }));
    }
  }

  function onComplete() {
    if (session && !session.completedAt) {
      const form = new FormData();
      form.set("action", "complete");
      form.set("fromIdx", currentStepIdx.toString());
      submitSessionForm(form);
    }

    if (validInput()) {
      onClose();
    }
  }

  function onLinkClick(item: { text: string; href: string }) {
    const form = new FormData();
    form.set("action", "add-actions");
    submitSessionForm(form, [
      {
        type: "click",
        name: item.text,
        value: item.href,
      },
    ]);

    let currentUrl = "";
    if (params.tenant) {
      currentUrl = "/app/" + params.tenant;
    } else {
      currentUrl = "/admin";
    }
    const linkWithVariables = item.href
      .replace(":tenant", params.tenant ?? "")
      .replace("{tenant}", params.tenant ?? "")
      .replace("$tenant", params.tenant ?? "")
      .replace(":user", appOrAdminData?.user?.id)
      .replace("{user}", appOrAdminData?.user?.id)
      .replace("$user", appOrAdminData?.user?.id)
      .replace("$appOrAdmin", currentUrl)
      .replace("{appOrAdmin}", currentUrl)
      .replace(":appOrAdmin", currentUrl);

    navigate(linkWithVariables);
    onClose();
  }
  function getMissingFields() {
    const step = block.steps[currentStepIdx];
    const fields: string[] = [];
    step.input.forEach((input) => {
      if (input.isRequired) {
        const currentState = stepStates.find((x) => x.idx === currentStepIdx);
        if (!currentState?.state[input.name]) {
          fields.push(t(input.title));
        }
      }
    });
    return fields;
  }

  function onClosing() {
    if (validInput()) {
      onClose();
    }
  }
  return (
    <>
      {item.style === "modal" && (
        <OnboardingVariantModal
          block={block}
          currentStepIdx={currentStepIdx}
          setStep={setStep}
          open={open}
          onClose={onClosing}
          onDismiss={onDismiss}
          onComplete={onComplete}
          onLinkClick={onLinkClick}
          onUpdateCurrentStepState={onUpdateCurrentStepState}
        />
      )}
      <ErrorModal ref={errorModal} />
    </>
  );
}
