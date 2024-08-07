import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import { RowHeaderActionDto } from "~/application/dtos/data/RowHeaderActionDto";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import EntityHelper from "~/utils/helpers/EntityHelper";
import TrashIcon from "~/components/ui/icons/TrashIcon";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  columns?: ColumnDto[];
  pagination?: PaginationDto;
  className?: string;
  editable?: boolean;
  selectedRows?: RowWithDetails[];
  onSelected?: (item: RowWithDetails[]) => void;
  onFolioClick?: (item: RowWithDetails) => void;
  onEditClick?: (item: RowWithDetails) => void;
  onRelatedRowClick?: (item: RowWithDetails) => void;
  leftHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  rightHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  allEntities: EntityWithDetails[];
  onRemove?: (item: RowWithDetails) => void;
}

export default function RowsListAndTable({
  entity,
  routes,
  items,
  pagination,
  className = "",
  columns,
  editable = true,
  selectedRows,
  onSelected,
  onFolioClick,
  onEditClick,
  onRelatedRowClick,
  leftHeaders,
  rightHeaders,
  allEntities,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);
  const [actions, setActions] = useState<RowHeaderActionDto<RowWithDetails>[]>([]);

  useEffect(() => {
    let headers = RowDisplayHeaderHelper.getDisplayedHeaders({
      routes,
      entity,
      columns,
      layout: "table",
      allEntities,
      onFolioClick,
      onEditClick,
      onRelatedRowClick,
      t,
    });
    if (leftHeaders) {
      headers = [...leftHeaders, ...headers];
    }
    if (rightHeaders) {
      headers = [...headers, ...rightHeaders];
    }
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, columns]);

  useEffect(() => {
    const actions: RowHeaderActionDto<RowWithDetails>[] = [];
    if (editable) {
      actions.push({
        title: t("shared.edit"),
        onClickRoute: (_, item) => (onEditClick !== undefined ? undefined : EntityHelper.getRoutes({ routes, entity, item })?.edit ?? ""),
        onClick: (_, item) => (onEditClick !== undefined ? onEditClick(item) : undefined),
        hidden: (item) => !editable || !EntityHelper.getRoutes({ routes, entity, item })?.edit,
      });
    }
    if (onRemove) {
      actions.push({
        title: (
          <div>
            <TrashIcon className="h-4 w-4 text-gray-300 hover:text-gray-600" />
          </div>
        ),
        onClick: (_, item) => onRemove(item),
        firstColumn: true,
      });
    }
    setActions(actions);
  }, [editable, entity, onEditClick, onRemove, routes, t]);

  function getHref(item: RowWithDetails) {
    return EntityHelper.getRoutes({ routes, entity, item })?.overview;
  }
  return (
    <div className={className}>
      <TableSimple
        headers={headers}
        items={items}
        pagination={pagination}
        selectedRows={selectedRows}
        onSelected={onSelected}
        actions={actions}
        onClickRoute={(_, item) => getHref(item)}
      />
    </div>
  );
}
