import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { loadEntities } from "~/modules/rows/repositories/.server/EntitiesSingletonService";
import EntitiesSingleton from "~/modules/rows/repositories/EntitiesSingleton";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { createRowLog } from "~/utils/db/logs.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { ApiAccessValidation, validateApiKey } from "~/utils/services/apiService";
import { reportUsage } from "~/utils/services/.server/subscriptionService";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_GET_ALL] ${params.entity}`);
  const { t } = await time(getTranslations(request), "getTranslations");
  invariant(params.entity, "Expected params.entity");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const urlSearchParams = new URL(request.url).searchParams;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(params.entity!);
    const data = await time(
      RowsApi.getAll({
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        urlSearchParams,
        time,
      }),
      "RowsApi.getAll"
    );
    if (tenant && tenantApiKey) {
      await setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 200,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }

    let usage = undefined;
    if (tenantApiKey) {
      usage = {
        plan: t(tenantApiKey.usage?.title ?? "", { 0: tenantApiKey.usage?.value }),
        remaining: tenantApiKey.usage?.remaining,
      };
    }
    const entities = EntitiesSingleton.getInstance().getEntities();
    return json(
      {
        success: true,
        page: data.pagination?.page,
        total_pages: data.pagination?.totalPages,
        total_results: data.pagination?.totalItems,
        results: data.items.length,
        data: data.items.map((item) => {
          return ApiHelper.getApiFormatWithRelationships({
            entities,
            item,
          });
        }),
        usage,
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

// POST
export const action: ActionFunction = async ({ request, params }) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_POST] ${params.entity}`);
  invariant(params.entity, "Expected params.entity");
  const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(params.entity!);
    if (request.method !== "POST") {
      throw new Error("Method not allowed");
    }
    const jsonBody = await time(request.json(), "request.json");
    const rowValues = ApiHelper.getRowPropertiesFromJson(t, entity, jsonBody);
    const item = await time(
      RowsApi.create({
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        rowValues,
        time,
        request,
      }),
      "RowsApi.create"
    );
    if (tenant && tenantApiKey) {
      await setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 201,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }
    await time(
      createRowLog(request, {
        tenantId: tenant?.id ?? null,
        createdByApiKey: tenantApiKey?.apiKeyLog.apiKeyId,
        action: DefaultLogActions.Created,
        entity,
        item,
      }),
      "createRowLog"
    );
    return json(ApiHelper.getApiFormat(entity, item), {
      status: 201,
      headers: getServerTimingHeader(),
    });
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    if (apiAccessValidation?.tenantApiKey) {
      await setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status,
        startTime,
      });
    }
    return json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
};
