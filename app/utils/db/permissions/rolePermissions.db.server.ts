import { db } from "../../db.server";
import { getPermissionName } from "./permissions.db.server";
import { getRoleByName } from "./roles.db.server";

export async function getAllRolePermissions() {
  return await db.rolePermission.findMany({
    include: {
      permission: true,
    },
  });
}

export async function createRolePermission(data: { roleId: string; permissionId: string }) {
  const existing = await db.rolePermission.findFirst({
    where: {
      roleId: data.roleId,
      permissionId: data.permissionId,
    },
  });
  if (existing) {
    return existing;
  }
  return await db.rolePermission.create({
    data,
  });
}

export async function setRolePermissions(roleId: string, permissionNames: string[]) {
  await db.rolePermission.deleteMany({
    where: { roleId },
  });

  permissionNames.map(async (name) => {
    const permission = await getPermissionName(name);
    if (permission) {
      await db.rolePermission.create({
        data: {
          roleId,
          permissionId: permission.id,
        },
      });
    }
  });
}

export async function setPermissionRoles(permissionId: string, roleNames: string[]) {
  await db.rolePermission.deleteMany({
    where: { permissionId },
  });

  roleNames.map(async (name) => {
    const role = await getRoleByName(name);
    if (role) {
      await db.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId,
        },
      });
    }
  });
}

export async function deleteRolePermission(roleId: string, permissionId: string) {
  return await db.rolePermission.deleteMany({
    where: { roleId, permissionId },
  });
}

export async function deleteRolePermissionById(id: string) {
  return await db.rolePermission.delete({
    where: { id },
  });
}
