import { Permission, TenantType, TenantTypeRelationship } from "@prisma/client";
import { db } from "~/utils/db.server";

export type TenantTypeRelationshipWithDetails = TenantTypeRelationship & {
  fromType: TenantType | null;
  toType: TenantType | null;
  permissions: Permission[];
};
export async function getAllTenantTypeRelationships(): Promise<TenantTypeRelationshipWithDetails[]> {
  return await db.tenantTypeRelationship.findMany({
    include: {
      permissions: true,
      fromType: true,
      toType: true,
    },
  });
}

export async function getTenantTypeRelationship({
  fromTypeId,
  toTypeId,
}: {
  fromTypeId: string | null;
  toTypeId: string | null;
}): Promise<TenantTypeRelationshipWithDetails | null> {
  return await db.tenantTypeRelationship.findFirst({
    where: {
      fromTypeId,
      toTypeId,
    },
    include: {
      permissions: true,
      fromType: true,
      toType: true,
    },
  });
}

export async function getTenantTypeRelationshipById(id: string): Promise<TenantTypeRelationshipWithDetails | null> {
  return await db.tenantTypeRelationship.findUnique({
    where: {
      id,
    },
    include: {
      permissions: true,
      fromType: true,
      toType: true,
    },
  });
}

export async function createTenantTypeRelationship(data: { fromTypeId: string | null; toTypeId: string | null }) {
  return await db.tenantTypeRelationship.create({
    data: {
      fromTypeId: data.fromTypeId,
      toTypeId: data.toTypeId,
    },
  });
}

export async function updateTenantTypeRelationship(
  id: string,
  data: {
    fromTypeId?: string | null;
    toTypeId?: string | null;
    canCreate?: boolean;
  }
) {
  return await db.tenantTypeRelationship.update({
    where: { id: id },
    data: {
      fromTypeId: data.fromTypeId,
      toTypeId: data.toTypeId,
      canCreate: data.canCreate,
    },
  });
}

export async function deleteTenantTypeRelationship(id: string) {
  return await db.tenantTypeRelationship.delete({
    where: { id: id },
  });
}

export async function addTenantTypeRelationshipPermissions(id: string, data: { permissionIds: string[] }) {
  return await db.tenantTypeRelationship.update({
    where: { id: id },
    data: {
      permissions: {
        connect: data.permissionIds.map((id) => ({ id })),
      },
    },
  });
}

export async function removeTenantTypeRelationshipPermissions(id: string, data: { permissionIds: string[] }) {
  return await db.tenantTypeRelationship.update({
    where: { id: id },
    data: {
      permissions: {
        disconnect: data.permissionIds.map((id) => ({ id })),
      },
    },
  });
}
