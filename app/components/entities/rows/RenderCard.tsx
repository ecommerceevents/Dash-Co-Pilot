import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import RowCard from "./RowCard";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import clsx from "clsx";

export default function RenderCard({
  layout,
  item,
  entity,
  columns,
  allEntities,
  routes,
  actions,
  href,
}: {
  layout: "table" | "grid" | "board" | "card";
  item: RowWithDetails;
  entity: EntityWithDetails;
  columns: ColumnDto[];
  allEntities: EntityWithDetails[];
  routes: EntitiesApi.Routes | undefined;
  actions?: (row: RowWithDetails) => { title?: string; href?: string; onClick?: () => void; isLoading?: boolean; render?: React.ReactNode }[];
  href?: string | undefined;
}) {
  return (
    <div className={clsx("rounded-md border border-gray-300 bg-white p-3 shadow-sm", href && "hover:border-gray-400 hover:shadow-md")}>
      <RowCard layout={layout} item={item} entity={entity} columns={columns} allEntities={allEntities} routes={routes} actions={actions} />
    </div>
  );
}
