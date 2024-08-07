import { EntityRelationship } from "@prisma/client";
import { db } from "../../db.server";
import { EntityViewWithDetails } from "./entityViews.db.server";
import EntityViewModelHelper from "~/utils/helpers/models/EntityViewModelHelper";
import EntityModelHelper from "~/utils/helpers/models/EntityModelHelper";

export type EntityRelationshipWithDetails = EntityRelationship & {
  parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null };
  child: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null };
  childEntityView: EntityViewWithDetails | null;
  parentEntityView: EntityViewWithDetails | null;
};

export type EntityRelationshipWithCount = EntityRelationshipWithDetails & {
  _count: { rows: number };
};

export async function getAllEntityRelationships(): Promise<EntityRelationshipWithDetails[]> {
  return await db.entityRelationship.findMany({
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
    },
  });
}
export async function findEntityRelationship({
  parentId,
  childId,
  title,
  notIn,
}: {
  parentId: string;
  childId: string;
  title: string | null;
  notIn?: string[];
}): Promise<EntityRelationshipWithCount | null> {
  return await db.entityRelationship.findFirst({
    where: {
      OR: [
        { parentId, childId },
        { parentId: childId, childId: parentId },
      ],
      title,
      id: {
        notIn,
      },
    },
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
      _count: true,
    },
  });
}

export async function getEntityRelationships(entityId: string): Promise<EntityRelationshipWithDetails[]> {
  return await db.entityRelationship.findMany({
    where: {
      OR: [
        {
          parentId: entityId,
        },
        {
          childId: entityId,
        },
      ],
    },
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
    },
    orderBy: [{ order: "asc" }],
  });
}

export async function getEntityRelationshipsWithCount(entityId: string): Promise<EntityRelationshipWithCount[]> {
  return await db.entityRelationship.findMany({
    where: {
      OR: [{ parentId: entityId }, { childId: entityId }],
    },
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
      _count: true,
    },
    orderBy: [{ order: "asc" }],
  });
}

export async function getEntitiesRelationship({
  parentEntityId,
  childEntityId,
}: {
  parentEntityId: string;
  childEntityId: string;
}): Promise<EntityRelationshipWithDetails | null> {
  return await db.entityRelationship.findFirst({
    where: {
      parentId: parentEntityId,
      childId: childEntityId,
    },
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
    },
    orderBy: [{ order: "asc" }],
  });
}

export async function getEntityRelationship(id: string): Promise<EntityRelationshipWithCount | null> {
  return await db.entityRelationship.findUnique({
    where: {
      id,
    },
    include: {
      parent: { select: EntityModelHelper.selectEntityWithoutIcon },
      child: { select: EntityModelHelper.selectEntityWithoutIcon },
      childEntityView: { include: EntityViewModelHelper.includeDetails },
      parentEntityView: { include: EntityViewModelHelper.includeDetails },
      _count: true,
    },
  });
}

export async function createEntityRelationship({
  parentId,
  childId,
  order,
  title,
  type,
  required,
  cascade,
  readOnly,
  hiddenIfEmpty,
  childEntityViewId,
  parentEntityViewId,
}: {
  parentId: string;
  childId: string;
  order: number;
  title: string | null;
  type: string;
  required: boolean;
  cascade: boolean;
  readOnly: boolean;
  hiddenIfEmpty: boolean;
  childEntityViewId: string | null;
  parentEntityViewId: string | null;
}) {
  return await db.entityRelationship.create({
    data: {
      parentId,
      childId,
      order,
      title,
      type,
      required,
      cascade,
      readOnly,
      hiddenIfEmpty,
      childEntityViewId,
      parentEntityViewId,
    },
  });
}

export async function updateEntityRelationship(
  id: string,
  data: {
    parentId?: string;
    childId?: string;
    order?: number;
    title?: string | null;
    type?: string;
    required?: boolean;
    cascade?: boolean;
    readOnly?: boolean;
    hiddenIfEmpty?: boolean;
    childEntityViewId?: string | null;
    parentEntityViewId?: string | null;
  }
) {
  return await db.entityRelationship.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
}

export async function deleteEntityRelationship(id: string) {
  return await db.entityRelationship.delete({
    where: {
      id,
    },
  });
}
