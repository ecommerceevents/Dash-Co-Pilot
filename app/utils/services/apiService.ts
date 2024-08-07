import { Params } from "react-router";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { ApiKeySimple, createApiKeyLog, getApiKey, setApiKeyLogStatus } from "../db/apiKeys.db.server";
import { getSimpleEntityBySlug } from "../db/entities/entities.db.server";
import { getActiveTenantSubscriptions, getPlanFeatureUsage } from "./.server/subscriptionService";
import { getMyTenants, getTenantByIdOrSlug } from "../db/tenants.db.server";
import { ApiKeyLog } from "@prisma/client";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { createUniqueTenantIpAddress } from "../db/tenants/tenantIpAddress.db.server";
import { getClientIPAddress } from "../server/IpUtils";
import jwt from "jsonwebtoken";
import { getUser } from "../db/users.db.server";
import NotificationService from "~/modules/notifications/services/.server/NotificationService";
import { getBaseURL } from "../url.server";
import { getOpenInvoices } from "../stripe.server";
import { getTranslations } from "~/locale/i18next.server";
import { rateLimitByKey } from "./rateLimitService";

async function setApiError(request: Request, params: Params, error: string, status: number, apiKeyLogId?: string) {
  if (apiKeyLogId) {
    await setApiKeyLogStatus(apiKeyLogId, {
      error,
      status,
      startTime: null,
    });
  } else {
    await createApiKeyLog(request, {
      apiKeyId: null,
      tenantId: null,
      endpoint: new URL(request.url).pathname,
      error,
      status,
    });
  }
  throw Error(error);
}

export type ApiAccessValidation = {
  userId?: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    deactivatedReason: string | null;
  } | null;
  tenantApiKey?: {
    apiKey: ApiKeySimple;
    apiKeyLog: ApiKeyLog;
    usage: PlanFeatureUsageDto | undefined;
  };
};

export async function validateApiKey(request: Request, params: Params): Promise<ApiAccessValidation> {
  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];
    let userId = "";
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
    } catch (e: any) {
      console.log("Invalid authorization token: " + e.message);
      throw Error("Invalid authorization token: " + e.message);
    }
    const user = await getUser(userId);
    if (!user) {
      console.log("User not found");
      throw Error("Unauthorized");
    }
    let tenantId = request.headers.get("X-Account-Id") ?? request.headers.get("X-Tenant-Id");
    if (!tenantId) {
      if (!user.admin) {
        console.log("No X-Account-Id provided");
        throw Error("No X-Account-Id provided");
      } else {
        tenantId = null;
      }
    }
    if (tenantId !== null) {
      const userTenants = await getMyTenants(user.id);
      if (!userTenants.find((t) => t.id === tenantId || t.slug === tenantId)) {
        console.log(`User ${user.email} is not a member of ${tenantId}`);
        throw Error("Unauthorized");
      }
    }
    const tenant = await getTenantByIdOrSlug(tenantId ?? "");
    return {
      userId,
      tenant: tenantId === null ? null : tenant,
    };
  }
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  if (!apiKeyFromHeaders) {
    if (!request.url.endsWith("page-views") && !request.url.endsWith("events")) {
      console.log("No X-API-Key header or Authorization token provided", request.url);
    }
    throw Error("No X-API-Key header or Authorization token provided");
  }
  const searchParams = new URL(request.url).searchParams;
  if (apiKeyFromHeaders === process.env.API_ACCESS_TOKEN && process.env.API_ACCESS_TOKEN.toString().length > 0) {
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) {
      return { tenant: null };
    }
    const tenant = await getTenantByIdOrSlug(tenantId);
    if (!tenant) {
      console.log("Account not found: " + tenantId);
      throw Error("Account not found: " + tenantId);
    }
    return { tenant };
  }
  if (searchParams.get("tenantId")) {
    console.log("You cannot use tenantId with an API key");
    throw Error("You cannot use tenantId with an API key");
  }
  return validateTenantApiKey(request, params);
}

