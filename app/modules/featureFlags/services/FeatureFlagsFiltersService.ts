import { AnalyticsUniqueVisitor, FeatureFlagFilter } from "@prisma/client";
import { FeatureFlagsFilterType } from "../dtos/FeatureFlagsFilterTypes";
import { getAnalyticsSession } from "~/utils/analyticsCookie.server";
import { getUserInfo } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { UserWithoutPassword, getUser } from "~/utils/db/users.db.server";
import { getUserRoles } from "~/utils/db/permissions/userRoles.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { Params } from "react-router";
import { getActiveTenantSubscriptions } from "~/utils/services/.server/subscriptionService";
import { countTenantApiKeyLogs } from "~/utils/db/apiKeys.db.server";

async function matches({
  request,
  params,
  userAnalyticsId,
  filter,
}: {
  request: Request;
  params: Params;
  filter: FeatureFlagFilter;
  userAnalyticsId?: string;
}) {
  if (!userAnalyticsId) {
    const analyticsSession = await getAnalyticsSession(request);
    userAnalyticsId = analyticsSession.get("userAnalyticsId") as string | undefined;
  }

  if (!userAnalyticsId) {
    // eslint-disable-next-line no-console
    console.error("[FeatureFlags] Error: userAnalyticsId is not set. It should be set in the analytics cookie.");
    return false;
  }

  const userInfo = await getUserInfo(request);

  let uniqueVisitor: AnalyticsUniqueVisitor | null = null;
  if (filter.type.startsWith("analytics.")) {
    uniqueVisitor = await db.analyticsUniqueVisitor.findUnique({
      where: { cookie: userAnalyticsId },
    });
    if (!uniqueVisitor) {
      return false;
    }
  }

  let user: UserWithoutPassword | null = null;
  if (filter.type.startsWith("user.")) {
    user = await getUser(userInfo.userId);
    if (!user) {
      return false;
    }
  }

  const type: FeatureFlagsFilterType = filter.type as FeatureFlagsFilterType;
  switch (type) {
    case "env": {
      return process.env.NODE_ENV === filter.value;
    }
    case "percentage": {
      const percentage = Number(filter.value);
      if (isNaN(percentage)) {
        return false;
      }
      const MAX_HASH_VALUE = 0xffffffff; // Max 32-bit unsigned integer value
      const hashValue = hashCode(userAnalyticsId); // Implement a consistent hashing function
      const userPercentage = (hashValue / MAX_HASH_VALUE) * 100;

      return userPercentage <= percentage;
    }
    case "session.darkMode": {
      const isTrue = filter.value === "true";
      const isDarkMode = userInfo.lightOrDarkMode === "dark";
      return isTrue === isDarkMode;
    }
    case "session.language": {
      return userInfo.lng === filter.value;
    }
    case "session.logged": {
      const isTrue = filter.value === "true";
      const logged = userInfo.userId !== null && !!userInfo.userId;
      return isTrue === logged;
    }
    case "page.startsWith": {
      const pathname = new URL(request.url).pathname;
      return pathname.startsWith(filter.value as string);
    }
    case "analytics.via": {
      return uniqueVisitor?.via === filter.value;
    }
    case "analytics.httpReferrer": {
      return uniqueVisitor?.httpReferrer === filter.value;
    }
    case "analytics.browser": {
      return uniqueVisitor?.browser === filter.value;
    }
    case "analytics.os": {
      return uniqueVisitor?.os === filter.value;
    }
    case "analytics.source": {
      return uniqueVisitor?.source === filter.value;
    }
    case "analytics.medium": {
      return uniqueVisitor?.medium === filter.value;
    }
    case "analytics.campaign": {
      return uniqueVisitor?.campaign === filter.value;
    }
    case "analytics.countryCode": {
      return uniqueVisitor?.country === filter.value;
    }
    case "analytics.city": {
      return uniqueVisitor?.city === filter.value;
    }
    case "user.createdAfter": {
      const date = new Date(filter.value as string);
      if (isNaN(date.getTime())) {
        return false;
      }
      return user!.createdAt.getTime() >= date.getTime();
    }
    case "user.createdBefore": {
      const date = new Date(filter.value as string);
      if (isNaN(date.getTime())) {
        return false;
      }
      return user!.createdAt.getTime() <= date.getTime();
    }
    case "user.is": {
      return user!.id === filter.value;
    }
    case "user.language": {
      return user!.locale === filter.value;
    }
    case "user.roles.contains":
    case "user.roles.notContains": {
      const userRoles = await getUserRoles(user!.id);
      if (type === "user.roles.contains") {
        return userRoles.find((f) => f.role.name === filter.value) !== undefined;
      } else if (type === "user.roles.notContains") {
        return userRoles.find((f) => f.role.name === filter.value) === undefined;
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown onboarding filter: ${type}`);
      }
    }
    case "tenant.is": {
      const tenantId = await getTenantIdOrNull({ request, params });
      return tenantId === filter.value;
    }
    case "tenant.subscription.products.has":
    case "tenant.subscription.active": {
      const tenantId = await getTenantIdOrNull({ request, params });
      const tenantSubscription = await getActiveTenantSubscriptions(tenantId ?? "");
      if (type === "tenant.subscription.products.has") {
        return tenantSubscription?.products.find((f) => f.subscriptionProductId === filter.value) !== undefined;
      } else if (type === "tenant.subscription.active") {
        const isTrue = filter.value === "true";
        const isActive = tenantSubscription?.products && tenantSubscription?.products.length > 0;
        return isTrue === isActive;
      }
      return false;
    }
    case "tenant.api.used": {
      const isTrue = filter.value === "true";
      const tenantId = await getTenantIdOrNull({ request, params });
      const apiKeyLogs = await countTenantApiKeyLogs(tenantId ?? "");
      if (isTrue) {
        return apiKeyLogs > 0;
      } else {
        return apiKeyLogs === 0;
      }
    }
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown feature flag filter: ${type}`);
  }
}

function hashCode(str: string) {
  const FNV_OFFSET_BASIS = 2166136261;
  const FNV_PRIME = 16777619;

  let hash = FNV_OFFSET_BASIS;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash *= FNV_PRIME;
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
}

export default {
  matches,
};
