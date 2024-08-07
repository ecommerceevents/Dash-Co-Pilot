import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { db } from "../db.server";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { createRow, getMaxRowFolio, getRow } from "../db/entities/rows.db.server";
import { createManualRowLog, createRowLog } from "../db/logs.db.server";

export async function getCreateNewRow({ entityName, createdByUserId, tenantId }: { entityName: string; createdByUserId: string; tenantId?: string | null }) {
  const entity = await db.entity.findUnique({ where: { name: entityName } });
  if (!entity) {
    throw new Error("Entity required: " + entityName);
  }
  let folio = 1;
  const maxFolio = await getMaxRowFolio({ tenantId: tenantId ?? null, entityId: entity.id });
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  return {
    row: {
      create: {
        entityId: entity.id,
        createdByUserId,
        tenantId: tenantId ?? null,
        folio,
      },
    },
  };
}

export async function createNewRowWithEntity({
  entity,
  createdByUserId,
  tenantId,
  request,
  nextFolio,
}: {
  entity: EntityWithDetails;
  createdByUserId: string | null;
  tenantId?: string | null;
  request?: Request;
  nextFolio?: number;
}) {
  const row = await createRow({
    entity,
    data: {
      createdByUserId,
      tenantId: tenantId ?? null,
      properties: {},
      dynamicProperties: [],
    },
    nextFolio,
  });
  const item = await getRow({ entityId: entity.id, id: row!.id, tenantId: tenantId ?? null });
  if (row) {
    if (request) {
      await createRowLog(request, {
        tenantId: tenantId ?? null,
        createdByUserId,
        action: DefaultLogActions.Created,
        entity,
        item,
      });
    } else {
      await createManualRowLog(
        {
          tenantId: tenantId ?? null,
          createdByUserId,
          action: DefaultLogActions.Created + " " + entity.title,
          entity,
          item,
        },
        request
      );
    }
  }
  return row;
}
