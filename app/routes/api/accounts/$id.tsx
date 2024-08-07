import { LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { findEntityByName } from "~/utils/db/entities/entities.db.server";
import { getTenant, getTenantByIdOrSlug } from "~/utils/db/tenants.db.server";
import TenantHelper from "~/utils/helpers/TenantHelper";
import { getActiveTenantSubscriptions } from "~/utils/services/.server/subscriptionService";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_GET] ${params.entity}`);
  invariant(params.id, "Expected tenant.id");
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  try {
    if (!process.env.API_ACCESS_TOKEN || apiKeyFromHeaders !== process.env.API_ACCESS_TOKEN) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantSimple = await time(getTenantByIdOrSlug(params.id!), "getTenant");
    if (!tenantSimple) {
      return json({ error: "Not found" }, { status: 404 });
    }
    const tenant = await time(getTenant(tenantSimple.id), "getTenant");
    if (!tenant) {
      return json({ error: "Not found" }, { status: 404 });
    }
    const subscriptions = await getActiveTenantSubscriptions(tenant.id);
    const tenantSettingsEntity = await findEntityByName({ tenantId: null, name: "tenantSettings" });
    return json(
      {
        success: true,
        data: TenantHelper.apiFormat({ tenant, subscriptions, tenantSettingsEntity, t }),
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
};
