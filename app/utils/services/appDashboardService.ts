import { TFunction } from "i18next";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangePercentage, getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import { EntitySimple, getAllEntities } from "../db/entities/entities.db.server";
import { TenantSimple } from "../db/tenants.db.server";
import { getAllTenantTypes } from "../db/tenants/tenantTypes.db.server";
import { TenantEntitiesApi } from "../api/.server/TenantEntitiesApi";
import { RowsApi } from "../api/.server/RowsApi";

export async function getAppDashboardStats({
  t,
  tenant,
  gte,
  entities,
}: {
  t: TFunction;
  tenant: TenantSimple | null;
  gte: Date | undefined | undefined;
  entities?: EntitySimple[];
}): Promise<Stat[]> {
  if (!tenant) {
    return [];
  }
  if (!entities) {
    entities = await getAllEntities({ tenantId: tenant.id, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AppOnly] });
    const tenantTypes = await getAllTenantTypes();
    if (tenantTypes.length > 0) {
      const tenantEntities = await TenantEntitiesApi.getEntities({ tenantId: tenant.id, inTypes: tenant.types, enabledOnly: true });
      entities = tenantEntities.allEntities;
    }
  }
  const promises = entities.map((entity) => getEntityStat(entity, tenant.id, gte));
  const stats = await Promise.all(promises);
  return stats;
}

export async function getEntityStat(entity: EntitySimple, tenantId: string, gte: Date | undefined) {
  const { total, added } = await getRowsCreatedSince(entity.id, tenantId, gte);

  const stat: Stat = {
    name: entity.titlePlural,
    hint: "",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    entity: {
      slug: entity.slug,
    },
  };
  return stat;
}

async function getRowsCreatedSince(entityId: string, tenantId: string, gte: Date | undefined) {
  const added = await db.row.count({
    where: {
      entityId,
      tenantId,
      createdAt: {
        gte,
      },
    },
  });
  const total = await db.row.count({
    where: {
      entityId,
      tenantId,
    },
  });

  return {
    added,
    total,
  };
}

export type EntitySummaryDto = {
  order: number;
  rowsData: RowsApi.GetRowsData;
};
export async function getEntitySummaries({
  entities,
  tenantId,
}: {
  entities: { name: string; pageSize?: number }[];
  tenantId: string | null;
}): Promise<EntitySummaryDto[]> {
  const entitySummaries: EntitySummaryDto[] = [];

  await Promise.all(
    entities.map(async ({ name, pageSize }, idx) => {
      const entitySummary = {
        order: idx,
        rowsData: await RowsApi.getAll({
          entity: { name },
          tenantId,
          pageSize: pageSize || 3,
          urlSearchParams: new URLSearchParams({
            view: "null",
          }),
        }),
      };
      entitySummaries.push(entitySummary);
    })
  );

  return entitySummaries;
}
