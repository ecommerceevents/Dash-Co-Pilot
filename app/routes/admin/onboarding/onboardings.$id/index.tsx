import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useSubmit, Link } from "@remix-run/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ServerError from "~/components/ui/errors/ServerError";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputText from "~/components/ui/input/InputText";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import { OnboardingWithDetails, getOnboarding, updateOnboarding, deleteOnboarding } from "~/modules/onboarding/db/onboarding.db.server";
import { OnboardingFilterMetadataDto } from "~/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";
import OnboardingFilterUtils from "~/modules/onboarding/utils/OnboardingFilterUtils";
import OnboardingStepUtils from "~/modules/onboarding/utils/OnboardingStepUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetails;
  metadata: OnboardingFilterMetadataDto;
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
  if (action === "update") {
    const title = form.get("title")?.toString();
    await updateOnboarding(item.id, {
      title: title !== undefined ? title : undefined,
    });
    return json({ success: "Onboarding updated" });
  } else if (action === "activate") {
    const active = form.get("active");
    if (active === undefined) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    const isActive = active !== undefined ? active === "true" : undefined;
    await updateOnboarding(item.id, {
      active: isActive,
    });
    if (isActive) {
      return json({ success: "Onboarding activated" });
    } else {
      return json({ success: "Onboarding deactivated" });
    }
  } else if (action === "delete") {
    await deleteOnboarding(item.id);
    return redirect("/admin/onboarding/onboardings");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const appOrAdminData = useAppOrAdminData();

  const [title, setTitle] = useState(data.item.title);

  const modalConfirm = useRef<RefConfirmModal>(null);

  function onActivate(active: boolean) {
    modalConfirm.current?.setValue(active);
    if (active) {
      modalConfirm.current?.show(t("onboarding.prompts.activate.title"), t("shared.confirm"), t("shared.back"), t("onboarding.prompts.activate.description"));
    } else {
      modalConfirm.current?.show(
        t("onboarding.prompts.deactivate.title"),
        t("shared.confirm"),
        t("shared.back"),
        t("onboarding.prompts.deactivate.description")
      );
    }
  }

  function onConfirmActivate(active: boolean) {
    const form = new FormData();
    form.set("action", "activate");
    form.set("active", active ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  function canBeActivated() {
    if (data.item.filters.length > 0 && data.item.steps.length > 0) {
      return true;
    }
  }
  function canBeInactivated() {
    return true;
  }
  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {data.item.active && <InfoBanner title={t("shared.active")} text="This onboarding is active and will be shown to users." />}

      <InputGroup title={t("shared.details")}>
        <Form method="post" className="divide-y-gray-200 space-y-4 divide-y">
          <input name="action" value="update" hidden readOnly />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <InputText disabled={data.item.active} name="title" title={t("onboarding.object.title")} value={title} setValue={setTitle} required />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <ButtonSecondary disabled={data.item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")} type="submit">
              {t("shared.save")}
            </ButtonSecondary>
          </div>
        </Form>
      </InputGroup>

      <InputGroup
        title={t("onboarding.step.plural")}
        right={
          <>
            <Link to={`/admin/onboarding/onboardings/${data.item.id}/steps`} className="text-sm font-medium text-gray-500 hover:text-gray-800 hover:underline">
              {t("onboarding.step.set")}
            </Link>
          </>
        }
      >
        <div className="space-y-2">
          {data.item.steps.length === 0 && (
            <Link
              to={`/admin/onboarding/onboardings/${data.item.id}/steps`}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-gray-500">{t("onboarding.step.empty.title")}</span>
            </Link>
          )}
          {data.item.steps.map((step, idx) => {
            return (
              <div key={idx} className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                {OnboardingStepUtils.getStepDescription(OnboardingStepUtils.parseStepToBlock(step))}
              </div>
            );
          })}
        </div>
      </InputGroup>

      <InputGroup
        title={t("onboarding.filter.plural")}
        right={
          <>
            <Link
              to={`/admin/onboarding/onboardings/${data.item.id}/filters`}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 hover:underline"
            >
              {t("onboarding.filter.set")}
            </Link>
          </>
        }
      >
        <div className="space-y-2">
          {data.item.filters.length === 0 && (
            <Link
              to={`/admin/onboarding/onboardings/${data.item.id}/filters`}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-gray-500">{t("onboarding.filter.empty.title")}</span>
            </Link>
          )}
          {data.item.filters.map((filter, idx) => {
            return (
              <div key={idx} className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="font-medium">{filter.type}</div>
                  {filter.value !== null && (
                    <>
                      <div>→</div>
                      <div className="italic text-gray-500">{OnboardingFilterUtils.parseValue({ t, filter, metadata: data.metadata })}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </InputGroup>

      {!canBeActivated() && (
        <WarningBanner title={t("onboarding.errors.cannotBeActivated.title")} text={t("onboarding.errors.cannotBeActivated.description")} />
      )}

      <div className="flex justify-between">
        <div></div>
        <div className="flex justify-between space-x-2">
          {!data.item.active ? (
            <ButtonPrimary
              disabled={!canBeActivated() || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")}
              onClick={() => onActivate(true)}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {t("onboarding.prompts.activate.title")}
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              destructive
              disabled={!canBeInactivated() || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")}
              onClick={() => onActivate(false)}
            >
              {t("onboarding.prompts.deactivate.title")}
            </ButtonPrimary>
          )}
        </div>
      </div>

      <ConfirmModal ref={modalConfirm} onYes={onConfirmActivate} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
