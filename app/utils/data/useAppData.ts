import { useMatches } from "@remix-run/react";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { TenantSimple } from "../db/tenants.db.server";
import { TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";
import { AppOrAdminData } from "./useAppOrAdminData";
import { TenantRelationshipWithDetails } from "../db/tenants/tenantRelationships.db.server";
import EntitiesSingleton from "~/modules/rows/repositories/EntitiesSingleton";

export type AppLoaderData = AppOrAdminData & {
  currentTenant: TenantSimple;
  mySubscription: TenantSubscriptionWithDetails | null;
  currentRole: TenantUserType;
  pendingInvitations: number;
  childTenants: TenantRelationshipWithDetails[];
};

export function useAppData(): AppLoaderData {
  const paths: string[] = ["routes/app.$tenant", "routes/app"];
  const appData = (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AppLoaderData;
  EntitiesSingleton.getInstance().setEntities(appData.entities);
  return appData;
}
