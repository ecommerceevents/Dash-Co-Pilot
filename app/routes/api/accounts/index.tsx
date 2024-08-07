import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { findEntityByName } from "~/utils/db/entities/entities.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import TenantHelper from "~/utils/helpers/TenantHelper";
import { getActiveTenantSubscriptions } from "~/utils/services/.server/subscriptionService";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_GET] ${params.entity}`);
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  try {
    if (!process.env.API_ACCESS_TOKEN || apiKeyFromHeaders !== process.env.API_ACCESS_TOKEN) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenants = await time(adminGetAllTenants(), "adminGetAllTenants");
    const tenantSettingsEntity = await findEntityByName({ tenantId: null, name: "tenantSettings" });
    const data = await Promise.all(
      tenants.map(async (tenant) => {
        const subscriptions = await getActiveTenantSubscriptions(tenant.id);
        return TenantHelper.apiFormat({ tenant, subscriptions, tenantSettingsEntity, t });
      })
    );
    return json(
      {
        success: true,
        total_results: data.length,
        data,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
};
