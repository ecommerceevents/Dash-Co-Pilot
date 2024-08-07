import { useTranslation } from "react-i18next";
import { RowDto } from "~/modules/rows/repositories/RowDto";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowRelationshipRow from "./RowRelationshipRow";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";

export default function RowRelationshipRowsByEntity({
  entity,
  item,
  allEntities,
  onRelatedRowClick,
  routes,
  type,
}: {
  entity: EntityWithDetails;
  item: RowWithDetails;
  allEntities: EntityWithDetails[];
  onRelatedRowClick?: () => void;
  routes?: EntitiesApi.Routes;
  type: "parents" | "children";
}) {
  const { t } = useTranslation();
  const relatedEntities = type === "children" ? entity.childEntities.filter((f) => f.hiddenIfEmpty) : entity.parentEntities.filter((f) => f.hiddenIfEmpty);
  let relatedRows: any[] = [];
  if (type === "children") {
    relatedRows = item.childRows?.filter((f) => relatedEntities.some((p) => p.id === f.relationshipId)) ?? [];
  } else {
    relatedRows = item.parentRows?.filter((f) => relatedEntities.some((p) => p.id === f.relationshipId)) ?? [];
  }
  const relatedRowsByEntity: { entity: EntityWithDetails; rows: RowDto[] }[] = [];
  relatedRows?.forEach((row) => {
    const entity = type === "children" ? allEntities.find((f) => f.id === row.child.entityId) : allEntities.find((f) => f.id === row.parent.entityId);
    if (!entity) {
      return null;
    }
    const existing = relatedRowsByEntity.find((f) => f.entity.id === entity.id);
    if (existing) {
      existing.rows.push(type === "children" ? row.child : row.parent);
    } else {
      relatedRowsByEntity.push({ entity, rows: [type === "children" ? row.child : row.parent] });
    }
  });

  return (
    <div>
      {relatedRows.length === 0 ? (
        <div className="px-1 pb-0.5 pt-1 text-center text-sm text-gray-300">-</div>
      ) : (
        <ul className="flex max-h-20 max-w-lg flex-col space-y-1 overflow-auto">
          {relatedRowsByEntity.map(({ entity, rows }) => {
            return (
              <div className="space-y-1" key={entity.id}>
                <div className="text-xs font-medium text-gray-400">{t(entity.title)}</div>
                {rows.map((row) => {
                  return (
                    <li key={row.id}>
                      <RowRelationshipRow entity={entity} item={row} onRelatedRowClick={onRelatedRowClick} routes={routes} t={t} />
                    </li>
                  );
                })}
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
}