export async function validateTenantApiKey(request: Request, params: Params): Promise<ApiAccessValidation> {
  const { t } = await getTranslations(request);
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  const apiKey = await getApiKey(apiKeyFromHeaders);
  if (!apiKey) {
    throw await setApiError(request, params, "Invalid API Key", 401);
  }
  const tenantSubscription = await getActiveTenantSubscriptions(apiKey.tenantId);

  const rateLimitResult = await rateLimitByKey({
    apiKey: apiKey.id,
    tenantId: apiKey.tenantId,
    tenantSubscription,
  });

  const apiKeyLog = await createApiKeyLog(request, {
    apiKeyId: apiKey.id,
    tenantId: apiKey.tenantId,
    endpoint: new URL(request.url).pathname,
  });

  if (rateLimitResult.error) {
    throw await setApiError(request, params, "Rate limit exceeded: " + rateLimitResult.error, 429, apiKeyLog.id);
  }

  createUniqueTenantIpAddress({
    ip: getClientIPAddress(request) ?? "Unknown",
    fromUrl: new URL(request.url).pathname,
    tenantId: apiKey.tenantId,
    apiKeyId: apiKey.id,
  });

  if (apiKey.tenant.deactivatedReason) {
    throw await setApiError(request, params, "Account deactivated: " + apiKey.tenant.deactivatedReason, 403, apiKeyLog.id);
  }
  if (!apiKey.active) {
    throw await setApiError(request, params, "Inactive API Key", 400, apiKeyLog.id);
  }
  if (apiKey.expires && apiKey?.expires < new Date()) {
    throw await setApiError(request, params, "Expired API Key", 400, apiKeyLog.id);
  }

  const usage = await getPlanFeatureUsage(apiKey.tenantId, DefaultFeatures.API, tenantSubscription);
  if (usage && !usage.enabled) {
    await NotificationService.sendToRoles({
      channel: "admin-users",
      tenantId: null,
      notification: {
        message: `${apiKey.tenant.name} (${apiKey.tenant.slug}) API error. ${t(usage.message)}`,
        action: {
          url: getBaseURL(request) + "/app/" + apiKey.tenant.slug + "/settings/api/keys",
        },
      },
    });
    throw await setApiError(request, params, t(usage.message), 429, apiKeyLog.id);
  }
  if (tenantSubscription && tenantSubscription.stripeCustomerId) {
    const openInvoices = await getOpenInvoices(tenantSubscription.stripeCustomerId);
    if (openInvoices.data.length > 0) {
      const invoicesDescription = openInvoices.data.map((invoice) => `Invoice #${invoice.number} - ${invoice.total} ${invoice.currency}`).join("\n");
      await NotificationService.sendToRoles({
        channel: "admin-users",
        tenantId: null,
        notification: {
          message: `${apiKey.tenant.name} (${apiKey.tenant.slug}) API error. You have open invoices: ${invoicesDescription}`,
          action: {
            url: getBaseURL(request) + "/app/" + apiKey.tenant.slug + "/settings/api/keys",
          },
        },
      });
      throw await setApiError(request, params, "You have open invoices: " + invoicesDescription, 402, apiKeyLog.id);
    }
  }

  return {
    tenant: apiKey.tenant,
    tenantApiKey: {
      apiKey,
      apiKeyLog,
      usage,
    },
  };
}

export async function getEntityApiKeyFromRequest(request: Request, params: Params) {
  const { tenant, tenantApiKey } = await validateApiKey(request, params);
  const entity = await getSimpleEntityBySlug(params.entity!);
  if (!tenantApiKey) {
    return { tenant, entity };
  }
  const { apiKey, apiKeyLog, usage } = tenantApiKey!;
  if (!entity) {
    throw await setApiError(request, params, "Invalid entity", 400, apiKeyLog.id);
  }
  if (!entity.hasApi) {
    throw await setApiError(request, params, `${entity.name} does not have the API enabled`, 400, apiKeyLog.id);
  }
  const permission = apiKey.entities.find((f) => f.entityId === entity.id);
  if (!permission) {
    throw await setApiError(request, params, `API Key does not have access to ${entity.slug}`, 403, apiKeyLog.id);
  }
  if (request.method === "GET" && !permission.read) {
    throw new Error(`API Key does not have permission to read this entity`);
  } else if (request.method === "POST" && !permission.create) {
    throw new Error(`API Key does not have permission to create this entity`);
  } else if (request.method === "PUT" && !permission.update) {
    throw new Error(`API Key does not have permission to update this entity`);
  } else if (request.method === "DELETE" && !permission.delete) {
    throw new Error(`API Key does not have permission to delete this entity`);
  }
  return {
    entity,
    tenant: apiKey.tenant,
    apiKeyLog,
    usage,
  };
}
