import { useActionData, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import InputFilters from "~/components/ui/input/InputFilters";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import OnboardingSessionsTable from "~/modules/onboarding/components/OnboardingSessionsTable";
import { OnboardingSessionWithDetails } from "~/modules/onboarding/db/onboardingSessions.db.server";
import { OnboardingSessionsIndexApi } from "../../api/sessions/OnboardingSessionsIndexApi.server";

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<OnboardingSessionsIndexApi.LoaderData>();
  const actionData = useActionData<OnboardingSessionsIndexApi.ActionData>();
  const submit = useSubmit();

  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(item: OnboardingSessionWithDetails) {
    modalConfirmDelete.current?.setValue(item.id);
    modalConfirmDelete.current?.show(
      t("onboarding.prompts.deleteSession.title"),
      t("shared.confirm"),
      t("shared.back"),
      t("onboarding.prompts.deleteSession.description")
    );
  }
  function onConfirmDelete(id: string) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <>
      <div className="md:border-b md:border-gray-200 md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Sessions</h3>
          <div className="flex items-center space-x-2">
            <InputFilters filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <OnboardingSessionsTable items={data.items} metadata={data.metadata} onDelete={onDelete} />
      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </>
  );
}
