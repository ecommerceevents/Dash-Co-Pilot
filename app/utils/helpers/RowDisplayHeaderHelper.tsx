import { Fragment } from "react";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { EntityWithDetails, PropertyWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import DateUtils from "../shared/DateUtils";
import RowHelper from "./RowHelper";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { EntitiesApi } from "../api/.server/EntitiesApi";
import EntityHelper from "./EntityHelper";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { TFunction } from "i18next";
import { RowDisplayDefaultProperty } from "./PropertyHelper";
import DateCell from "~/components/ui/dates/DateCell";
import RowCreatedByCell from "~/components/entities/rows/cells/RowCreatedByCell";
import RowFolioCell from "~/components/entities/rows/cells/RowFolioCell";
import RowTagsCell from "~/components/entities/rows/cells/RowTagsCell";
import RowOrderButtons from "~/components/entities/rows/RowOrderButtons";
import RowRelationshipRow from "~/components/entities/rows/cells/RowRelationshipRow";
import RowRelationshipRowsByEntity from "~/components/entities/rows/cells/RowRelationshipRowsByEntity";

function isColumnVisible(columns?: ColumnDto[], name?: string) {
  if (!columns) {
    return true;
  }
  const column = columns?.find((f) => f.name === name);
  if (!columns || !column) {
    return false;
  }
  return column.visible;
}

function displayTenant(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.TENANT,
    title: "models.tenant.object",
    value: (item) => <div>{item.tenant === null ? <div className="italic">Admin</div> : <div>{item.tenant.name}</div>}</div>,
    // href: (item) => item.tenant?.id ?? "",
    breakpoint: "sm",
  };
}

function displayFolio(entity: EntityWithDetails, routes?: EntitiesApi.Routes, onClick?: (item: RowWithDetails) => void): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.FOLIO,
    title: "models.row.folio",
    value: (item) => (
      <RowFolioCell
        prefix={entity.prefix}
        folio={item.folio}
        href={routes && onClick === undefined ? EntityHelper.getRoutes({ routes, entity, item })?.overview : undefined}
        onClick={onClick !== undefined ? () => onClick(item) : undefined}
      />
    ),
    // breakpoint: "sm",
    sortable: true,
  };
}

function displayOrder(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.ORDER,
    title: "",
    className: "w-12",
    value: (item) => <RowOrderButtons id={item.id} order={item.order} />,
  };
}

function displayTags(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.TAGS,
    title: "models.tag.plural",
    value: (item) => <RowTagsCell items={item.tags} />,
    breakpoint: "sm",
    sortable: true,
  };
}

function displayProperty(entity: EntityWithDetails, property: PropertyWithDetails, layout?: string): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: property.name,
    title: property.title,
    value: (item) => RowHelper.getPropertyValue({ entity, item, property }),
    formattedValue: (item) => <div className="max-w-sm truncate">{RowHelper.getCellValue({ entity, property, item })}</div>,
  };
}

function displayCreatedAt(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.CREATED_AT,
    title: "shared.createdAt",
    value: (item) => DateUtils.dateAgo(item.createdAt),
    formattedValue: (item) => <DateCell date={item.createdAt} />,
    className: "text-gray-400 text-xs",
    breakpoint: "sm",
  };
}

function displayCreatedBy(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: RowDisplayDefaultProperty.CREATED_BY,
    title: "shared.createdBy",
    value: (item) => <RowCreatedByCell user={item.createdByUser} apiKey={item.createdByApiKey} />,
    className: "text-gray-400 text-xs",
    breakpoint: "sm",
  };
}

