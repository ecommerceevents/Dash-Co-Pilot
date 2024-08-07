import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { RowRelationshipsApi } from "~/utils/api/.server/RowRelationshipsApi";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { ApiAccessValidation, validateApiKey } from "~/utils/services/apiService";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Relationships_API_POST] ${params.entity}`);
  invariant(params.id, "Expected params.id");
  // const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    const { tenant, userId } = apiAccessValidation;
    const relationship = await RowRelationshipsApi.getRelationship(params.id!, {
      tenantId: tenant?.id ?? null,
      userId,
      time,
    });
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    return json(
      {
        relationship: {
          id: relationship.id,
          parent: ApiHelper.getApiFormat(relationship.parent.entity, relationship.parent.item),
          child: ApiHelper.getApiFormat(relationship.child.entity, relationship.child.item),
        },
      },
      { status: 200, headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    if (apiAccessValidation?.tenantApiKey) {
      await setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status: 400,
        startTime,
      });
    }
    return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
};

// POST
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Relationships_API_POST] ${params.entity}`);
  invariant(params.id, "Expected params.id");
  // const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, params), "validateApiKey");
    const { tenant, userId } = apiAccessValidation;
    if (request.method !== "DELETE") {
      throw new Error("Method not allowed");
    }
    const relationship = await RowRelationshipsApi.getRelationship(params.id!, {
      tenantId: tenant?.id ?? null,
      userId,
      time,
    });
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    const item = await time(
      RowRelationshipsApi.deleteRelationshipById(params.id!, {
        tenantId: tenant?.id ?? null,
        userId,
        time,
      }),
      "RowRelationshipsApi.deleteRelationshipById"
    );
    return json({ deleted: item }, { status: 200, headers: getServerTimingHeader() });
  } catch (e: any) {
    if (apiAccessValidation?.tenantApiKey) {
      await setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status: 400,
        startTime,
      });
    }
    return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
};
