import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { Form, useParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData } from "remix-typedjson";
import { toast } from "react-hot-toast";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ServerError from "~/components/ui/errors/ServerError";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import { createPortal, getPortalByDomain, getPortalBySubdomain } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import FormHelper from "~/utils/helpers/FormHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { useRootData } from "~/utils/data/useRootData";
import JsonPropertyValuesInput from "~/modules/jsonProperties/components/JsonPropertyValuesInput";
import JsonPropertiesUtils from "~/modules/jsonProperties/utils/JsonPropertiesUtils";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.enabled) {
    throw json({ error: "Portals are not enabled" }, { status: 400 });
  }
  const data: LoaderData = {
    metatags: [{ title: `${t("shared.new")} ${t("models.portal.object")} | ${process.env.APP_NAME}` }],
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export let action = async ({ request, params }: ActionFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const userInfo = await getUserInfo(request);

  const form = await request.formData();
  const action = form.get("action");
  if (action === "create") {
    const subdomain = UrlUtils.slugify(form.get("subdomain")?.toString() ?? "");
    const domain = form.get("domain")?.toString().toLowerCase().trim();
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const isPublished = FormHelper.getBoolean(form, "isPublished");
    const themeColor = form.get("themeColor")?.toString();
    const themeScheme = form.get("themeScheme")?.toString();
    // const seoTitle = form.get("seoTitle")?.toString();
    // const seoDescription = form.get("seoDescription")?.toString();
    const seoImage = form.get("seoImage")?.toString();

    let isValidSubdomainSyntax = /^[a-z0-9-]+$/i.test(subdomain);
    if (!isValidSubdomainSyntax) {
      return json({ error: "Invalid subdomain" }, { status: 400 });
    }
    const existingSubdomain = await getPortalBySubdomain(subdomain);
    if (existingSubdomain) {
      return json({ error: "Subdomain taken" }, { status: 400 });
    }
    const existingDomain = domain ? await getPortalByDomain(domain) : null;
    if (existingDomain) {
      return json({ error: "Domain taken" }, { status: 400 });
    }

    const appConfiguration = await getAppConfiguration({ request });
    const metadata = JsonPropertiesUtils.getValuesFromForm({
      form,
      properties: appConfiguration.portals?.metadata || [],
      prefix: "metadata",
    });

    // throw json({ error: JSON.stringify(metadata, null, 2) }, { status: 400 });

    const item = await createPortal({
      tenantId,
      userId: userInfo.userId,
      subdomain,
      domain: domain || null,
      title,
      isPublished: isPublished || true,
      stripeAccountId: null,
      metadata,
      themeColor: themeColor || null,
      themeScheme: themeScheme || null,
      seoTitle: title,
      seoDescription: description,
      seoImage: seoImage || null,
      seoThumbnail: null,
      seoTwitterCreator: null,
      seoTwitterSite: null,
      seoKeywords: null,
      authRequireEmailVerification: false,
      authRequireOrganization: false,
      authRequireName: false,
      analyticsSimpleAnalytics: false,
      analyticsPlausibleAnalytics: false,
      analyticsGoogleAnalyticsTrackingId: null,
      brandingLogo: null,
      brandingLogoDarkMode: null,
      brandingIcon: null,
      brandingIconDarkMode: null,
      brandingFavicon: null,
      affiliatesRewardfulApiKey: null,
      affiliatesRewardfulUrl: null,
    });

    return redirect(UrlUtils.getModulePath(params, `portals/${item.subdomain}`));
  }
};

export default function () {
  const { t } = useTranslation();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [item, setItem] = useState({
    title: "",
    subdomain: "",
    domain: "",
  });

  useEffect(() => {
    const subdomain = UrlUtils.slugify(item.title);
    if (item.subdomain !== subdomain) {
      setItem({ ...item, subdomain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.title]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <NewPageLayout
      title={`${t("models.portal.actions.new.title")}`}
      menu={[
        {
          title: t("models.portal.plural"),
          routePath: UrlUtils.getModulePath(params, "portals"),
        },
        {
          title: t("shared.new"),
        },
      ]}
    >
      <Form method="post">
        <input type="hidden" name="action" value="create" readOnly hidden />
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <InputText
                ref={mainInput}
                autoFocus
                name="title"
                title={t("models.portal.title")}
                value={item.title}
                setValue={(e) => setItem({ ...item, title: e.toString() })}
                required
              />
              <InputText
                name="subdomain"
                title={t("models.portal.subdomain")}
                value={item.subdomain}
                setValue={(e) => setItem({ ...item, subdomain: e.toString() })}
                required
                className="rounded-r-none"
                button={
                  <div className="rounded rounded-l-none border border-l-0 bg-gray-100 px-3 py-1">
                    <kbd className="border-border text-muted-foreground inline-flex items-center justify-center px-1 text-center font-sans text-xs font-medium">
                      .{rootData.appConfiguration.app.domain}
                    </kbd>
                  </div>
                }
                onBlur={() => setItem({ ...item, subdomain: UrlUtils.slugify(item.subdomain) })}
              />

              {portalsConfig?.metadata && <JsonPropertyValuesInput prefix="metadata" properties={portalsConfig?.metadata} attributes={{}} />}
            </div>

            {/* {portalsConfig?.domains?.enabled && (
              <InputText name="domain" title={t("models.portal.domain")} value={item.domain} setValue={(e) => setItem({ ...item, domain: e.toString() })} />
            )} */}
          </div>
          <div className="flex justify-end">
            <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
          </div>
        </div>
      </Form>
    </NewPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
