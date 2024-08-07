import { useMatches } from "@remix-run/react";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { getLinkedAccountsCount } from "../db/linkedAccounts.db.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { Params } from "react-router";
import { getTenantIdFromUrl } from "../services/.server/urlService";

export type DashboardLoaderData = {
  users: number;
  storage: number;
  pendingInvitations: number;
};

export function useDashboardData(): DashboardLoaderData {
  return (useMatches().find((f) => f.id === "routes/app.$tenant/dashboard")?.data ?? {}) as DashboardLoaderData;
}

export async function loadDashboardData(params: Params) {
  const tenantId = await getTenantIdFromUrl(params);
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(tenantId),
    // clients: await getClientLinksCount(tenantId),
    // providers: await getProviderLinksCount(tenantId),
    // employees: await getEmployeesCount(tenantId),
    // contracts: await getMonthlyContractsCount(tenantId),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getLinkedAccountsCount(tenantId, [LinkedAccountStatus.PENDING]),
  };
  return data;
}
