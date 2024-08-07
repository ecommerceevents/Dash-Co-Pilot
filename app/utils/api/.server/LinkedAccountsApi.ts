import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { getLinkedAccounts } from "../../db/linkedAccounts.db.server";
import { adminGetAllTenants, getTenantsInIds, getTenantUsersInTenantIds, TenantUserWithDetails, TenantWithDetails } from "../../db/tenants.db.server";

export namespace LinkedAccountsApi {
  export async function getAllAccounts(
    tenantId: string | null,
    options?: {
      includeCurrentTenant?: boolean;
    }
  ): Promise<TenantWithDetails[]> {
    if (tenantId === null) {
      return await adminGetAllTenants();
    }

    const linkedAccounts = await getLinkedAccounts(tenantId, LinkedAccountStatus.LINKED);
    const tenantIds: string[] = [];
    linkedAccounts.forEach((linkedAccount) => {
      if (linkedAccount.providerTenantId === tenantId) {
        tenantIds.push(linkedAccount.clientTenantId);
      } else {
        tenantIds.push(linkedAccount.providerTenantId);
      }
    });

    if (!options || options?.includeCurrentTenant) {
      tenantIds.push(tenantId);
    }

    return await getTenantsInIds(tenantIds);
  }
  export async function getAllUsers(
    tenantId: string,
    options?: {
      includeCurrentTenant?: boolean;
    }
  ): Promise<TenantUserWithDetails[]> {
    const linkedAccounts = await getLinkedAccounts(tenantId, LinkedAccountStatus.LINKED);
    const tenantIds: string[] = [];
    linkedAccounts.forEach((linkedAccount) => {
      if (linkedAccount.providerTenantId === tenantId) {
        tenantIds.push(linkedAccount.clientTenantId);
      } else {
        tenantIds.push(linkedAccount.providerTenantId);
      }
    });

    if (!options || options?.includeCurrentTenant) {
      tenantIds.push(tenantId);
    }

    return await getTenantUsersInTenantIds(tenantIds);
  }
}
