import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useSubmit } from "@remix-run/react";
import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { getTranslations } from "~/locale/i18next.server";
import { OnboardingWithDetails, getOnboarding } from "~/modules/onboarding/db/onboarding.db.server";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import OnboardingBlock from "~/modules/onboarding/blocks/OnboardingBlock";
import OnboardingBlockForm from "~/modules/onboarding/blocks/OnboardingBlockForm";
import { OnboardingBlockDto, OnboardingHeightDto, OnboardingStepBlockDto } from "~/modules/onboarding/blocks/OnboardingBlockUtils";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import OnboardingStepsService from "~/modules/onboarding/services/OnboardingStepsService";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetails;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  const data: LoaderData = {
    meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  if (action === "set-steps") {
    try {
      await OnboardingStepsService.setSteps({ item, form, t });
      return json({ success: "Onboarding steps updated" });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const appOrAdminData = useAppOrAdminData();

  const [showPreview, setShowPreview] = useState(false);

  const [onboardingBlock, setOnboardingBlock] = useState<OnboardingBlockDto>({
    style: data.item.type as any,
    title: data.item.title,
    canBeDismissed: data.item.canBeDismissed,
    height: (data.item.height ?? "md") as OnboardingHeightDto,
    steps: data.item.steps.map((f) => {
      const block = JSON.parse(f.block) as OnboardingStepBlockDto;
      return block;
    }),
  });

  const modalConfirm = useRef<RefConfirmModal>(null);

  function onUpdateOnboardingBlock(item: OnboardingBlockDto) {
    setOnboardingBlock(item);
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (data.item.sessions.length > 0) {
      modalConfirm.current?.setValue(formData);
      modalConfirm.current?.show(
        t("onboarding.prompts.updateSteps.title", { 0: data.item.sessions.length }),
        t("shared.confirm"),
        t("shared.back"),
        t("onboarding.prompts.updateSteps.description")
      );
    } else {
      onConfirmSave(formData);
    }
  }

  function onConfirmSave(form: FormData) {
    submit(form, {
      method: "post",
    });
  }

  return (
    <Form method="post" onSubmit={onSave} className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <input type="hidden" name="action" value="set-steps" hidden readOnly />
      <input type="hidden" name="block" value={JSON.stringify(onboardingBlock)} hidden readOnly />

      {data.item.active ? (
        <ErrorBanner title={t("shared.warning")} text="You cannot edit an active onboarding." />
      ) : data.item.sessions.length > 0 ? (
        <WarningBanner
          title={t("onboarding.prompts.updateSteps.title", { 0: data.item.sessions.length })}
          text={t("onboarding.prompts.updateSteps.description")}
        />
      ) : null}

      <div>
        <OnboardingBlock open={showPreview} onClose={() => setShowPreview(false)} item={onboardingBlock} />
        <OnboardingBlockForm item={onboardingBlock} onUpdate={onUpdateOnboardingBlock} />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex w-full justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-gray-600 shadow-lg hover:border-dashed hover:border-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:outline-none"
        >
          {t("shared.clickHereTo", { 0: t("shared.preview").toLowerCase() })}
        </button>
      </div>

      <div className="border-border flex justify-between border-t pt-4">
        <div></div>
        <div>
          <LoadingButton disabled={data.item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")} type="submit">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </div>

      <ConfirmModal ref={modalConfirm} onYes={onConfirmSave} />
      <ActionResultModal actionData={actionData} />
    </Form>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
