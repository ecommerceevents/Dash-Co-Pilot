import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useAppData } from "~/utils/data/useAppData";
import { DashboardLoaderData, loadDashboardData } from "~/utils/data/useDashboardData";
import { getTranslations } from "~/locale/i18next.server";
import { getAppDashboardStats } from "~/utils/services/appDashboardService";
import ProfileBanner from "~/components/app/ProfileBanner";
import { DashboardStats } from "~/components/ui/stats/DashboardStats";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { Stat } from "~/application/dtos/stats/Stat";
import InputSelect from "~/components/ui/input/InputSelect";
import PeriodHelper, { defaultPeriodFilter, PeriodFilters } from "~/utils/helpers/PeriodHelper";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { promiseHash } from "~/utils/promises/promiseHash";
import { getTenant } from "~/utils/db/tenants.db.server";
import { Fragment } from "react";
import { getTenantRelationshipsFrom, TenantRelationshipWithDetails } from "~/utils/db/tenants/tenantRelationships.db.server";
import LinkedAccountsTable from "~/components/core/linkedAccounts/LinkedAccountsTable";
import { useTypedLoaderData } from "remix-typedjson";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
export { serverTimingHeaders as headers };

type LoaderData = DashboardLoaderData & {
  title: string;
  stats: Stat[];
  tenantRelationships: TenantRelationshipWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "app.$tenant.dashboard");
  let { t } = await time(getTranslations(request), "getTranslations");
  const tenantId = await time(getTenantIdFromUrl(params), "getTenantIdFromUrl");
  const tenant = await time(getTenant(tenantId), "getTenant");

  const { stats, dashboardData } = await time(
    promiseHash({
      stats: getAppDashboardStats({ t, tenant, gte: PeriodHelper.getGreaterThanOrEqualsFromRequest({ request }) }),
      dashboardData: loadDashboardData(params),
    }),
    "app.$tenant.dashboard.details"
  );

  const tenantRelationships = await getTenantRelationshipsFrom(tenantId);
  const data: LoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${process.env.APP_NAME}`,
    ...dashboardData,
    stats,
    tenantRelationships,
  };
  return json(data, { headers: getServerTimingHeader() });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function DashboardRoute() {
  const { t } = useTranslation();
  const appData = useAppData();
  const data = useTypedLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main className="relative z-0 h-screen flex-1 pb-8">
      {/*Page header */}
      <div className="hidden bg-white shadow md:block lg:border-t lg:border-gray-200">
        <ProfileBanner user={appData.user} />
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8">
        {getUserHasPermission(appData, "app.dashboard.view") ? (
          <Fragment>
            {data.tenantRelationships.length > 0 && (
              <div className="space-y-3 overflow-x-auto">
                <div className="flex items-center justify-between space-x-2">
                  <h3 className="flex-grow font-medium leading-4 text-gray-900">Linked Accounts</h3>
                </div>
                <LinkedAccountsTable items={data.tenantRelationships} />
              </div>
            )}

            {data.stats.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between space-x-2">
                  <h3 className="flex-grow font-medium leading-4 text-gray-900">{t("app.dashboard.summary")}</h3>
                  <div>
                    <InputSelect
                      className="w-44"
                      name="period"
                      value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
                      options={PeriodFilters.map((f) => {
                        return {
                          value: f.value,
                          name: t(f.name),
                        };
                      })}
                      setValue={(value) => {
                        if (value) {
                          searchParams.set("period", value?.toString() ?? "");
                        } else {
                          searchParams.delete("period");
                        }
                        setSearchParams(searchParams);
                      }}
                    />
                  </div>
                </div>
                <DashboardStats items={data.stats} />
              </div>
            )}
          </Fragment>
        ) : (
          <div className="font-medium">You don't have permission to view the dashboard.</div>
        )}
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
