import { Permission, Role, RolePermission, UserRole } from "@prisma/client";
import { db } from "../../db.server";
import { cachified, clearCacheKey } from "~/utils/cache.server";

export type UserRoleWithPermission = UserRole & {
  role: Role & { permissions: (RolePermission & { permission: Permission })[] };
};

export async function getUserRole(userId: string, roleId: string, tenantId?: string | null) {
  return await db.userRole.findFirst({
    where: {
      userId,
      roleId,
      tenantId,
    },
  });
}

export async function getUserRoleInTenant(userId: string, tenantId: string, roleName: string) {
  return await db.userRole.findFirst({
    where: {
      userId,
      role: {
        name: roleName,
      },
      tenantId,
    },
  });
}

export async function getUserRoleInAdmin(userId: string, roleName: string) {
  return await cachified({
    key: `userRole:${userId}:${roleName}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.userRole.findFirst({
        where: {
          userId,
          role: {
            name: roleName,
          },
          tenantId: null,
        },
      }),
  });
}

export async function getUserRoles(userId: string, tenantId?: string | null): Promise<UserRoleWithPermission[]> {
  return await db.userRole.findMany({
    where: {
      userId,
      tenantId,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
    orderBy: {
      role: {
        order: "asc",
      },
    },
  });
}

export async function getPermissionsByUser(userId: string, tenantId: string | null): Promise<string[]> {
  const userRoles = await cachified({
    key: `userRoles:${userId}:${tenantId}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.userRole.findMany({
        where: { userId, tenantId },
        include: { role: { include: { permissions: { include: { permission: { select: { name: true } } } } } } },
      }),
  });
  const roles: string[] = [];
  const names: string[] = [];
  userRoles.forEach((userRoles) => {
    if (!roles.includes(userRoles.role.name)) {
      roles.push(userRoles.role.name);
    }
    userRoles.role.permissions.forEach((permission) => {
      if (!names.includes(permission.permission.name)) {
        names.push(permission.permission.name);
      }
    });
  });
  // console.log({
  //   userId,
  //   tenantId,
  //   roles,
  //   permissions: names,
  // });
  return names;
}

export async function findPermissionByUser(persmissionName: string, userId: string, tenantId?: string | null): Promise<string | null> {
  const userRoles = await db.userRole.findMany({
    where: { userId, tenantId, role: { permissions: { some: { permission: { name: persmissionName } } } } },
    include: { role: { include: { permissions: { include: { permission: { select: { name: true } } } } } } },
  });
  const roles: string[] = [];
  const names: string[] = [];
  userRoles.forEach((userRoles) => {
    if (!roles.includes(userRoles.role.name)) {
      roles.push(userRoles.role.name);
    }
    userRoles.role.permissions.forEach((permission) => {
      if (!names.includes(permission.permission.name)) {
        names.push(permission.permission.name);
      }
    });
  });
  // console.log({
  //   userId,
  //   tenantId,
  //   roles,
  //   permissions: names,
  // });
  return names.length > 0 ? names[0] : null;
}

export async function countUserPermission(userId: string, tenantId: string | null, permissionName: string): Promise<number> {
  const normal = await db.permission.count({
    where: {
      name: permissionName,
      inRoles: { some: { role: { users: { some: { userId, tenantId } } } } },
    },
  });
  if (normal > 0) {
    return normal;
  }
  return 0;
}

export async function findUserRolesByIds(userId: string, tenantId: string | null, roleIds: string[]): Promise<UserRole[]> {
  return await db.userRole.findMany({
    where: {
      userId,
      tenantId,
      roleId: {
        in: roleIds,
      },
    },
  });
}

export async function getUsersRolesInTenant(tenantId: string) {
  return await db.userRole.findMany({
    where: {
      tenantId,
    },
    include: {
      role: true,
      user: true,
    },
  });
}

export async function createUserRole(userId: string, roleId: string, tenantId: string | null = null) {
  const existing = await getUserRole(userId, roleId, tenantId);
  if (existing) {
    return existing;
  }
  return await db.userRole
    .create({
      data: {
        userId,
        roleId,
        tenantId,
      },
    })
    .then((item) => {
      clearCacheKey(`userRoles:${userId}:${tenantId}`);
      return item;
    });
}

export async function createUserRoles(userId: string, roles: { id: string; tenantId: string | null }[]) {
  const uniqueTenantIds = [...new Set(roles.map((role) => role.tenantId))];
  return await db.userRole
    .createMany({
      data: roles.map((role) => ({
        userId,
        roleId: role.id,
        tenantId: role.tenantId,
      })),
    })
    .then((item) => {
      uniqueTenantIds.forEach((tenantId) => {
        clearCacheKey(`userRoles:${userId}:${tenantId}`);
      });
      return item;
    });
}

export async function deleteUserRole(userId: string, roleId: string, tenantId: string | null = null) {
  return await db.userRole
    .deleteMany({
      where: {
        userId,
        roleId,
      },
    })
    .then((item) => {
      clearCacheKey(`userRoles:${userId}:${tenantId}`);
      return item;
    });
}

export async function deleteAllUserRoles(userId: string, type: string) {
  return await db.userRole.deleteMany({
    where: {
      userId,
      role: {
        type,
      },
    },
  });
}
