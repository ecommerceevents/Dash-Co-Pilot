import { useEffect } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import AppLayout from "~/components/app/AppLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { loadAdminData } from "~/utils/data/.server/adminData";
import ServerError from "~/components/ui/errors/ServerError";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { getTranslations } from "~/locale/i18next.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin");
  const { t } = await getTranslations(request);
  const data = await loadAdminData({ request, t }, time);
  return json(data, { headers: getServerTimingHeader() });
};

export default function AdminRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:hide"]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin") {
      navigate("/admin/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