function getDisplayedHeaders({
  entity,
  columns,
  layout,
  allEntities,
  routes,
  onFolioClick,
  onEditClick,
  onRelatedRowClick,
  t,
}: {
  entity: EntityWithDetails;
  columns?: ColumnDto[];
  layout?: string;
  allEntities: EntityWithDetails[];
  routes?: EntitiesApi.Routes;
  onFolioClick?: (item: RowWithDetails) => void;
  onEditClick?: (item: RowWithDetails) => void;
  onRelatedRowClick?: (item: RowWithDetails) => void;
  t: TFunction;
}): RowHeaderDisplayDto<RowWithDetails>[] {
  let headers: RowHeaderDisplayDto<RowWithDetails>[] = [];

  if (columns && isColumnVisible(columns, RowDisplayDefaultProperty.ID)) {
    headers.push({
      name: RowDisplayDefaultProperty.ID,
      title: "ID",
      value: (item) => (
        <div>
          {onEditClick !== undefined ? (
            <button
              type="button"
              onClick={() => onEditClick(item)}
              className="rounded-md border-b border-dashed border-transparent hover:border-gray-400 focus:bg-gray-100"
            >
              {item.id}
            </button>
          ) : (
            <div>{item.id}</div>
          )}
        </div>
      ),
      href: (item) => (onEditClick === undefined ? item.id : undefined),
      breakpoint: "sm",
    });
  }
  if (columns && isColumnVisible(columns, RowDisplayDefaultProperty.ENTITY)) {
    headers.push({
      name: RowDisplayDefaultProperty.ENTITY,
      title: "models.row.entity",
      value: () => (t ? t(entity.title) : entity.title),
    });
  }
  if (columns && isColumnVisible(columns, RowDisplayDefaultProperty.TENANT)) {
    headers.push(displayTenant());
  }
  if (columns && isColumnVisible(columns, RowDisplayDefaultProperty.ORDER) && layout === "table") {
    headers.push(displayOrder());
  }
  if (isColumnVisible(columns, RowDisplayDefaultProperty.FOLIO)) {
    headers.push(displayFolio(entity, routes, onFolioClick));
  }

  entity.properties
    .filter((f) => !f.isHidden && isColumnVisible(columns, f.name))
    .forEach((property) => {
      headers.push(displayProperty(entity, property, layout));
    });

  entity.parentEntities
    .filter((f) => !f.hiddenIfEmpty)
    .forEach((relationship) => {
      const parentEntity = allEntities.find((f) => f.id === relationship.parentId);
      if (parentEntity && isColumnVisible(columns, `parent.${parentEntity.name}`)) {
        headers.push({
          name: `parent.${parentEntity.name}`,
          title: parentEntity.title,
          value: (item) => (
            <div className="flex max-w-xs items-center space-x-2 overflow-x-auto">
              {!item.parentRows?.length || item.parentRows.length === 0 ? (
                <div className="px-1 pb-0.5 pt-1 text-center text-sm text-gray-300">-</div>
              ) : (
                <Fragment>
                  {item.parentRows
                    ?.filter((f) => f.relationshipId === relationship.id)
                    .map(({ parent }) => {
                      return (
                        <Fragment key={parent.id}>
                          <RowRelationshipRow
                            entity={parentEntity}
                            item={parent}
                            onRelatedRowClick={onRelatedRowClick ? () => onRelatedRowClick(item) : undefined}
                            routes={routes}
                            t={t}
                          />
                        </Fragment>
                      );
                    })}
                </Fragment>
              )}
            </div>
          ),
        });
      }
    });

  entity.childEntities
    .filter((f) => !f.hiddenIfEmpty)
    .forEach((relationship) => {
      const childEntity = allEntities.find((f) => f.id === relationship.childId);
      if (childEntity && isColumnVisible(columns, `child.${childEntity.name}`)) {
        headers.push({
          name: `child.${childEntity.name}`,
          title: childEntity.titlePlural,
          value: (item) => (
            <ul className="flex max-h-20 max-w-lg flex-col space-y-1 overflow-auto">
              {!item.childRows?.length || item.childRows.length === 0 ? (
                <div className="px-1 pb-0.5 pt-1 text-sm text-gray-300">-</div>
              ) : (
                <Fragment>
                  {childEntity.properties.filter((f) => !f.isDefault && f.isDisplay).length === 0 ? (
                    <div>
                      <SimpleBadge title={item.childRows?.length.toString()} color={Colors.INDIGO} />
                    </div>
                  ) : (
                    <Fragment>
                      {item.childRows
                        ?.filter((f) => f.relationshipId === relationship.id)
                        .map(({ child }) => {
                          return (
                            <li key={child.id}>
                              <RowRelationshipRow
                                entity={childEntity}
                                item={child}
                                onRelatedRowClick={onRelatedRowClick ? () => onRelatedRowClick(item) : undefined}
                                routes={routes}
                                t={t}
                              />
                            </li>
                          );
                        })}
                    </Fragment>
                  )}
                </Fragment>
              )}
            </ul>
          ),
        });
      }
    });

  if (isColumnVisible(columns, RowDisplayDefaultProperty.HIDDEN_PARENTS)) {
    headers.push({
      name: RowDisplayDefaultProperty.HIDDEN_PARENTS,
      title: "",
      value: (item) => (
        <RowRelationshipRowsByEntity
          entity={entity}
          item={item}
          onRelatedRowClick={onRelatedRowClick ? () => onRelatedRowClick(item) : undefined}
          routes={routes}
          allEntities={allEntities}
          type="parents"
        />
      ),
    });
  }
  if (isColumnVisible(columns, RowDisplayDefaultProperty.HIDDEN_CHILDREN)) {
    headers.push({
      name: RowDisplayDefaultProperty.HIDDEN_CHILDREN,
      title: "",
      value: (item) => (
        <RowRelationshipRowsByEntity
          entity={entity}
          item={item}
          onRelatedRowClick={onRelatedRowClick ? () => onRelatedRowClick(item) : undefined}
          routes={routes}
          allEntities={allEntities}
          type="children"
        />
      ),
    });
  }

  if (isColumnVisible(columns, RowDisplayDefaultProperty.CREATED_AT)) {
    headers.push(displayCreatedAt());
  }
  if (isColumnVisible(columns, RowDisplayDefaultProperty.CREATED_BY)) {
    headers.push(displayCreatedBy());
  }
  if (columns && isColumnVisible(columns, RowDisplayDefaultProperty.PERMISSIONS)) {
    headers.push({
      name: RowDisplayDefaultProperty.PERMISSIONS,
      title: "models.row.permissions",
      value: () => <div>TODO</div>,
    });
  }
  if (columns && entity.hasTags && isColumnVisible(columns, RowDisplayDefaultProperty.TAGS)) {
    headers.push(displayTags());
  }
  if (columns && entity.hasTasks && isColumnVisible(columns, RowDisplayDefaultProperty.TASKS)) {
    headers.push({
      name: RowDisplayDefaultProperty.TASKS,
      title: "models.row.tasks",
      value: () => <div>TODO</div>,
    });
  }
  if (columns && entity.hasComments && isColumnVisible(columns, RowDisplayDefaultProperty.COMMENTS)) {
    headers.push({
      name: RowDisplayDefaultProperty.COMMENTS,
      title: "models.row.comments",
      value: () => <div>TODO</div>,
    });
  }

  if (columns && columns.length > 0) {
    const newOrder: RowHeaderDisplayDto<RowWithDetails>[] = [];
    columns.forEach((column) => {
      const header = headers.find((f) => f.name === column.name);
      if (header && !newOrder.includes(header)) {
        newOrder.push(header);
      }
    });
    headers = newOrder;
  }

  let nonDefaultHeaders = headers.filter((f) => !f.name.startsWith("default."));
  if (nonDefaultHeaders.length === 1) {
    nonDefaultHeaders[0].className = "w-full";
  }
  return headers;
}

export default {
  isColumnVisible,
  displayTenant,
  displayFolio,
  displayProperty,
  displayCreatedAt,
  displayCreatedBy,
  getDisplayedHeaders,
};
