import { TFunction } from "i18next";
import { EntityWithDetails } from "../../db/entities/entities.db.server";
import { RowWithDetails, getRowById } from "../../db/entities/rows.db.server";
import ApiHelper, { ApiFormatOptions } from "../ApiHelper";
import RowHelper from "../RowHelper";
import { getTenant } from "../../db/tenants.db.server";
import { RowAsJson } from "../TemplateApiHelper";

async function fetchRowWithRelationships({
  rowId,
  entities,
  processedRows = new Set<string>(),
  backlog = [], // This will be used to store the deferred relationships to be fetched later.
}: {
  rowId: string;
  entities: EntityWithDetails[];
  processedRows?: Set<string>;
  backlog?: { rowId: string; relation: "parent" | "child"; attachTo: RowWithDetails }[];
}): Promise<RowWithDetails | null> {
  if (processedRows.has(rowId)) {
    return null;
  }
  processedRows.add(rowId);

  const row = await getRowById(rowId);
  if (!row) {
    return null;
  }

  // Fetch parent relationships.
  for (const parentRow of row.parentRows) {
    backlog.push({ rowId: parentRow.parent.id, relation: "parent", attachTo: row });
  }

  // Fetch child relationships.
  for (const childRow of row.childRows) {
    backlog.push({ rowId: childRow.child.id, relation: "child", attachTo: row });
  }

  // Process the backlog.
  while (backlog.length > 0) {
    const { rowId: backlogRowId, relation, attachTo } = backlog.shift()!;
    if (relation === "parent") {
      const parent = await fetchRowWithRelationships({ rowId: backlogRowId, entities, processedRows, backlog });
      if (parent) {
        const parentRow = attachTo.parentRows.find((p) => p.parent.id === backlogRowId);
        if (parentRow) {
          parentRow.parent = parent;
        }
      }
    } else if (relation === "child") {
      const child = await fetchRowWithRelationships({ rowId: backlogRowId, entities, processedRows, backlog });
      if (child) {
        const childRow = attachTo.childRows.find((c) => c.child.id === backlogRowId);
        if (childRow) {
          childRow.child = child;
        }
      }
    }
  }

  return row;
}

async function getRowInApiFormatWithRecursiveRelationships({
  entities,
  rowId,
  t,
  options,
}: {
  entities: EntityWithDetails[];
  rowId: string;
  t: TFunction;
  options: ApiFormatOptions;
}): Promise<RowAsJson | null> {
  const row = await fetchRowWithRelationships({ rowId, entities });
  if (!row) {
    return null;
  }
  pruneDuplicateRows(row);
  const entity = entities.find((entity) => entity.id === row.entityId);
  if (!entity) {
    throw new Error(`Entity ${row.entityId} not found.`);
  }

  const apiFormat = ApiHelper.getApiFormatWithRelationships({ entities, item: row, options });

  return {
    id: row.id,
    name: RowHelper.getTextDescription({ entity, item: row, t }),
    entityId: entity.id,
    tenant: row.tenantId ? await getTenant(row.tenantId) : null,
    data: {
      [entity.name]: apiFormat,
    },
  };
}

function pruneDuplicateRows(mainRow: RowWithDetails): void {
  const seenRowIds: Set<string> = new Set();

  let currentLevelRows: RowWithDetails[] = [mainRow];
  while (currentLevelRows.length > 0) {
    const nextLevelRows: RowWithDetails[] = [];

    for (const row of currentLevelRows) {
      if (!row) continue;

      // Process parent rows
      if (row.parentRows) {
        for (let i = row.parentRows.length - 1; i >= 0; i--) {
          const parent = row.parentRows[i].parent;
          if (seenRowIds.has(parent.id)) {
            row.parentRows.splice(i, 1); // Remove this parent
          } else {
            nextLevelRows.push(parent as RowWithDetails);
          }
        }
      }

      // Process child rows
      if (row.childRows) {
        for (let i = row.childRows.length - 1; i >= 0; i--) {
          const child = row.childRows[i].child;
          if (seenRowIds.has(child.id)) {
            row.childRows.splice(i, 1); // Remove this child
          } else {
            nextLevelRows.push(child as RowWithDetails);
          }
        }
      }

      // Mark the row as seen
      seenRowIds.add(row.id);
    }

    // Move to the next level
    currentLevelRows = nextLevelRows;
  }
}

export default {
  getRowInApiFormatWithRecursiveRelationships,
};
