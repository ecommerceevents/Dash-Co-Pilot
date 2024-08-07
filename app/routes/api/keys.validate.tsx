import { ActionFunctionArgs, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { ApiAccessValidation, validateTenantApiKey } from "~/utils/services/apiService";

// POST
export const action = async ({ request, params }: ActionFunctionArgs) => {
  // eslint-disable-next-line no-console
  console.log("Validating API key");
  if (request.method !== "POST") {
    throw new Error("Method not allowed");
  }
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
        remaining: tenantApiKey.usage?.remaining,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    if (apiAccessValidation?.tenantApiKey) {
      await setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status: 400,
        startTime,
      });
    }
    return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
};
