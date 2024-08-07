import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import KanbanSimple, { KanbanColumn } from "~/components/ui/lists/KanbanSimple";
import RowHelper from "~/utils/helpers/RowHelper";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "@remix-run/react";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import GridContainer from "~/components/ui/lists/GridContainer";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import clsx from "clsx";
import EntityViewHelper from "~/utils/helpers/EntityViewHelper";
import RowColumnsHelper from "~/utils/helpers/RowColumnsHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import RenderCard from "./RenderCard";
import RowsLoadMoreCard from "~/components/ui/tables/RowsLoadMoreCard";

interface Props {
  view: "table" | "board" | "grid" | "card";
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  pagination?: PaginationDto;
  onEditRow?: (row: RowWithDetails) => void;
  currentView?: EntityViewWithDetails | null;
  selectedRows?: RowWithDetails[];
  onSelected?: (item: RowWithDetails[]) => void;
  readOnly?: boolean;
  onClickRoute?: (row: RowWithDetails) => string;
  onRemove?: (row: RowWithDetails) => void;
  ignoreColumns?: string[];
  columns?: ColumnDto[];
  actions?: (row: RowWithDetails) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
  leftHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  rightHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
}
export default function RowsList(props: Props & { entity: EntityWithDetails | string }) {
  const appOrAdminData = useAppOrAdminData();

  const [entity, setEntity] = useState<EntityWithDetails>();
  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [groupBy, setGroupBy] = useState<{ property?: PropertyWithDetails } | undefined>();

  useEffect(() => {
    let entity: EntityWithDetails | undefined = undefined;
    let columns: ColumnDto[] = [];
    let groupBy: { property?: PropertyWithDetails } | undefined = undefined;

    if (typeof props.entity === "string") {
      entity = appOrAdminData.entities.find((e) => e.name === props.entity);
    } else {
      entity = props.entity;
    }

    if (entity) {
      const systemView = entity.views.find((f) => f.isSystem);
      let view = props.currentView ?? systemView;
      if (!view) {
        columns = RowColumnsHelper.getDefaultEntityColumns(entity);
        if (props.view === "board") {
          columns = columns.filter((f) => f.name !== groupBy?.property?.name);
        }
        if (props.ignoreColumns) {
          columns = columns.filter((f) => !props.ignoreColumns?.includes(f.name));
        }

        if (props.view === "board") {
          const property = entity.properties.find((f) => f.type === PropertyType.SELECT && !f.isHidden);
          if (property) {
            groupBy = { property };
          }
        }
      } else {
        columns = view.properties
          .sort((a, b) => a.order - b.order)
          .map((f) => {
            return { name: f.name ?? "", title: "", visible: true };
          });
        if (props.ignoreColumns) {
          columns = columns.filter((f) => !props.ignoreColumns?.includes(f.name));
        }

        if (view.layout === "board") {
          columns = columns.filter((f) => f.name !== groupBy?.property?.name);
        }

        if (view.groupByPropertyId) {
          const property = entity.properties.find((f) => f.id === view?.groupByPropertyId);
          if (property) {
            groupBy = { property };
          }
        }
      }
    }

    // if (props.readOnly) {
    //   columns = columns.filter((f) => ![RowDisplayDefaultProperty.FOLIO.toString()].includes(f.name));
    // }

    if (props.columns !== undefined) {
      columns = props.columns;
    }

    setEntity(entity);
    setColumns(columns);
    setGroupBy(groupBy);
  }, [appOrAdminData.entities, props]);

  if (!entity) {
    return null;
  } else if (columns.length === 0) {
    return null;
  }

  return <RowsListWrapped {...props} entity={entity} columns={columns} groupBy={groupBy} />;
}

