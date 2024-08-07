import { useMatches } from "@remix-run/react";
import { TenantSimple } from "../db/tenants.db.server";
import { UserWithoutPassword } from "../db/users.db.server";
import { AppLoaderData } from "./useAppData";
import { AdminLoaderData } from "./useAdminData";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { GroupWithDetails } from "../db/permissions/groups.db.server";
import { OnboardingSessionWithDetails } from "~/modules/onboarding/db/onboardingSessions.db.server";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { EntityGroupWithDetails } from "../db/entities/entityGroups.db.server";
import { TenantTypeWithDetails } from "../db/tenants/tenantTypes.db.server";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";

export type AppOrAdminData = {
  // i18n: Record<string, Language>;
  user: UserWithoutPassword;
  myTenants: TenantSimple[];
  currentTenant: TenantSimple | null;
  allRoles: { id: string; name: string; description: string }[];
  // roles: UserRoleWithPermission[];
  permissions: DefaultPermission[];
  entities: EntityWithDetails[];
  entityGroups: EntityGroupWithDetails[];
  isSuperUser: boolean;
  isSuperAdmin: boolean;
  myGroups: GroupWithDetails[];
  lng?: string;
  onboardingSession: OnboardingSessionWithDetails | null;
  tenantTypes: TenantTypeWithDetails[];
  credits?: PlanFeatureUsageDto | undefined;
};

export function useAppOrAdminData(): AppOrAdminData {
  const appPaths: string[] = ["routes/app.$tenant", "routes/app"];
  const appData = (useMatches().find((f) => appPaths.includes(f.id.toLowerCase()))?.data ?? {}) as AppLoaderData;

  const adminPaths: string[] = ["routes/admin"];
  const adminData = (useMatches().find((f) => adminPaths.includes(f.id.toLowerCase()))?.data ?? {}) as AdminLoaderData;
  const appOrAdminData = appData.user ? appData : adminData;
  return appOrAdminData;
}
