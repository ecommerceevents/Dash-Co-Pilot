import { EntityView, EntityViewFilter, EntityViewProperty, EntityViewSort, Prisma, Property } from "@prisma/client";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";
import { TenantSimple } from "../tenants.db.server";
import EntityModelHelper from "~/utils/helpers/models/EntityModelHelper";
import { EntitySimple } from "./entities.db.server";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import EntityViewModelHelper from "~/utils/helpers/models/EntityViewModelHelper";

export type EntityViewWithDetails = EntityView & {
  properties: EntityViewProperty[];
  filters: EntityViewFilter[];
  sort: EntityViewSort[];
  groupByProperty: Property | null;
};

export type EntityViewWithTenantAndUser = EntityViewWithDetails & {
  entity: EntitySimple;
  createdByUser: UserSimple | null;
  tenant: TenantSimple | null;
  user: UserSimple | null;
};

export async function getAllEntityViews({
  type,
  entityId,
  pagination,
  filters,
}: {
  type?: string;
  entityId?: string;
  pagination?: { pageSize: number; page: number };
  filters?: FiltersDto;
}): Promise<{ items: EntityViewWithTenantAndUser[]; total: number }> {
  let where: Prisma.EntityViewWhereInput = {
    entityId,
  };
  if (type === "default") {
    where = { tenantId: null, userId: null, isSystem: false };
  } else if (type === "tenant") {
    where = { tenantId: { not: null }, userId: null, isSystem: false };
  } else if (type === "user") {
    where = { userId: { not: null }, isSystem: false };
  } else if (type === "system") {
    where = { isSystem: true };
  }

  const filterEntityId = filters?.properties.find((filter) => filter.name === "entityId")?.value;
  const filterTenantId = filters?.properties.find((filter) => filter.name === "tenantId")?.value;
  const filterUserId = filters?.properties.find((filter) => filter.name === "userId")?.value;
  if (filterEntityId) {
    where = { ...where, entityId: filterEntityId };
  }
  if (filterTenantId) {
    where = { ...where, tenantId: filterTenantId };
  }
  if (filterUserId) {
    where = { ...where, userId: filterUserId };
  }

  const items = await db.entityView.findMany({
    take: pagination?.pageSize,
    skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
    where,
    include: {
      ...EntityViewModelHelper.includeDetails,
      entity: { select: EntityModelHelper.selectSimpleProperties },
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
    orderBy: [{ tenantId: "asc" }, { userId: "asc" }, { order: "asc" }],
  });
  const total = await db.entityView.count({ where });
  return {
    items,
    total,
  };
}

export async function getEntityViews(
  entityId: string,
  options?: {
    tenantId?: string | null;
    userId?: string | null;
  }
): Promise<EntityViewWithDetails[]> {
  let where: Prisma.EntityViewWhereInput = {
    entityId,
    isSystem: false,
  };
  if (options?.tenantId !== undefined) {
    where = {
      ...where,
      OR: [
        { tenantId: options.tenantId, userId: options.userId },
        { tenantId: options.tenantId, userId: null },
        { tenantId: null, userId: null },
      ],
    };
  }
  return await db.entityView.findMany({
    where,
    include: EntityViewModelHelper.includeDetails,
    orderBy: {
      order: "asc",
    },
  });
}

export async function getEntityView(id: string): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findUnique({
    where: {
      id,
    },
    include: EntityViewModelHelper.includeDetails,
  });
}

export async function getEntityViewWithTenantAndUser(id: string): Promise<EntityViewWithTenantAndUser | null> {
  return await db.entityView.findUnique({
    where: {
      id,
    },
    include: {
      ...EntityViewModelHelper.includeDetails,
      entity: { select: EntityModelHelper.selectSimpleProperties },
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
  });
}

export async function getEntityViewByName({
  entityId,
  name,
  isSystem,
}: {
  entityId: string;
  name: string;
  isSystem?: boolean;
}): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      name,
      isSystem,
    },
    include: EntityViewModelHelper.includeDetails,
  });
}

