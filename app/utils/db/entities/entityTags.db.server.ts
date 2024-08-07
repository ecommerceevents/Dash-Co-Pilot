import { EntityTag } from "@prisma/client";
import { db } from "~/utils/db.server";

export async function getEntityTags(entityId: string): Promise<EntityTag[]> {
  return await db.entityTag.findMany({
    where: {
      entityId,
    },
  });
}

export async function getEntityTagById(id: string): Promise<EntityTag | null> {
  return await db.entityTag.findUnique({
    where: {
      id,
    },
  });
}

export async function getEntityTag(entityId: string, value: string): Promise<EntityTag | null> {
  return await db.entityTag.findFirst({
    where: {
      entityId,
      value,
    },
  });
}

export async function getEntityTagByEntityName(entityName: string, value: string): Promise<EntityTag | null> {
  return await db.entityTag.findFirst({
    where: {
      entity: { name: entityName },
      value,
    },
  });
}

export async function createEntityTag(data: { entityId: string; color: number; value: string }) {
  return await db.entityTag.create({
    data,
  });
}

export async function updateEntityTag(id: string, data: { color?: number; value?: string }) {
  return await db.entityTag.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntityTag(id: string) {
  return await db.entityTag.delete({
    where: {
      id,
    },
  });
}
