import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { useEffect } from "react";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import TabsVertical from "~/components/ui/tabs/TabsVertical";
import { useTranslation } from "react-i18next";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.roles.view", tenantId);

  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"));
  }

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminAccountUsersFromTenant() {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="mx-auto max-w-5xl space-y-2 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-2">
          <TabsVertical
            tabs={[
              {
                name: t("models.user.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"),
              },
              {
                name: t("models.role.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/roles"),
              },
              {
                name: t("models.permission.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/permissions"),
              },
            ]}
          />
        </div>
        <div className="lg:col-span-10">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
