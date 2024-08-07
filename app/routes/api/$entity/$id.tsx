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
import EventsService from "~/modules/events/services/.server/EventsService";
import { ApiAccessValidation, validateApiKey } from "~/utils/services/apiService";
import { reportUsage } from "~/utils/services/.server/subscriptionService";
import { RowDeletedDto } from "~/modules/events/dtos/RowDeletedDto";
import RowHelper from "~/utils/helpers/RowHelper";
import { RowUpdatedDto } from "~/modules/events/dtos/RowUpdatedDto";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_GET] ${params.entity}`);
  const { t } = await time(getTranslations(request), "getTranslations");
  invariant(params.entity, "Expected params.entity");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;

    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(params.entity!);
    const data = await time(
      RowsApi.get(params.id!, {
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        time,
      }),
      "RowsApi.get"
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
        data: ApiHelper.getApiFormatWithRelationships({
          entities,
          item: data.item,
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
      await setApiKeyLogStatus(apiAccessValidation.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status,
        startTime,
      });
    }
    return json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
};

// PUT OR DELETE
export const action: ActionFunction = async ({ request, params }) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_API_${request.method}] ${params.entity}`);
  invariant(params.entity, "Expected params.entity");
  const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(params.entity!);
    const tenantId = tenant?.id ?? null;
    const data = await time(
      RowsApi.get(params.id!, {
        entity,
        tenantId,
        userId,
        time,
      }),
      "RowsApi.get"
    );
    if (!data.item) {
      throw Error(t("shared.notFound"));
    }
    const existing = data.item;
    let jsonBody = "{}";
    if (request.method === "DELETE") {
      await time(
        RowsApi.del(params.id!, {
          entity,
          tenantId,
          userId,
          time,
        }),
        "RowsApi.del"
      );
      await EventsService.create({
        request,
        event: "row.deleted",
        tenantId: tenant?.id ?? null,
        userId: null,
        data: {
          id: existing.id,
          title: RowHelper.getTextDescription({ entity, item: existing, t }),
          row: ApiHelper.getApiFormat(entity, existing),
          entity: { id: entity.id, name: entity.name, slug: entity.slug, title: t(entity.title) },
          apiKey: {
            id: tenantApiKey?.apiKey.id ?? "",
            alias: tenantApiKey?.apiKey.alias ?? "",
          },
        } satisfies RowDeletedDto,
      });
    } else if (request.method === "PUT") {
      jsonBody = await time(request.json(), "request.json");
      const rowValues = ApiHelper.getRowPropertiesFromJson(t, entity, jsonBody, existing);
      const updated = await time(
        RowsApi.update(params.id!, {
          entity,
          tenantId: tenant?.id ?? null,
          userId,
          rowValues,
        }),
        "RowsApi.update"
      );
      await EventsService.create({
        request,
        event: "row.updated",
        tenantId: tenant?.id ?? null,
        userId: null,
        data: {
          id: existing.id,
          title: RowHelper.getTextDescription({ entity, item: existing, t }),
          entity: { id: entity.id, name: entity.name, slug: entity.slug, title: t(entity.title) },
          row: RowHelper.getDiff({ entity, before: existing, after: updated }),
          apiKey: {
            id: tenantApiKey?.apiKey.id ?? "",
            alias: tenantApiKey?.apiKey.alias ?? "",
          },
        } satisfies RowUpdatedDto,
      });
    } else {
      throw Error("Method not allowed");
    }
    const status = request.method === "DELETE" ? 204 : 200;
    if (tenant && tenantApiKey) {
      await setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }
    await time(
      createRowLog(request, {
        tenantId: tenant?.id ?? null,
        createdByApiKey: tenantApiKey?.apiKeyLog.apiKeyId,
        action: request.method === "DELETE" ? DefaultLogActions.Deleted : DefaultLogActions.Updated,
        entity,
        details: JSON.stringify(jsonBody),
        item: request.method === "PUT" ? existing : null,
      }),
      "createRowLog"
    );
    if (request.method === "DELETE") {
      return json({ success: true }, { status, headers: getServerTimingHeader() });
    } else {
      const data = await time(
        RowsApi.get(params.id!, {
          entity,
          time,
        }),
        "RowsApi.get"
      );
      return json(ApiHelper.getApiFormat(entity, data.item), {
        status,
        headers: getServerTimingHeader(),
      });
    }
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
