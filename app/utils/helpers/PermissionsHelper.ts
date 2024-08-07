import { Entity } from "@prisma/client";
import { AppOrAdminData } from "../data/useAppOrAdminData";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { RowPermissionsWithDetails } from "../db/permissions/rowPermissions.db.server";

export function getEntityPermissions(entity: Entity): { name: string; description: string }[] {
  return [
    { name: getEntityPermission(entity, "view"), description: `View ${entity.name} page` },
    { name: getEntityPermission(entity, "read"), description: `View ${entity.name} records` },
    { name: getEntityPermission(entity, "create"), description: `Create ${entity.name}` },
    { name: getEntityPermission(entity, "update"), description: `Update ${entity.name}` },
    { name: getEntityPermission(entity, "delete"), description: `Delete ${entity.name}` },
  ];
}

export function getEntityPermission(entity: { name: string }, permission: "view" | "read" | "create" | "update" | "delete"): DefaultPermission {
  return `entity.${entity.name}.${permission}` as DefaultPermission;
}

export function getUserHasPermission(appOrAdminData: AppOrAdminData, permission: DefaultPermission) {
  if (permission.startsWith("entity.")) {
    return true;
  }
  if (appOrAdminData?.permissions === undefined) {
    return true;
  }
  if (appOrAdminData.isSuperAdmin) {
    return true;
  }
  return appOrAdminData.permissions.includes(permission);
}

export function getRowPermissionsObjects(permissions: RowPermissionsWithDetails[]) {
  return permissions
    .filter((f) => f !== null)
    .map((item) => {
      return {
        tenant: item.tenant ? { id: item.tenant.id, name: item.tenant.name } : null,
        role: item.role ? { id: item.role.id, name: item.role.name } : null,
        group: item.group ? { id: item.group.id, name: item.group.name } : null,
        user: item.user ? { id: item.user.id, email: item.user.email } : null,
      };
    })
    .filter((f) => f !== null);
}

export function getRowPermissionsDescription(
  permissions: {
    tenant: { id: string; name: string } | null;
    role: { id: string; name: string } | null;
    group: { id: string; name: string } | null;
    user: { id: string; email: string } | null;
  }[]
) {
  return permissions
    .filter((f) => f !== null)
    .map((item) => {
      if (item.tenant) {
        return `Account '${item.tenant.name}'`;
      } else if (item.role) {
        return `Role '${item.role.name}'`;
      } else if (item.group) {
        return `Group '${item.group.name}'`;
      } else if (item.user) {
        return `User '${item.user.email}'`;
      }
      return "";
    })
    .filter((f) => f !== null);
}
