import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CookieConsentSettings from "~/components/cookies/CookieConsentSettings";
import CookiesList from "~/components/cookies/CookiesList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import PreviewIcon from "~/components/ui/icons/PreviewIcon";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import UnderConstruction from "~/components/ui/misc/UnderConstruction";
import OpenModal from "~/components/ui/modals/OpenModal";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { AppConfiguration, getAppConfiguration, getOrCreateAppConfiguration, updateAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  appConfiguration: AppConfiguration;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.settings.cookies.view");
  const appConfiguration = await getAppConfiguration({ request });
  const data: LoaderData = {
    title: `${t("settings.admin.cookies.title")} | ${process.env.APP_NAME}`,
    appConfiguration,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.settings.cookies.update");
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "update") {
    await getOrCreateAppConfiguration({ request });
    const settings = await updateAppConfiguration({
      cookiesEnabled: form.get("enabled") === "on" || form.get("enabled") === "true",
    });
    // TODO
    return json({ settings });
  } else if (action === "cookie-create") {
    // TODO
    return json({});
  } else if (action === "cookie-edit") {
    // TODO
    return json({});
  } else if (action === "cookie-delete") {
    // TODO
    return json({});
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function AdminSettingsCookies() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const submit = useSubmit();

  const [canUpdate] = useState(getUserHasPermission(adminData, "admin.settings.internationalization.update"));
  const [enabled, setEnabled] = useState(data.appConfiguration.cookies.enabled);

  const [showCookieSettingsModal, setShowCookieSettingsModal] = useState(false);

  function onChangeEnabled(value: boolean) {
    setEnabled(value);
    const form = new FormData();
    form.set("action", "update");
    form.set("enabled", value.toString());
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      {showCookieSettingsModal && (
        <OpenModal onClose={() => setShowCookieSettingsModal(false)}>
          <CookieConsentSettings onUpdated={() => setShowCookieSettingsModal(false)} />
        </OpenModal>
      )}

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex justify-between space-x-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.cookies.title")}</h1>
          <div className="flex h-9 items-center space-x-2">
            <ButtonSecondary onClick={() => setShowCookieSettingsModal(true)}>
              <PreviewIcon className="h-4 w-4" />
              <div>{t("shared.preview")}</div>
            </ButtonSecondary>
            <ButtonPrimary to="new" disabled={!getUserHasPermission(adminData, "admin.settings.cookies.create")}>
              {t("shared.new")}
            </ButtonPrimary>
          </div>
        </div>

        <InputCheckboxWithDescription
          name="enabled"
          value={enabled}
          setValue={(e) => onChangeEnabled(Boolean(e))}
          title="Enable cookie consent"
          description="Users need to accept or decline cookies to close the consent banner."
          disabled={!canUpdate}
        />

        <UnderConstruction title="TODO: Cookies (Add used cookies)" />

        <div>
          <CookiesList editing={true} />
        </div>
      </div>
    </div>
  );
}
