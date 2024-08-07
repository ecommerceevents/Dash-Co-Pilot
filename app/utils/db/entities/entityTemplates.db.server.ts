import { db } from "~/utils/db.server";

export async function getEntityTemplates(entityId: string, { tenantId }: { tenantId: string | null }) {
  return await db.entityTemplate.findMany({
    where: { entityId, tenantId },
    orderBy: { entity: { order: "asc" } },
  });
}

export async function getEntityTemplate(id: string, { tenantId }: { tenantId: string | null }) {
  return await db.entityTemplate
    .findFirstOrThrow({
      where: { id, tenantId },
    })
    .catch(() => {
      return null;
    });
}

export async function createEntityTemplate(data: { tenantId: string | null; entityId: string; title: string; config: string }) {
  return await db.entityTemplate.create({
    data: {
      tenantId: data.tenantId,
      entityId: data.entityId,
      title: data.title,
      config: data.config,
    },
  });
}

export async function updateEntityTemplate(id: string, data: { title: string; config: string }) {
  return await db.entityTemplate.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntityTemplate(id: string) {
  return await db.entityTemplate.delete({
    where: { id },
  });
}
