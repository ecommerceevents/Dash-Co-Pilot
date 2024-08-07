import { useEffect } from "react";
import { json, redirect, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import UrlUtils from "~/utils/app/UrlUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getTranslations } from "~/locale/i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.analytics.view");
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/analytics") {
    return redirect("/admin/analytics/overview");
  }

  return json({
    title: `${t("analytics.title")} | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminAnalticsRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/analytics") {
      navigate("/admin/analytics/overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <Outlet />;
}
