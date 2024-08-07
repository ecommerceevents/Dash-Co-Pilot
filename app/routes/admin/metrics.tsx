import { useEffect } from "react";
import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import UrlUtils from "~/utils/app/UrlUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.metrics.view");
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/metrics") {
    return redirect("/admin/metrics/summary");
  }

  return json({
    title: `Metrics | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminApiRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/metrics") {
      navigate("/admin/metrics/summary");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <Outlet />;
}
