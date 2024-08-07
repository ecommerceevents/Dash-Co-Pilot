import { RowAccess } from "~/application/enums/entities/RowAccess";
import { createRowPermission, deleteRowPermissionById, getRowPermissions, updateRowPermission } from "../../db/permissions/rowPermissions.db.server";
import { DefaultVisibility } from "~/application/dtos/shared/DefaultVisibility";
import { getLinkedAccounts } from "../../db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { Row } from "@prisma/client";

export namespace RowPermissionsApi {
  export async function shareWithDefault(row: Row, defaultVisibility: DefaultVisibility) {
    if (defaultVisibility === "tenant" && row.tenantId) {
      await shareWithTenant(row, row.tenantId, "edit");
    } else if (defaultVisibility === "linkedAccounts" && row.tenantId) {
      await shareWithTenant(row, row.tenantId, "edit");
      const tenants = await getLinkedAccounts(row.tenantId, LinkedAccountStatus.LINKED);
      await Promise.all(
        tenants.map(async (tenant) => {
          if (row.tenantId === tenant.clientTenantId) {
            return await shareWithTenant(row, tenant.providerTenantId, "comment");
          }
          return await shareWithTenant(row, tenant.clientTenantId, "comment");
        })
      );
    } else if (defaultVisibility === "public") {
      return await shareWithPublic(row, "view");
    }
  }
  export async function share(row: Row, data: { type: "tenant" | "user" | "role" | "group" | "public"; id?: string; access: RowAccess }) {
    const permission = {
      tenantId: data.type === "tenant" ? data.id : null,
      roleId: data.type === "role" ? data.id : null,
      groupId: data.type === "group" ? data.id : null,
      userId: data.type === "user" ? data.id : null,
      public: data.type === "public",
      access: data.access,
    };
    if (data.type !== "public" && !permission.tenantId && !permission.roleId && !permission.groupId && !permission.userId) {
      throw Error("Invalid permission");
    }
    const permissions = await getRowPermissions(row.id);
    const existing = permissions.find(
      (f) =>
        f.tenantId === permission.tenantId &&
        f.roleId === permission.roleId &&
        f.groupId === permission.groupId &&
        f.userId === permission.userId &&
        f.public === permission.public
    );
    if (data.type === "user" && data.id === row?.createdByUserId) {
      return;
    } else if (existing) {
      return existing;
    }
    const create = await createRowPermission({
      rowId: row.id,
      ...permission,
    });

    return create;
  }
  export async function shareWithTenant(row: Row, tenantId: string, access: RowAccess) {
    return await share(row, {
      type: "tenant",
      id: tenantId,
      access,
    });
  }
  export async function shareWithUser(row: Row, userId: string, access: RowAccess) {
    return await share(row, {
      type: "user",
      id: userId,
      access,
    });
  }
  export async function shareWithRole(row: Row, roleId: string, access: RowAccess) {
    return await share(row, {
      type: "role",
      id: roleId,
      access,
    });
  }
  export async function shareWithGroup(row: Row, groupId: string, access: RowAccess) {
    return await share(row, {
      type: "group",
      id: groupId,
      access,
    });
  }
  export async function shareWithPublic(row: Row, access: RowAccess) {
    return await share(row, {
      type: "public",
      access,
    });
  }
  export async function setAccess(id: string, access: RowAccess) {
    return await updateRowPermission(id, {
      access,
    });
  }
  export async function del(id: string) {
    return await deleteRowPermissionById(id);
  }
}
