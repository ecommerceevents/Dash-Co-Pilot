import { Entity } from "@prisma/client";
import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import { getAllEntities } from "../db/entities/entities.db.server";
import DateUtils from "../shared/DateUtils";

export async function getCustomEntitiesDashboardStats(lastDays: number): Promise<Stat[]> {
  const entities = await getAllEntities({ tenantId: null });
  const stats = entities.map(async (entity) => {
    return await getEntityStat(entity, lastDays);
  });
  return await Promise.all(stats);
}

async function getEntityStat(entity: Entity, lastDays: number) {
  const { added, total } = await getEntityCreatedSince(entity.id, lastDays);
  const tenantStat: Stat = {
    name: entity.titlePlural,
    hint: "",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
  };
  return tenantStat;
}

async function getEntityCreatedSince(entityId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays * -1);
  const added = await db.row.count({
    where: {
      entityId,
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.row.count({
    where: {
      entityId,
    },
  });

  return {
    added,
    total,
  };
}
