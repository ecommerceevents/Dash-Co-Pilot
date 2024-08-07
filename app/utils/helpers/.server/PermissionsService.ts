import { Prisma } from "@prisma/client";
import { redirect } from "remix-typedjson";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { RowAccess, RowAccessTypes } from "~/application/enums/entities/RowAccess";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { getMyGroups } from "~/utils/db/permissions/groups.db.server";
import { getPermissionName } from "~/utils/db/permissions/permissions.db.server";
import { findPermissionByUser, countUserPermission, findUserRolesByIds, getUserRoles } from "~/utils/db/permissions/userRoles.db.server";
import { getMyTenants } from "~/utils/db/tenants.db.server";
import { getTenantRelationshipsFromByUserTenants } from "~/utils/db/tenants/tenantRelationships.db.server";
import { getUserInfo } from "~/utils/session.server";

export async function getUserPermission({ userId, permissionName, tenantId }: { userId: string; permissionName: string; tenantId?: string | null }) {
  const permission = await getPermissionName(permissionName);
  if (!permission) {
    return { permission, userPermission: undefined };
  }
  // const userRoles = await getUserRoles(userId ?? undefined, tenantId ?? null);
  // let userPermission: Permission | undefined = undefined;
  // userRoles.forEach((userRole) => {
  //   userRole.role.permissions.forEach((rolePermission) => {
  //     if (rolePermission.permission.name === permissionName) {
  //       userPermission = rolePermission.permission;
  //     }
  //   });
  // });
  const userPermission = await findPermissionByUser(permissionName, userId, tenantId);
  return { permission, userPermission };
}

export async function verifyUserHasPermission(request: Request, permissionName: DefaultPermission, tenantId: string | null = null) {
  if (permissionName.startsWith("entity.")) {
    return true;
  }
  const userInfo = await getUserInfo(request);
  if (!userInfo.userId) {
    throw Error("Unauthorized");
  }
  const permission = await getPermissionName(permissionName);
  if (permission) {
    const userPermission = (await countUserPermission(userInfo.userId, tenantId, permissionName)) > 0;
    if (!userPermission) {
      if (tenantId) {
        // TODO: IMPROVE
        const myTenants = await getMyTenants(userInfo.userId);
        const childTenants = await getTenantRelationshipsFromByUserTenants(myTenants.map((f) => f.id));
        const currentTenantAsChild = childTenants.find((f) => f.toTenantId === tenantId);
        const existingPermission = currentTenantAsChild?.tenantTypeRelationship.permissions.find((f) => f.name === permissionName);
        if (existingPermission) {
          return true;
        }
        // TODO: END IMPROVE
        throw redirect(`/unauthorized/${permissionName}/${tenantId}/?redirect=${new URL(request.url).pathname}`);
      } else {
        throw redirect(`/unauthorized/${permissionName}?redirect=${new URL(request.url).pathname}`);
      }
    }
  }
  return true;
}

export async function getUserRowPermission(row: RowWithDetails, tenantId?: string | null, userId?: string): Promise<RowPermissionsDto> {
  const accessLevels: RowAccess[] = ["none"];

  let isOwner = false;
  if (tenantId === undefined && userId === undefined) {
    accessLevels.push("view");
  } else {
    isOwner = !!userId && userId === row.createdByUserId;
    if (tenantId) {
      const existing = row.permissions.find((f) => f.tenantId);
      if (existing) {
        accessLevels.push(existing.access as RowAccess);
      }
    } else if (userId) {
      if (row.createdByUserId === userId || row.createdByUserId === null) {
        accessLevels.push("delete");
      }
      const existing = row.permissions.find((f) => f.userId === userId);
      if (existing) {
        accessLevels.push(existing.access as RowAccess);
      }
    }
    if (tenantId !== undefined && userId) {
      const inRoles = row.permissions
        .filter((f) => f.roleId)
        .map((f) => f.roleId)
        .map((f) => f as string);
      if (inRoles.length > 0) {
        const userRoles = await findUserRolesByIds(userId, tenantId, inRoles);
        userRoles.forEach((userRole) => {
          const existing = row.permissions.find((f) => f.roleId === userRole.roleId);
          if (existing) {
            accessLevels.push(existing.access as RowAccess);
          }
        });
      }

      const inGroups = row.permissions
        .filter((f) => f.groupId)
        .map((f) => f.groupId)
        .map((f) => f as string);
      if (inGroups.length > 0) {
        const userGroups = await getMyGroups(userId, tenantId);
        userGroups.forEach((userGroup) => {
          const existing = row.permissions.find((f) => f.groupId === userGroup.id);
          if (existing) {
            accessLevels.push(existing.access as RowAccess);
          }
        });
      }
    }
  }

  let access: RowAccess | undefined = undefined;
  for (let idx = RowAccessTypes.length - 1; idx >= 0; idx--) {
    const accessType = RowAccessTypes[idx];
    if (accessLevels.includes(accessType)) {
      access = accessType;
      break;
    }
  }

  const rowPermissions: RowPermissionsDto = {
    canRead: isOwner || (access && access !== "none"),
    canComment: isOwner || access === "comment" || access === "edit" || access === "delete",
    canUpdate: isOwner || access === "edit" || access === "delete",
    canDelete: isOwner || access === "delete",
    isOwner,
  };
  return rowPermissions;
}

export type RowPermissionsFilter = Prisma.RowWhereInput | {};
export async function getRowPermissionsCondition({ tenantId, userId }: { tenantId?: string | null; userId?: string }) {
  const OR_CONDITIONS: Prisma.RowWhereInput[] = [];
  if (tenantId) {
    OR_CONDITIONS.push(...[{ permissions: { some: { tenantId } } }]);
    if (userId) {
      OR_CONDITIONS.push(...[{ createdByUserId: userId }, { permissions: { some: { userId } } }]);
    }
  } else {
    if (userId) {
      OR_CONDITIONS.push(...[{ createdByUserId: null }, { createdByUserId: userId }, { permissions: { some: { userId } } }]);
    }
  }
  if (tenantId !== undefined && userId) {
    const userRoles = await getUserRoles(userId, tenantId);
    userRoles.forEach((userRole) => {
      OR_CONDITIONS.push(...[{ permissions: { some: { roleId: userRole.roleId } } }]);
    });

    const userGroups = await getMyGroups(userId, tenantId);
    userGroups.forEach((userGroup) => {
      OR_CONDITIONS.push(...[{ permissions: { some: { groupId: userGroup.id } } }]);
    });
  }
  return {
    OR: OR_CONDITIONS,
  };
}
