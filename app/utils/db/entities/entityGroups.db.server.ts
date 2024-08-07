import { EntityGroup, EntityGroupEntity, Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { EntitySimple } from "./entities.db.server";
import EntityModelHelper from "~/utils/helpers/models/EntityModelHelper";
import { EntityViewWithDetails } from "./entityViews.db.server";

export type EntityGroupWithDetails = EntityGroup & {
  entities: EntityGroupEntityWithDetails[];
};

export type EntityGroupEntityWithDetails = EntityGroupEntity & {
  entity: EntitySimple;
  allView: EntityViewWithDetails | null;
};

export async function getAllEntityGroups(): Promise<EntityGroupWithDetails[]> {
  return db.entityGroup.findMany({
    include: {
      entities: {
        include: {
          entity: { select: EntityModelHelper.selectSimpleProperties },
          allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
        },
        orderBy: { entity: { order: "asc" } },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getEntityGroup(id: string): Promise<EntityGroupWithDetails | null> {
  return db.entityGroup.findUnique({
    where: { id },
    include: {
      entities: {
        include: {
          entity: { select: EntityModelHelper.selectSimpleProperties },
          allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
        },
        orderBy: { entity: { order: "asc" } },
      },
    },
  });
}

export async function getEntityGroupBySlug(slug: string): Promise<EntityGroupWithDetails | null> {
  return db.entityGroup.findUnique({
    where: { slug },
    include: {
      entities: {
        include: {
          entity: { select: EntityModelHelper.selectSimpleProperties },
          allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
        },
        orderBy: { entity: { order: "asc" } },
      },
    },
  });
}

export async function createEntityGroup(data: {
  order: number;
  slug: string;
  title: string;
  icon: string;
  collapsible: boolean;
  section: string | null;
  entities: {
    entityId: string;
    allViewId: string | null;
  }[];
}): Promise<EntityGroup> {
  return db.entityGroup.create({
    data: {
      order: data.order,
      slug: data.slug,
      title: data.title,
      icon: data.icon,
      collapsible: data.collapsible,
      section: data.section,
      entities: {
        create: data.entities.map((f) => {
          return {
            entityId: f.entityId,
            allViewId: f.allViewId,
          };
        }),
      },
    },
  });
}

export async function updateEntityGroup(
  id: string,
  data: {
    order?: number;
    slug?: string;
    title?: string;
    icon?: string;
    collapsible?: boolean;
    section?: string | null;
    entities?: {
      entityId: string;
      allViewId: string | null;
    }[];
  }
): Promise<EntityGroup> {
  let update: Prisma.EntityGroupUpdateInput = {
    order: data.order,
    slug: data.slug,
    title: data.title,
    icon: data.icon,
    collapsible: data.collapsible,
    section: data.section,
  };
  if (data.entities) {
    update.entities = {
      deleteMany: {},
      create: data.entities.map((f) => {
        return {
          entityId: f.entityId,
          allViewId: f.allViewId,
        };
      }),
    };
  }
  return db.entityGroup.update({
    where: { id },
    data: update,
  });
}

export async function deleteEntityGroup(id: string): Promise<EntityGroup> {
  return db.entityGroup.delete({
    where: { id },
  });
}
