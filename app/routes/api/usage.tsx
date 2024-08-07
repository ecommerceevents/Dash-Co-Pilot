import { json, LoaderFunctionArgs } from "@remix-run/node";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { ApiAccessValidation, validateTenantApiKey } from "~/utils/services/apiService";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `api.usage`);
  const { t } = await time(getTranslations(request), "getTranslations");

  const startTime = performance.now();
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  try {
    apiAccessValidation = await validateTenantApiKey(request, params);
    const { tenantApiKey } = apiAccessValidation;
    if (!tenantApiKey) {
      throw Error("Invalid API key");
    }

    await setApiKeyLogStatus(tenantApiKey?.apiKeyLog.id, {
      status: 200,
      startTime,
    });
    return json(
      {
        plan: t(tenantApiKey.usage?.title ?? "", { 0: tenantApiKey.usage?.value }),
        remaining: tenantApiKey.usage?.type === SubscriptionFeatureLimitType.INCLUDED ? undefined : tenantApiKey.usage?.remaining,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    if (apiAccessValidation?.tenantApiKey) {
      await setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status,
        startTime,
      });
    }
    return json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
};
