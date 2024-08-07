import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ServerError from "~/components/ui/errors/ServerError";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import OnboardingSessionsTable from "~/modules/onboarding/components/OnboardingSessionsTable";
import { OnboardingWithDetails, getOnboarding } from "~/modules/onboarding/db/onboarding.db.server";
import {
  deleteOnboardingSession,
  getOnboardingSessions,
  OnboardingSessionWithDetails,
  getOnboardingSession,
} from "~/modules/onboarding/db/onboardingSessions.db.server";
import { deleteOnboardingSessionSteps } from "~/modules/onboarding/db/onboardingSessionSteps.db.server";
import { OnboardingFilterMetadataDto } from "~/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetails;
  items: OnboardingSessionWithDetails[];
  metadata: OnboardingFilterMetadataDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  const items = await getOnboardingSessions({
    onboardingId: item.id,
  });
  const data: LoaderData = {
    meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
    item,
    items,
    metadata: await OnboardingService.getMetadata(),
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
  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    if (!id) {
      return json({ error: "Session ID is required" }, { status: 400 });
    }
    const session = await getOnboardingSession(id);
    // if (session?.status !== "active") {
    //   return json({ error: "Sessions can only be deleted when they are active" }, { status: 400 });
    // }
    await deleteOnboardingSessionSteps(session!.sessionSteps.map((s) => s.id));
    await deleteOnboardingSession(id);
    return json({ success: "Onboarding session deleted" });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
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
    <div className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <div className="space-y-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium leading-3 text-gray-800">{t("onboarding.session.plural")}</h3>
          <p className="text-sm text-gray-500">Sessions represent the current state of an onboarding process.</p>
        </div>
        {!data.item.active && <WarningBanner title={t("shared.warning")} text="Current onboarding is not active, sessions will not be created/loaded." />}
        <OnboardingSessionsTable items={data.items} withOnboarding={false} onDelete={onDelete} metadata={data.metadata} />
      </div>
      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
