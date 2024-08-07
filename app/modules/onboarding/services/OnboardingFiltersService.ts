import { OnboardingFilter } from "@prisma/client";
import { i18nConfig } from "~/locale/i18n";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { countTenantApiKeyLogs } from "~/utils/db/apiKeys.db.server";
import { getUserRoles } from "~/utils/db/permissions/userRoles.db.server";
import { getTenantUsers } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getActiveTenantSubscriptions } from "~/utils/services/.server/subscriptionService";
import { OnboardingFilterType } from "../dtos/OnboardingFilterTypes";

async function matches({ userId, tenantId, filter }: { userId: string; tenantId: string | null; filter: OnboardingFilter }) {
  const type: OnboardingFilterType = filter.type as OnboardingFilterType;
  const value = filter.value;
  if (type.startsWith("tenant") && tenantId === null) {
    return false;
  }
  switch (type) {
    case "admin.portal":
      return tenantId === null;
    case "user.is":
      return userId === value;
    case "user.language":
      const locale = (await getUser(userId))?.locale;
      const found = i18nConfig.supportedLngs.find((f) => f === locale);
      if (found) {
        return found === value;
      }
      return !locale && (!value || value === "en");
    case "user.firstName.notSet":
      return !(await getUser(userId))?.firstName;
    case "user.lastName.notSet":
      return !(await getUser(userId))?.lastName;
    case "user.avatar.notSet":
      return !(await getUser(userId))?.avatar;
    case "user.roles.contains":
    case "user.roles.notContains":
      const userRoles = await getUserRoles(userId);
      if (type === "user.roles.contains") {
        return userRoles.find((f) => f.role.name === value) !== undefined;
      } else if (type === "user.roles.notContains") {
        return userRoles.find((f) => f.role.name === value) === undefined;
      } else {
        throw new Error(`Unknown onboarding filter: ${type}`);
      }
    case "tenant.portal":
      return tenantId !== null;
    case "tenant.is":
      return tenantId === value;
    case "tenant.members.hasOne":
      return (await getTenantUsers(tenantId)).length === 1;
    case "tenant.members.hasMany":
      return (await getTenantUsers(tenantId)).length > 1;
    case "tenant.subscription.products.has":
    case "tenant.subscription.active":
    case "tenant.subscription.inactive":
      const tenantSubscription = await getActiveTenantSubscriptions(tenantId ?? "");
      if (type === "tenant.subscription.products.has") {
        return tenantSubscription?.products.find((f) => f.subscriptionProductId === value) !== undefined;
      } else if (type === "tenant.subscription.active") {
        return tenantSubscription?.products && tenantSubscription?.products.length > 0;
      } else if (type === "tenant.subscription.inactive") {
        return tenantSubscription === null || tenantSubscription?.products.length === 0;
      } else {
        throw new Error(`Unknown onboarding filter: ${type}`);
      }
    case "tenant.api.used":
    case "tenant.api.notUsed":
      const apiKeyLogs = await countTenantApiKeyLogs(tenantId ?? "");
      if (type === "tenant.api.used") {
        return apiKeyLogs > 0;
      } else {
        return apiKeyLogs === 0;
      }
    case "tenant.user.entity.hasCreated":
    case "tenant.user.entity.hasNotCreated":
      try {
        const rowsCreated = await RowsApi.count({
          entity: { id: value ?? "" },
          tenantId: tenantId ?? "",
          userId,
        });
        if (type === "tenant.user.entity.hasCreated") {
          return rowsCreated > 0;
        } else if (type === "tenant.user.entity.hasNotCreated") {
          return rowsCreated === 0;
        } else {
          throw new Error(`Unknown onboarding filter: ${type}`);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        return false;
      }
    default:
      throw new Error(`Unknown onboarding filter: ${type}`);
  }
}

export default {
  matches,
};
