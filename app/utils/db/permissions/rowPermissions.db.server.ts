import { RowPermission } from "@prisma/client";
import { db } from "~/utils/db.server";

export type RowPermissionsWithDetails = RowPermission & {
  tenant: { id: string; name: string } | null;
  role?: { id: string; name: string } | null;
  group?: { id: string; name: string } | null;
  user?: { id: string; email: string } | null;
};
export async function getRowPermissions(rowId: string): Promise<RowPermissionsWithDetails[]> {
  return await db.rowPermission.findMany({
    where: {
      rowId,
    },
    include: {
      tenant: { select: { id: true, name: true } },
      role: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
      user: { select: { id: true, email: true } },
    },
  });
}

export async function getRowPermissionByTenant(rowId: string, tenantId?: string | null) {
  return await db.rowPermission.findFirst({
    where: {
      rowId,
      tenantId,
    },
  });
}

export async function getRowPermissionByGroups(rowId: string, groups: string[]) {
  return await db.rowPermission.findFirst({
    where: {
      rowId,
      groupId: {
        in: groups,
      },
    },
  });
}

export async function getRowPermissionByRoles(rowId: string, roles: string[]) {
  return await db.rowPermission.findFirst({
    where: {
      rowId,
      roleId: {
        in: roles,
      },
    },
  });
}

export async function getRowPermissionByUsers(rowId: string, users: string[]) {
  return await db.rowPermission.findFirst({
    where: {
      rowId,
      userId: {
        in: users,
      },
    },
  });
}

export async function createRowPermission(data: {
  rowId: string;
  tenantId?: string | null;
  roleId?: string | null;
  groupId?: string | null;
  userId?: string | null;
  public?: boolean | null;
  access: string;
}) {
  return await db.rowPermission.create({
    data,
  });
}

export async function updateRowPermission(
  id: string,
  data: {
    access: string;
  }
) {
  return await db.rowPermission.update({
    where: { id },
    data,
  });
}

export async function deleteRowPermission(rowId: string) {
  return await db.rowPermission.deleteMany({
    where: {
      rowId,
    },
  });
}

export async function deleteRowPermissionById(id: string) {
  return await db.rowPermission.delete({
    where: {
      id,
    },
  });
}