export async function getEntityViewDefault({ entityId, isSystem }: { entityId: string; isSystem?: boolean }): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      isSystem,
      isDefault: true,
    },
    include: EntityViewModelHelper.includeDetails,
  });
}

export async function getEntityViewByOrder(entityId: string, order: number): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      order,
    },
    include: EntityViewModelHelper.includeDetails,
  });
}

export default async function getMaxEntityViewOrder(entityId: string): Promise<number> {
  return (
    (
      await db.entityView.aggregate({
        where: { entityId },
        _max: {
          order: true,
        },
      })
    )._max?.order ?? 0
  );
}

export async function createEntityView(data: {
  entityId: string;
  tenantId: string | null;
  userId: string | null;
  createdByUserId: string;
  layout: string;
  name: string;
  title: string;
  isDefault: boolean;
  isSystem: boolean;
  pageSize: number;
  groupByPropertyId?: string | null;
  gridColumns?: number;
  gridColumnsSm?: number;
  gridColumnsMd?: number;
  gridColumnsLg?: number;
  gridColumnsXl?: number;
  gridColumns2xl?: number;
  gridGap?: string;
  order?: number;
}) {
  if (!data.order) {
    data.order = (await getMaxEntityViewOrder(data.entityId)) + 1;
  }
  return await db.entityView.create({
    data: {
      entityId: data.entityId,
      tenantId: data.tenantId,
      userId: data.userId,
      createdByUserId: data.createdByUserId,
      layout: data.layout,
      order: data.order,
      name: data.name,
      title: data.title,
      isDefault: data.isDefault,
      isSystem: data.isSystem,
      pageSize: data.pageSize,
      groupByPropertyId: data.groupByPropertyId,
      gridColumns: data.gridColumns ?? 5,
      gridColumnsSm: data.gridColumnsSm ?? 2,
      gridColumnsMd: data.gridColumnsMd ?? 3,
      gridColumnsLg: data.gridColumnsLg ?? 4,
      gridColumnsXl: data.gridColumnsXl ?? 5,
      gridColumns2xl: data.gridColumns2xl ?? 6,
      gridGap: data.gridGap ?? "sm",
    },
  });
}

export async function updateEntityViewProperties(id: string, items: { propertyId: string | null; name: string; order: number }[]) {
  await db.entityViewProperty.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewProperty.create({
        data: {
          entityViewId: id,
          propertyId: item.propertyId,
          name: item.name,
          order: item.order,
        },
      });
    })
  );
}

export async function updateEntityViewFilters(id: string, items: { name: string; condition: string; value: string; match: string }[]) {
  await db.entityViewFilter.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewFilter.create({
        data: {
          entityViewId: id,
          name: item.name,
          condition: item.condition,
          value: item.value,
          match: item.match,
        },
      });
    })
  );
}

export async function updateEntityViewSort(id: string, items: { name: string; asc: boolean; order: number }[]) {
  await db.entityViewSort.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewSort.create({
        data: {
          entityViewId: id,
          name: item.name,
          asc: item.asc,
          order: item.order,
        },
      });
    })
  );
}

export async function updateEntityView(
  id: string,
  data: {
    layout?: string;
    isDefault?: boolean;
    isSystem?: boolean;
    pageSize?: number;
    name?: string;
    title?: string;
    order?: number;
    groupByPropertyId?: string | null;
    gridColumns?: number;
    gridColumnsSm?: number;
    gridColumnsMd?: number;
    gridColumnsLg?: number;
    gridColumnsXl?: number;
    gridColumns2xl?: number;
    gridGap?: string;
  }
) {
  return await db.entityView.update({
    where: { id },
    data,
  });
}

export async function deleteEntityView(id: string) {
  return await db.entityView.delete({
    where: { id },
  });
}