function RowsListWrapped({
  view,
  entity,
  items,
  routes,
  columns,
  pagination,
  groupBy,
  onEditRow,
  currentView,
  selectedRows,
  onSelected,
  readOnly,
  onClickRoute,
  onRemove,
  actions,
  leftHeaders,
  rightHeaders,
}: Props & {
  entity: EntityWithDetails;
  columns: ColumnDto[];
  groupBy?: { property?: PropertyWithDetails };
}) {
  const { t } = useTranslation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();

  const [options, setOptions] = useState<KanbanColumn<RowWithDetails>[]>([]);
  useEffect(() => {
    if (groupBy?.property) {
      setOptions(
        groupBy.property.options.map((option) => {
          return {
            name: option.value,
            color: option.color,
            title: (
              <div className="flex items-center space-x-1">
                {option.name ? <div className="font-bold">{option.name}</div> : <div className="font-bold">{option.value}</div>}
              </div>
            ),
            value: (item: RowWithDetails) => (
              <RenderCard layout={view} item={item} entity={entity} columns={columns} allEntities={appOrAdminData.entities} routes={routes} actions={actions} />
            ),
            onClickRoute: (i: RowWithDetails) => EntityHelper.getRoutes({ routes, entity, item: i })?.edit ?? "",
            onNewRoute: (columnValue: string) => {
              let newRoute = EntityHelper.getRoutes({ routes, entity })?.new;
              if (newRoute) {
                return newRoute + `?${groupBy?.property?.name}=${columnValue}`;
              }
              return "";
            },
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  return (
    <Fragment>
      {view == "table" && (
        <RowsListAndTable
          columns={columns}
          entity={entity}
          items={items}
          pagination={pagination}
          routes={routes}
          onFolioClick={onEditRow}
          onEditClick={onEditRow}
          onRelatedRowClick={onEditRow}
          allEntities={appOrAdminData.entities}
          editable={!readOnly}
          selectedRows={selectedRows}
          onSelected={onSelected}
          onRemove={onRemove}
          leftHeaders={leftHeaders}
          rightHeaders={rightHeaders}
        />
      )}
      {view === "board" && groupBy && (
        <KanbanSimple
          className="pt-2"
          items={items}
          classNameWidth={clsx("")}
          filterValue={(item, column) => {
            if (groupBy.property) {
              const value = RowHelper.getPropertyValue({ entity, item, property: groupBy.property });
              if (column === null && !value) {
                return true;
              }
              return value === column?.name;
            }
            return false;
          }}
          columns={options}
          undefinedColumn={{
            name: t("shared.undefined"),
            color: Colors.UNDEFINED,
            title: (
              <div className="flex items-center space-x-1">
                <div className="font-bold">{t("shared.undefined")}</div>
              </div>
            ),
            value: (item: RowWithDetails) => {
              return (
                <div className="rounded-md bg-white">
                  <RenderCard
                    layout={view}
                    item={item}
                    entity={entity}
                    columns={columns}
                    allEntities={appOrAdminData.entities}
                    routes={routes}
                    actions={actions}
                  />
                </div>
              );
            },
            onClickRoute: (i: RowWithDetails) => EntityHelper.getRoutes({ routes, entity, item: i })?.edit ?? "",
          }}
          column={groupBy.property?.name ?? ""}
          renderEmpty={<EmptyCard className="w-full" />}
        />
      )}
      {view === "grid" && (
        <Fragment>
          {items.length === 0 ? (
            <EmptyState
              className="w-full py-8"
              // to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
              captions={{
                // new: "Add",
                thereAreNo: "No " + t(entity.titlePlural),
              }}
            />
          ) : (
            <div className="space-y-2">
              {/* {pagination && (
            <GridPagination
              defaultPageSize={currentView?.pageSize ?? undefined}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              page={pagination.page}
              pageSize={pagination.pageSize}
            />
          )} */}
              <GridContainer {...(currentView ? EntityViewHelper.getGridLayout(currentView) : { columns: 3, gap: "xs" })}>
                {items.map((item) => {
                  const href = onClickRoute ? onClickRoute(item) : EntityHelper.getRoutes({ routes, entity, item })?.overview ?? undefined;
                  if (onSelected && selectedRows !== undefined) {
                    return (
                      <ButtonSelectWrapper key={item.id} item={item} onSelected={onSelected} selectedRows={selectedRows}>
                        <RenderCard
                          layout={view}
                          item={item}
                          entity={entity}
                          columns={columns}
                          allEntities={appOrAdminData.entities}
                          routes={routes}
                          actions={actions}
                        />
                      </ButtonSelectWrapper>
                    );
                  }
                  const card = (
                    <div className={clsx("group relative rounded-md bg-white text-left", href && "hover:bg-gray-50")}>
                      <RemoveButton item={item} readOnly={readOnly} onRemove={onRemove} />
                      <RenderCard
                        layout={view}
                        item={item}
                        entity={entity}
                        columns={columns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        actions={actions}
                        href={href}
                      />
                    </div>
                  );
                  return href ? (
                    <Link key={item.id} to={href}>
                      {card}
                    </Link>
                  ) : (
                    card
                  );
                  // return (
                  //   <Fragment key={item.id}>
                  //     <Link to={item.id}>
                  //       <div className="group w-full truncate rounded-md border border-gray-300 bg-white p-3 text-left shadow-sm hover:bg-gray-50">
                  //         <RenderCard layout={view} item={item} entity={entity} columns={columns} allEntities={appOrAdminData.entities} routes={routes} actions={actions} />
                  //       </div>
                  //     </Link>
                  //   </Fragment>
                  // );
                })}
                {items.length === 0 ? (
                  <Fragment>{readOnly ? <EmptyCard className="w-full" /> : <AddMoreCard entity={entity} routes={routes} />}</Fragment>
                ) : (
                  <Fragment>
                    <RowsLoadMoreCard pagination={pagination} currentView={currentView} />
                  </Fragment>
                )}
              </GridContainer>
            </div>
          )}
        </Fragment>
      )}
      {view === "card" && (
        <Fragment>
          {items.length === 0 ? (
            <EmptyState
              className="w-full py-8"
              // to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
              captions={{
                // new: "Add",
                thereAreNo: "No " + t(entity.titlePlural),
              }}
            />
          ) : (
            <div className="flex space-x-2 overflow-x-scroll">
              {items.map((item) => {
                let className = clsx("w-64");
                if (onSelected && selectedRows !== undefined) {
                  return (
                    <ButtonSelectWrapper className={clsx("group relative")} key={item.id} item={item} onSelected={onSelected} selectedRows={selectedRows}>
                      <div className={className}>
                        <RemoveButton item={item} readOnly={readOnly} onRemove={onRemove} />
                        <RenderCard
                          layout={view}
                          item={item}
                          entity={entity}
                          columns={columns}
                          allEntities={appOrAdminData.entities}
                          routes={routes}
                          actions={actions}
                        />
                      </div>
                    </ButtonSelectWrapper>
                  );
                }
                const href = onClickRoute ? onClickRoute(item) : EntityHelper.getRoutes({ routes, entity, item })?.overview ?? undefined;
                const card = (
                  <div className={clsx(className, "group relative rounded-md text-left", href && "hover:bg-gray-50")}>
                    <div className={className}>
                      <RemoveButton item={item} readOnly={readOnly} onRemove={onRemove} />
                      <RenderCard
                        layout={view}
                        item={item}
                        entity={entity}
                        columns={columns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        actions={actions}
                        href={href}
                      />
                    </div>
                  </div>
                );
                return href ? (
                  <Link to={`${EntityHelper.getEntityRoute({ entity, params, appOrAdminData })}/${item.id}`} key={item.id} className="group relative">
                    {/* <RowLinkButton entityName={entity.name} id={item.id} /> */}
                    {card}
                  </Link>
                ) : (
                  card
                );
              })}
              {items.length === 0 ? (
                <Fragment>{readOnly ? <EmptyCard className="w-full" /> : <AddMoreCard className="w-64" entity={entity} routes={routes} />}</Fragment>
              ) : (
                <Fragment>
                  {!readOnly && <AddMoreCard className="w-64" entity={entity} routes={routes} />}
                  <RowsLoadMoreCard className="w-64" pagination={pagination} currentView={currentView} />
                </Fragment>
              )}
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

export function AddMoreCard({ entity, routes, className }: { entity: EntityWithDetails; routes?: EntitiesApi.Routes; className?: string }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className={className}>
        {routes && (
          <Link
            className={clsx(
              "group flex h-full items-center rounded-md border-2 border-dashed border-slate-200 p-2 text-left align-middle shadow-sm hover:border-dotted hover:border-slate-300 hover:bg-slate-100",
              className
            )}
            to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
          >
            <div className="mx-auto flex justify-center text-center align-middle text-sm font-medium text-gray-700">{t("shared.add")}</div>
          </Link>
        )}
      </div>
    </Fragment>
  );
}

export function EmptyCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className={className}>
        <div className="group inline-block h-full w-full truncate rounded-md border-2 border-dashed border-slate-300 bg-white p-12 text-left align-middle shadow-sm">
          <div className="mx-auto flex justify-center text-center align-middle text-sm font-medium text-gray-700">{t("shared.noRecords")}</div>
        </div>
      </div>
    </Fragment>
  );
}

function ButtonSelectWrapper({
  item,
  onSelected,
  selectedRows,
  children,
  className,
}: {
  item: RowWithDetails;
  selectedRows: RowWithDetails[];
  onSelected: (item: RowWithDetails[]) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const isSelected = selectedRows.find((f) => f.id === item.id);
  return (
    <div className={clsx(className, "group relative rounded-md text-left", isSelected ? "bg-theme-50 hover:bg-theme-50" : "bg-white hover:bg-gray-50")}>
      <button
        type="button"
        className="absolute right-0 top-0 mr-2 mt-2 origin-top-right justify-center"
        onClick={() => {
          if (isSelected) {
            onSelected(selectedRows.filter((f) => f.id !== item.id));
          } else {
            onSelected([...(selectedRows ?? []), item]);
          }
        }}
      >
        {isSelected ? (
          <svg
            fill="currentColor"
            className="h-5 w-5 text-teal-700"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <path d="M 39 4 L 11 4 C 7.140625 4 4 7.140625 4 11 L 4 39 C 4 42.859375 7.140625 46 11 46 L 39 46 C 42.859375 46 46 42.859375 46 39 L 46 11 C 46 7.140625 42.859375 4 39 4 Z M 23.085938 34.445313 L 13.417969 25.433594 L 14.78125 23.96875 L 22.914063 31.554688 L 36.238281 15.832031 L 37.761719 17.125 Z"></path>
          </svg>
        ) : (
          <svg
            fill="currentColor"
            className="h-5 w-5 text-teal-700"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <path d="M 39 4 L 11 4 C 7.101563 4 4 7.101563 4 11 L 4 39 C 4 42.898438 7.101563 46 11 46 L 39 46 C 42.898438 46 46 42.898438 46 39 L 46 11 C 46 7.101563 42.898438 4 39 4 Z M 42 39 C 42 40.699219 40.699219 42 39 42 L 11 42 C 9.300781 42 8 40.699219 8 39 L 8 11 C 8 9.300781 9.300781 8 11 8 L 39 8 C 40.699219 8 42 9.300781 42 11 Z"></path>
          </svg>
        )}
      </button>
      {children}
    </div>
  );
}

function RemoveButton({ item, readOnly, onRemove }: { item: RowWithDetails; readOnly?: boolean; onRemove?: (item: RowWithDetails) => void }) {
  return (
    <Fragment>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(item);
          }}
          type="button"
          disabled={readOnly}
          className={clsx(
            "absolute right-0 top-0 mr-2 mt-2 hidden origin-top-right justify-center rounded-full bg-white text-gray-600",
            readOnly ? "cursor-not-allowed" : "hover:text-red-500 group-hover:flex"
          )}
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </Fragment>
  );
}
