import { db } from "~/utils/db.server";

export async function getTenantTypeEntity(where: { tenantTypeId: string | null; entityId: string }) {
  return await db.tenantTypeEntity.findFirst({
    where,
  });
}

export async function createTenantTypeEntity(data: { tenantTypeId: string | null; entityId: string; enabled: boolean }) {
  return await db.tenantTypeEntity.create({
    data: {
      tenantTypeId: data.tenantTypeId,
      entityId: data.entityId,
      enabled: data.enabled,
    },
  });
}

export async function updateTenantTypeEntity(where: { tenantTypeId: string | null; entityId: string }, data: { enabled?: boolean }) {
  return await db.tenantTypeEntity.updateMany({
    where,
    data,
  });
}

export async function deleteTenantTypeEntity(where: { tenantTypeId: string | null; entityId: string }) {
  return await db.tenantTypeEntity.deleteMany({
    where,
  });
}
