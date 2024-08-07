import { EntityTag, RowTag } from "@prisma/client";
import { db } from "~/utils/db.server";

export type RowTagWithDetails = RowTag & {
  tag: EntityTag;
};

export async function getRowTags(rowId: string): Promise<RowTagWithDetails[]> {
  return await db.rowTag.findMany({
    where: {
      rowId,
    },
    include: {
      tag: true,
    },
  });
}

export async function getRowTagById(id: string): Promise<RowTagWithDetails | null> {
  return await db.rowTag.findUnique({
    where: {
      id,
    },
    include: {
      tag: true,
    },
  });
}

export async function getRowTag(rowId: string, value: string): Promise<RowTagWithDetails | null> {
  return await db.rowTag.findFirst({
    where: {
      rowId,
      tag: {
        value,
      },
    },
    include: {
      tag: true,
    },
  });
}

export async function getRowTagByIds(rowId: string, tagId: string): Promise<RowTagWithDetails | null> {
  return await db.rowTag.findFirst({
    where: {
      rowId,
      tagId,
    },
    include: {
      tag: true,
    },
  });
}

export async function createRowTag(data: { rowId: string; tagId: string }) {
  return await db.rowTag.create({
    data,
  });
}

export async function deleteRowTag(id: string) {
  return await db.rowTag.delete({
    where: {
      id,
    },
  });
}

export async function deleteRowTags(rowId: string, tagId: string) {
  return await db.rowTag.deleteMany({
    where: {
      rowId,
      tagId,
    },
  });
}
