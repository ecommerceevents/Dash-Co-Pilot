import { AnalyticsSettings } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputText from "~/components/ui/input/InputText";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SettingSection from "~/components/ui/sections/SettingSection";
import { getTranslations } from "~/locale/i18next.server";
import { useRootData } from "~/utils/data/useRootData";
import { db } from "~/utils/db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  settings: AnalyticsSettings;
  isLocalDev: boolean;
};
export const loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.analytics.delete");
  let settings = await db.analyticsSettings.findFirst({});
  if (!settings) {
    settings = await db.analyticsSettings.create({ data: { public: false, ignorePages: "/admin/analytics", onlyPages: "" } });
  }
  const data: LoaderData = {
    settings,
    isLocalDev: process.env.NODE_ENV === "development",
  };
  return json(data);
};

type ActionData = {
  deleteError?: string;
  deleteSuccess?: boolean;
};
export const action: ActionFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.analytics.delete");
  const { t } = await getTranslations(request);

  let settings = await db.analyticsSettings.findFirst({});
  if (!settings) {
    settings = await db.analyticsSettings.create({ data: { public: false, ignorePages: "/admin/analytics", onlyPages: "" } });
  }

  const form = await request.formData();
  const action = form.get("action");
  if (action === "delete-all") {
    await db.analyticsUniqueVisitor.deleteMany({});
    await db.analyticsPageView.deleteMany({});
    await db.analyticsEvent.deleteMany({});
    return json({
      deleteSuccess: true,
    });
  }
  if (action === "set-settings") {
    const isPublicStr = form.get("public");
    const isPublic = isPublicStr === "true" || isPublicStr === "on";
    const ignorePage = form.get("ignore-page")?.toString() ?? "";
    let ignorePages = settings.ignorePages.split(",");
    if (ignorePage !== "" && !ignorePages.includes(ignorePage)) {
      ignorePages = [...ignorePages, ignorePage];
    }
    await db.analyticsSettings.update({
      where: { id: settings.id },
      data: {
        public: isPublic,
        ignorePages: ignorePages.join(","),
      },
    });
    return json({
      setSettingsSuccess: true,
    });
  }
  if (action === "remove-ignored-page") {
    const ignoredPage = form.get("ignored-page")?.toString() ?? "";
    let ignorePages = settings.ignorePages.split(",");
    if (ignorePages.includes(ignoredPage)) {
      ignorePages = ignorePages.filter((page) => page !== ignoredPage);
    }
    await db.analyticsSettings.update({
      where: { id: settings.id },
      data: {
        ignorePages: ignorePages.join(","),
      },
    });
    return json({
      setSettingsSuccess: true,
    });
  } else {
    return json({
      error: t("shared.invalidForm"),
    });
  }
};

export default function AdminAnalyticsOverviewRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isUpdatingSettings = navigation.state === "submitting" && navigation.formData?.get("action") === "set-settings";
  const rootData = useRootData();

  const formRef = useRef<HTMLFormElement>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  const [typeToConfirm, setTypeToConfirm] = useState<string>(data.isLocalDev ? "delete all analytics data" : "");
  const [isPublic, setIsPublic] = useState(data?.settings.public);

  useEffect(() => {
    if (!isUpdatingSettings) {
      formRef.current?.reset();
    }
  }, [isUpdatingSettings]);

  function removeIgnoredPage(item: string) {
    const form = new FormData();
    form.set("action", "remove-ignored-page");
    form.set("ignored-page", item);
    submit(form, { method: "post" });
  }

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "delete-all");
    submit(form, {
      method: "post",
    });
  }

  const textToType = `delete all analytics data`;
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("analytics.overview"),
            routePath: "/admin/analytics/overview",
          },
          {
            name: t("analytics.uniqueVisitors"),
            routePath: "/admin/analytics/visitors",
          },
          {
            name: t("analytics.pageViews"),
            routePath: "/admin/analytics/page-views",
          },
          {
            name: t("analytics.events"),
            routePath: "/admin/analytics/events",
          },
          {
            name: t("analytics.settings"),
            routePath: "/admin/analytics/settings",
          },
        ]}
      >
        <div className="space-y-6 p-4 sm:px-6 lg:col-span-9 lg:px-0">
          <SettingSection title="Preferences" description="Set your analytics preferences.">
            <Form ref={formRef} method="post">
              <input hidden readOnly name="action" value="set-settings" />
              <div className="space-y-2">
                <InputCheckboxWithDescription
                  name="public"
                  title={t("shared.public")}
                  description={
                    <div className="text-gray-600">
                      Share your stats on a public URL at{" "}
                      <a className="underline" target="_blank" rel="noreferrer" href={rootData.serverUrl + "/analytics"}>
                        {rootData.serverUrl + "/analytics"}
                      </a>
                    </div>
                  }
                  value={isPublic}
                  setValue={setIsPublic}
                />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Ingored pages</div>
                  <div className="space-y-1 rounded-md border border-gray-300 bg-gray-50 p-3">
                    {data.settings.ignorePages.length === 0 && <div className="text-xs text-gray-500">There are no ignored pages.</div>}
                    {data.settings.ignorePages
                      .split(",")
                      .filter((f) => f)
                      .map((item) => {
                        return (
                          <div key={item} className="group flex space-x-2 border-b border-gray-50 text-xs text-gray-600">
                            <div>{item}</div>
                            <button type="button" className="hidden text-xs text-red-500 underline group-hover:block" onClick={() => removeIgnoredPage(item)}>
                              {t("shared.remove")}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <InputText name="ignore-page" title="Add ignored page" defaultValue="" />
                </div>
                <div className="mt-3 flex items-center justify-end space-x-2 border-t border-gray-100 pt-3">
                  <LoadingButton type="submit" disabled={isUpdatingSettings}>
                    {t("shared.save")}
                  </LoadingButton>
                </div>
              </div>
            </Form>
          </SettingSection>

          <SettingSection title={t("analytics.danger.title")} description={t("analytics.danger.description")}>
            <div>
              <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                <p>{t("analytics.danger.reset.description")}</p>
              </div>
              <div className="mt-5 space-y-2">
                <div>
                  <InputText title={`Type "${textToType}" to confirm`} value={typeToConfirm} setValue={setTypeToConfirm} />
                </div>
                <div>
                  <ButtonPrimary disabled={typeToConfirm !== textToType} destructive={true} onClick={onDelete}>
                    {t("analytics.danger.reset.title")}
                  </ButtonPrimary>

                  {actionData?.deleteSuccess ? (
                    <p className="py-2 text-xs text-green-500" role="alert">
                      {t("analytics.deleted")}
                    </p>
                  ) : null}

                  {actionData?.deleteError ? (
                    <p className="py-2 text-xs text-rose-500" role="alert">
                      {actionData.deleteError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </SettingSection>
        </div>

        <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
      </IndexPageLayout>
    </>
  );
}
