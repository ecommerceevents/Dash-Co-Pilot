import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputImage from "~/components/ui/input/InputImage";
import InputText from "~/components/ui/input/InputText";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { AppConfiguration, getAppConfiguration, getOrCreateAppConfiguration, updateAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { storeSupabaseFile } from "~/utils/integrations/supabaseService";
import { promiseHash } from "~/utils/promises/promiseHash";
import { defaultThemes } from "~/utils/theme/defaultThemes";
import InputSelect from "~/components/ui/input/InputSelect";
import clsx from "clsx";
import { useTypedActionData } from "remix-typedjson";
import { createUserSession, getUserInfo } from "~/utils/session.server";
import toast from "react-hot-toast";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  appConfiguration: AppConfiguration;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.settings.general.view");
  const appConfiguration = await getAppConfiguration({ request });
  const data: LoaderData = {
    title: `${t("settings.admin.general.title")} | ${process.env.APP_NAME}`,
    appConfiguration,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission(request, "admin.settings.general.update");
    await getOrCreateAppConfiguration({ request });

    const { name, logo, logoDarkMode, icon, iconDarkMode, favicon, theme } = {
      name: form.get("name")?.toString(),
      // url: form.get("url")?.toString(),
      logo: form.get("logo")?.toString(),
      logoDarkMode: form.get("logoDarkMode")?.toString(),
      icon: form.get("icon")?.toString(),
      iconDarkMode: form.get("iconDarkMode")?.toString(),
      favicon: form.get("favicon")?.toString(),
      theme: form.get("theme")?.toString(),
    };

    const { storedLogo, storedLogoDarkMode, storedIcon, storedIconDarkMode, storedFavicon } = await promiseHash({
      storedLogo: logo ? storeSupabaseFile({ bucket: "branding", content: logo, id: "logo" }) : Promise.resolve(""),
      storedLogoDarkMode: logoDarkMode ? storeSupabaseFile({ bucket: "branding", content: logoDarkMode, id: "logo-dark-mode" }) : Promise.resolve(""),
      storedIcon: icon ? storeSupabaseFile({ bucket: "branding", content: icon, id: "icon" }) : Promise.resolve(""),
      storedIconDarkMode: iconDarkMode ? storeSupabaseFile({ bucket: "branding", content: iconDarkMode, id: "icon-dark-mode" }) : Promise.resolve(""),
      storedFavicon: favicon ? storeSupabaseFile({ bucket: "branding", content: favicon, id: "favicon" }) : Promise.resolve(""),
    });

    const headScripts = form.get("headScripts")?.toString() ?? "";
    const bodyScripts = form.get("bodyScripts")?.toString() ?? "";

    await updateAppConfiguration({
      name,
      brandingLogo: storedLogo,
      brandingLogoDarkMode: storedLogoDarkMode,
      brandingIcon: storedIcon,
      brandingIconDarkMode: storedIconDarkMode,
      brandingFavicon: storedFavicon,
      theme,
      headScripts,
      bodyScripts,
    });
    if (theme !== userInfo.theme) {
      return createUserSession({ ...userInfo, theme });
    }
    return json({ success: t("shared.updated") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function AdminSettingsGeneral() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const actionData = useTypedActionData<{ success?: string; error?: string }>();

  const [logoLight, setLogoLight] = useState(data.appConfiguration.branding.logo ?? "");
  const [logoDarkMode, setLogoDarkMode] = useState(data.appConfiguration.branding.logoDarkMode ?? "");
  const [iconLight, setIconLight] = useState(data.appConfiguration.branding.icon ?? "");
  const [iconDarkMode, setIconDarkMode] = useState(data.appConfiguration.branding.iconDarkMode ?? "");
  const [favicon, setFavicon] = useState(data.appConfiguration.branding.favicon ?? "");

  const [canUpdate] = useState(getUserHasPermission(adminData, "admin.settings.general.update"));

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);
  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.general.title")}</h1>

        <Form method="post" className="mt-6 space-y-8">
          <input name="action" value="update" hidden readOnly />
          <InputGroup title="General">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-2">
                <InputText name="name" title="Application name" defaultValue={data.appConfiguration.app.name ?? ""} disabled={!canUpdate} required />
              </div>
              <div className="sm:col-span-2">
                <InputText name="url" title="URL" defaultValue={data.appConfiguration.app.url ?? ""} disabled required />
              </div>
              <div className="sm:col-span-2">
                <div className="w-full">
                  <InputSelect
                    name="theme"
                    title="Theme"
                    defaultValue={data.appConfiguration.app.theme ?? ""}
                    options={defaultThemes.map((item) => ({
                      name: item.name,
                      value: item.value,
                      component: (
                        <div className="flex items-center space-x-2">
                          <div
                            className={clsx(
                              `theme-${item.value}`,
                              " bg-primary text-primary inline-flex flex-shrink-0 items-center rounded-full text-xs font-medium"
                            )}
                          >
                            <svg className={clsx("h-2 w-2")} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                          </div>
                          <div>{item.name}</div>
                        </div>
                      ),
                    }))}
                  />
                </div>
              </div>
            </div>
          </InputGroup>

          <InputGroup title="Branding">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-3">
                <InputImage name="logo" title="Logo (Light Mode)" value={logoLight} setValue={setLogoLight} disabled={!canUpdate} />
              </div>
              <div className="sm:col-span-3">
                <InputImage
                  name="logoDarkMode"
                  title="Logo (Dark Mode)"
                  value={logoDarkMode}
                  setValue={setLogoDarkMode}
                  disabled={!canUpdate}
                  className="dark"
                />
              </div>
              {/* <div className="sm:col-span-6">
                <PreviewLogo />
              </div> */}
              <div className="sm:col-span-3">
                <InputImage name="icon" title="Icon" value={iconLight} setValue={setIconLight} disabled={!canUpdate} />
              </div>
              <div className="sm:col-span-3">
                <InputImage
                  name="iconDarkMode"
                  title="Icon (Dark Mode)"
                  value={iconDarkMode}
                  setValue={setIconDarkMode}
                  disabled={!canUpdate}
                  className="dark"
                />
              </div>
              {/* <div className="sm:col-span-6">
                <PreviewIcon />
              </div> */}
              <div className="sm:col-span-6">
                <InputImage name="favicon" title="Favicon" value={favicon} setValue={setFavicon} disabled={!canUpdate} />
              </div>
              {/* <div className="sm:col-span-6">
                <PreviewFavicon />
              </div> */}
            </div>
          </InputGroup>

          <InputGroup title="Scripts">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-3">
                <InputText
                  name="headScripts"
                  title="Head scripts"
                  defaultValue={data.appConfiguration.scripts.head ?? ""}
                  disabled={!canUpdate}
                  rows={10}
                  placeholder={`<head>
...
your scripts here
</head>`}
                />
              </div>
              <div className="sm:col-span-3">
                <InputText
                  name="bodyScripts"
                  title="Body scripts"
                  defaultValue={data.appConfiguration.scripts.body ?? ""}
                  disabled={!canUpdate}
                  rows={10}
                  placeholder={`<body>
...
your scripts here
</body>`}
                />
              </div>
            </div>
          </InputGroup>

          <div className="flex justify-end">
            <LoadingButton type="submit" disabled={!getUserHasPermission(adminData, "admin.settings.general.update")}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
