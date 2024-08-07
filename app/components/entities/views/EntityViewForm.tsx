import { Property } from "@prisma/client";
import clsx from "clsx";
import { useRef, useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import Constants from "~/application/Constants";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { ViewFilterCondition } from "~/application/enums/entities/ViewFilterCondition";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputNumber from "~/components/ui/input/InputNumber";
import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import OrderIndexButtons from "~/components/ui/sort/OrderIndexButtons";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import { EntityViewLayoutTypes } from "~/modules/rows/dtos/EntityViewLayoutType";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import OrderHelper from "~/utils/helpers/OrderHelper";
import RowColumnsHelper from "~/utils/helpers/RowColumnsHelper";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import StringUtils from "~/utils/shared/StringUtils";
import EntityViewLayoutBadge from "./EntityViewLayoutBadge";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import RowsList from "../rows/RowsList";
import { defaultDisplayProperties } from "~/utils/helpers/PropertyHelper";

interface Props {
  entity: EntityWithDetails | undefined;
  item?: EntityViewWithDetails | null;
  canDelete?: boolean;
  onClose?: () => void;
  actionNames?: {
    create: string;
    update: string;
    delete: string;
  };
  tenantId: string | null;
  userId: string | null;
  isSystem: boolean;
  showViewType: boolean;
}

export default function EntityViewForm({
  entity,
  item,
  canDelete,
  onClose,
  actionNames,
  isSystem,
  tenantId,
  userId,
  showViewType,
}: Props & { entity: EntityWithDetails }) {
  const { t } = useTranslation();

  const inputName = useRef<RefInputText>(null);

  const [possibleProperties, setPossibleProperties] = useState<{ propertyId: string | null; name: string | null; order: number; title?: string }[]>(
    item?.properties ?? []
  );

  const [fakeItems, setFakeItems] = useState<RowWithDetails[]>([]);

  const [layout, setLayout] = useState<"table" | "board" | "grid" | "card">("table");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number | undefined>(item?.order ?? OrderHelper.getNextOrder(entity.views));
  const [pageSize, setPageSize] = useState<number | undefined>(item?.pageSize ?? Constants.DEFAULT_PAGE_SIZE);
  const [isDefault, setIsDefault] = useState(item?.isDefault ?? OrderHelper.getNextOrder(entity.views) === 1);

  const [properties, setProperties] = useState<{ propertyId: string | null; name: string | null; order: number; title?: string }[]>([]);
  const [filters, setFilters] = useState<{ name: string; condition: string; value: string; match: string }[]>(item?.filters ?? []);
  // const [sort, setSort] = useState<{ name: string; asc: boolean; order: number }[]>(item?.sort ?? []);

  // Board
  const [groupBy, setGroupBy] = useState<string | number | undefined>(item?.groupByPropertyId ? "byProperty" : undefined);
  const [groupByPropertyId, setGroupByPropertyId] = useState<string | number | undefined>(item?.groupByPropertyId ?? undefined);
  const [groupByOptions, setGroupByOptions] = useState<{ name: string; value: string }[]>([]);
  const [selectProperties, setSelectProperties] = useState<Property[]>([]);

  // Grid
  const [gridColumns, setGridColumns] = useState<number | undefined>(item?.gridColumns || 0);
  const [gridColumnsSm, setGridColumnsSm] = useState<number | undefined>(item?.gridColumnsSm || 0);
  const [gridColumnsMd, setGridColumnsMd] = useState<number | undefined>(item?.gridColumnsMd || 0);
  const [gridColumnsLg, setGridColumnsLg] = useState<number | undefined>(item?.gridColumnsLg || 0);
  const [gridColumnsXl, setGridColumnsXl] = useState<number | undefined>(item?.gridColumnsXl || 0);
  const [gridColumns2xl, setGridColumns2xl] = useState<number | undefined>(item?.gridColumns2xl || 0);
  const [gridGap, setGridGap] = useState(item?.gridGap ?? "sm");

  const [filterByProperties, setFilterByProperties] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    if (!item && isSystem) {
      setName("system-" + entity.slug);
      setTitle("System - " + t(entity.titlePlural));
      setLayout("card");
    } else if (item) {
      setName(item.name);
      setTitle(item.title);
      setLayout(item.layout as "table" | "board" | "grid" | "card");
    }
  }, [entity, isSystem, item, t]);

  useEffect(() => {
    const items: RowWithDetails[] = Array.from({ length: 10 }).map((_, idx) => {
      let nonDefaultProperties = properties.filter((p) => !defaultDisplayProperties.find((dp) => dp.name === p.name));
      const item: RowWithDetails = {
        values: nonDefaultProperties.map(({ name }) => {
          const property = entity.properties.find((p) => p.name === name);
          if (!property) return null;
          return RowHelper.getFakePropertyValue({ property, t, idx: idx + 1 });
        }),
        folio: idx + 1,
        createdAt: new Date(),
        createdByUser: {
          email: "john.doe@email.com",
          firstName: "John",
          lastName: "Doe",
        },
      } as RowWithDetails;
      return item;
    });
    setFakeItems(items);
  }, [entity.properties, properties, t]);

  useEffect(() => {
    const possibleProperties = RowColumnsHelper.getDefaultEntityColumns(entity).map((i, idx) => {
      const property = entity.properties.find((p) => p.name === i.name);
      return {
        propertyId: property?.id ?? null,
        name: i.name,
        title: i.title,
        order: idx + 1,
      };
    });
    setPossibleProperties(possibleProperties);
  }, [entity]);

  // Initial selected properties
  useEffect(() => {
    if (item) {
      setProperties(item.properties);
    } else {
      setProperties(
        RowColumnsHelper.getDefaultEntityColumns(entity)
          .filter((f) => f.visible)
          .map((i, idx) => {
            return {
              propertyId: null,
              name: i.name,
              title: i.title,
              order: idx + 1,
            };
          })
      );
    }
  }, [entity, item]);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    const selectProperties = entity.properties.filter((f) => [PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(f.type));
    setGroupByOptions([
      {
        name: "Property",
        value: "byProperty",
      },
    ]);
    setSelectProperties(selectProperties);

    let filterByProperties = entity.properties
      .filter((f) => f.type === PropertyType.TEXT || f.type === PropertyType.SELECT || f.type === PropertyType.BOOLEAN)
      .map((property) => {
        return {
          name: t(property.title),
          value: property.name,
        };
      });
    if (entity.hasTags) {
      filterByProperties = [...filterByProperties, { name: t("models.row.tags"), value: "tags" }];
    }
    setFilterByProperties(filterByProperties);
  }, [entity, t]);

  function getPropertyByName(name: string) {
    return entity.properties.find((f) => f.name === name);
  }

  function getPropertyConditionsByName(name: string) {
    if (name === "tags") {
      return [
        { value: ViewFilterCondition.equals, name: t("entities.conditions.equals") },
        { value: ViewFilterCondition.contains, name: t("entities.conditions.contains") },
        { value: ViewFilterCondition.notIn, name: t("entities.conditions.notIn") },
      ];
    } else {
      const property = getPropertyByName(name);
      if (property?.type === PropertyType.BOOLEAN) {
        return [
          { value: ViewFilterCondition.equals, name: t("entities.conditions.equals") },
          // { value: ViewFilterCondition.notIn, name: t("entities.conditions.notIn") },
        ];
      } else if (property?.type === PropertyType.TEXT || property?.type === PropertyType.SELECT) {
        return [
          { value: ViewFilterCondition.equals, name: t("entities.conditions.equals") },
          { value: ViewFilterCondition.contains, name: t("entities.conditions.contains") },
          { value: ViewFilterCondition.lt, name: t("entities.conditions.lt") },
          { value: ViewFilterCondition.lte, name: t("entities.conditions.lte") },
          { value: ViewFilterCondition.gt, name: t("entities.conditions.gt") },
          { value: ViewFilterCondition.gte, name: t("entities.conditions.gte") },
          { value: ViewFilterCondition.startsWith, name: t("entities.conditions.startsWith") },
          { value: ViewFilterCondition.endsWith, name: t("entities.conditions.endsWith") },
          { value: ViewFilterCondition.in, name: t("entities.conditions.in") },
          { value: ViewFilterCondition.notIn, name: t("entities.conditions.notIn") },
        ];
      }
    }
    return [];
  }
  function getPropertyTitle(name: string) {
    return RowColumnsHelper.getDefaultEntityColumns(entity).find((f) => f.name === name)?.title ?? "";
  }

  function getTypeTitle() {
    if (isSystem) {
      return `Type: ${t("models.view.types.system")}`;
    } else if (!tenantId && !userId) {
      return `Type: ${t("models.view.types.default")}`;
    } else if (tenantId && !userId) {
      return `Type: ${t("models.view.types.tenant")}`;
    } else if (tenantId && userId) {
      return `Type: ${t("models.view.types.user")}`;
    }
    return `Type: ${t("models.view.types.tenant")}`;
  }

  function getTypeDescription() {
    if (isSystem) {
      return "System views are used in relationships, entity groups, and other system features.";
    } else if (!tenantId && !userId) {
      return "Default views apply to all accounts.";
    } else if (tenantId && !userId) {
      return "Account views apply to all users in the account.";
    } else if (tenantId && userId) {
      return "User views apply to a specific user in a specific account.";
    }
    return "Account views apply to all users in the account.";
  }

  return (
    <FormGroup id={item?.id} onCancel={onClose} editing={true} canDelete={canDelete} actionNames={actionNames} className="text-gray-800">
      <input type="hidden" name="id" value={item?.id} hidden readOnly />
      <input type="hidden" name="entityId" value={entity.id} hidden readOnly />
      <input type="hidden" name="isSystem" value={isSystem ? "true" : "false"} hidden readOnly />
      <input type="hidden" name="tenantId" value={tenantId ?? undefined} hidden readOnly />
      <input type="hidden" name="userId" value={userId ?? undefined} hidden readOnly />

      {showViewType && <InfoBanner title={getTypeTitle()} text={getTypeDescription()} />}

      <InputGroup title="View">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <InputRadioGroupCards
            display="name"
            columns={EntityViewLayoutTypes.length}
            className="sm:col-span-12"
            name="layout"
            title="Layout"
            value={layout}
            onChange={(e) => setLayout((e?.toString() ?? "table") as "table" | "board" | "grid" | "card")}
            options={EntityViewLayoutTypes.map((f) => {
              return {
                name: f.name,
                value: f.value,
                renderName: (
                  <div className="flex items-center space-x-2">
                    <EntityViewLayoutBadge layout={f.value} className="h-3 w-3 text-gray-400" />
                    <div>{f.name}</div>
                  </div>
                ),
              };
            })}
          />

          <InputText
            autoFocus
            className={clsx(isSystem ? "sm:col-span-6" : "sm:col-span-3")}
            name="name"
            title={t("models.entity.name")}
            value={name}
            setValue={(e) => setName(e.toString().toLowerCase())}
            autoComplete="off"
            required
            // lowercase
            onBlur={() => {
              if (!item) {
                let title = StringUtils.capitalize(name.toLowerCase());
                // replace - occurrences with spaces
                title = title.replace(/-/g, " ");
                setTitle(title);
              }
            }}
          />
          <InputText
            className={clsx(isSystem ? "sm:col-span-6" : "sm:col-span-3")}
            name="title"
            title={t("models.entity.title")}
            value={title}
            setValue={setTitle}
            autoComplete="off"
            required
            withTranslation={true}
          />
          {!isSystem && (
            <Fragment>
              <InputNumber className="sm:col-span-3" name="pageSize" title={"Page size"} value={pageSize} setValue={setPageSize} min={1} max={500} required />
              <InputNumber
                className="sm:col-span-3"
                name="order"
                title={t("models.entity.order")}
                value={order}
                setValue={setOrder}
                disabled={!item}
                min={1}
                max={99}
                required
              />
              <InputCheckboxInline className="sm:col-span-12" name="isDefault" title="Is default" value={isDefault} setValue={setIsDefault} />
            </Fragment>
          )}
        </div>
      </InputGroup>

      {layout === "board" && (
        <InputGroup title="Board">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <>
              <InputSelect className="sm:col-span-6" name="groupBy" title="Group by" value={groupBy} setValue={setGroupBy} options={groupByOptions} />
              <InputSelect
                className="sm:col-span-6"
                name="groupByPropertyId"
                title="Property"
                value={groupByPropertyId}
                setValue={setGroupByPropertyId}
                options={selectProperties.map((item) => {
                  return {
                    name: t(item.title),
                    value: item.id,
                  };
                })}
              />
            </>
          </div>
        </InputGroup>
      )}

      {layout === "grid" && (
        <InputGroup title="Grid">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            <InputNumber name="gridColumns" title="Columns" value={gridColumns} setValue={setGridColumns} min={0} max={12} required />
            <InputNumber name="gridColumnsSm" title="sm" value={gridColumnsSm} setValue={setGridColumnsSm} min={0} max={12} required />
            <InputNumber name="gridColumnsMd" title="md" value={gridColumnsMd} setValue={setGridColumnsMd} min={0} max={12} required />
            <InputNumber name="gridColumnsLg" title="lg" value={gridColumnsLg} setValue={setGridColumnsLg} min={0} max={12} required />
            <InputNumber name="gridColumnsXl" title="xl" value={gridColumnsXl} setValue={setGridColumnsXl} min={0} max={12} required />
            <InputNumber name="gridColumns2xl" title="2xl" value={gridColumns2xl} setValue={setGridColumns2xl} min={0} max={12} required />

            <InputSelect
              name="gridGap"
              title="Gap"
              value={gridGap}
              setValue={(e) => setGridGap(e?.toString() ?? "sm")}
              options={[
                { name: "xs", value: "xs" },
                { name: "sm", value: "sm" },
                { name: "md", value: "md" },
                { name: "lg", value: "lg" },
                { name: "xl", value: "xl" },
              ]}
            />
          </div>
        </InputGroup>
      )}

      <InputGroup title="Properties">
        <div className="divide-y divide-gray-200">
          {properties.map((item, idx) => (
            <input key={idx} type="text" name="properties[]" readOnly hidden value={JSON.stringify(item)} />
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-baseline space-x-1">
                <div className="text-sm font-medium">All</div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    className="text-xs text-gray-600"
                    onClick={() => setProperties(possibleProperties)}
                    disabled={properties.length === possibleProperties.length}
                  >
                    ({t("shared.selectAll")})
                  </button>
                </div>
              </div>
              <div className="h-64 space-y-1 overflow-y-scroll rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2">
                {possibleProperties.map((item, idx) => (
                  <div key={item.name}>
                    <InputCheckboxInline
                      name={"properties[" + idx + "].propertyId"}
                      title={
                        <div className="flex items-baseline space-x-1 truncate text-sm">
                          <div className={clsx("truncate", item.name?.includes(".") ? "text-gray-400" : "font-medium text-gray-800")}>
                            {item.title ? t(item.title) : item.name}
                          </div>
                          <div className={clsx("truncate text-xs font-normal", item.name?.includes(".") ? "italic text-gray-400" : "font-bold text-gray-800")}>
                            ({item?.name})
                          </div>
                        </div>
                      }
                      value={properties.find((f) => f.name === item.name) !== undefined}
                      setValue={(e) => {
                        if (e) {
                          setProperties([
                            ...properties,
                            { propertyId: item.propertyId, name: item.name, title: item.title, order: OrderHelper.getNextOrder(properties) },
                          ]);
                        } else {
                          setProperties(properties.filter((f) => f.name !== item.name));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline space-x-1">
                <div className="text-sm font-medium">Displayed</div>
                <button type="button" className="text-xs text-gray-600" onClick={() => setProperties([])} disabled={properties.length === 0}>
                  ({t("shared.clear")})
                </button>
              </div>
              <div className="h-64 space-y-1 overflow-y-scroll rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2">
                {properties
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <div key={idx} className="flex items-baseline space-x-1 text-sm">
                      <div className="flex-shrink-0">
                        <OrderIndexButtons
                          idx={idx}
                          items={properties.map((item, itemIdx) => {
                            return {
                              order: item.order,
                              idx: itemIdx,
                            };
                          })}
                          onChange={(newOrders) => {
                            setProperties(
                              properties.map((item, itemIdx) => {
                                const newOrder = newOrders.find((f) => f.idx === itemIdx);
                                if (newOrder) {
                                  return {
                                    ...item,
                                    order: newOrder.order,
                                  };
                                } else {
                                  return item;
                                }
                              })
                            );
                          }}
                        />
                      </div>
                      <div className={clsx("truncate", item.name?.includes(".") ? "text-gray-400" : "font-medium text-gray-800")}>
                        {item.title ? t(item.title) : t(getPropertyTitle(item.name ?? ""))}{" "}
                        <span className={clsx("text-xs font-normal", item.name?.includes(".") ? "italic text-gray-400" : "font-bold text-gray-800")}>
                          ({item?.name})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </InputGroup>

      {!isSystem && (
        <Fragment>
          <InputGroup title="Filters">
            {filters.map((item, idx) => (
              <input key={idx} type="text" name="filters[]" readOnly hidden value={JSON.stringify(item)} />
            ))}
            <div className="mb-2 space-y-2">
              {filters.map((item, idx) => (
                <CollapsibleRow
                  className="bg-gray-50"
                  initial={true}
                  key={idx}
                  title={`${item.name} (${item.condition}) ${item.value}`}
                  value={
                    <div className="flex items-center space-x-1 text-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="font-light text-gray-500">{item.condition}</div>
                      <div className="">{item.value}</div>
                    </div>
                  }
                  onRemove={() => setFilters(filters.filter((_, i) => i !== idx))}
                >
                  <div className="grid grid-cols-12 gap-3">
                    <div className="sm:col-span-2">
                      <InputSelector
                        withSearch={false}
                        name={"filters[" + idx + "].match"}
                        title="Match"
                        value={item.match}
                        setValue={(e) =>
                          updateItemByIdx(filters, setFilters, idx, {
                            match: e,
                          })
                        }
                        options={[
                          { name: "AND", value: "and" },
                          { name: "OR", value: "or" },
                        ]}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <InputSelector
                        withSearch={false}
                        name={"filters[" + idx + "].propertyId"}
                        title="Property"
                        value={item.name}
                        setValue={(e) =>
                          updateItemByIdx(filters, setFilters, idx, {
                            name: e,
                          })
                        }
                        options={filterByProperties}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <InputSelector
                        withSearch={false}
                        name={"filters[" + idx + "].condition"}
                        title="Condition"
                        value={item.condition}
                        setValue={(e) =>
                          updateItemByIdx(filters, setFilters, idx, {
                            condition: e,
                          })
                        }
                        options={getPropertyConditionsByName(item.name)}
                      />
                    </div>
                    <Fragment>
                      {getPropertyByName(item.name)?.type === PropertyType.BOOLEAN ? (
                        <div className="sm:col-span-3">
                          <InputSelector
                            withSearch={false}
                            name={"filters[" + idx + "].value"}
                            title="Value"
                            value={item.value}
                            setValue={(e) => updateItemByIdx(filters, setFilters, idx, { value: e })}
                            options={[
                              { name: "True", value: "true" },
                              { name: "False", value: "false" },
                            ]}
                          />
                        </div>
                      ) : getPropertyByName(item.name)?.type === PropertyType.SELECT ? (
                        <div className="sm:col-span-3">
                          <InputSelector
                            withSearch={false}
                            name={"filters[" + idx + "].value"}
                            title="Value"
                            value={item.value}
                            setValue={(e) => updateItemByIdx(filters, setFilters, idx, { value: e })}
                            options={
                              getPropertyByName(item.name)?.options.map((i) => {
                                return {
                                  name: i.name ? i.value + " - " + t(i.name) : i.value,
                                  value: i.value,
                                };
                              }) ?? []
                            }
                          />
                        </div>
                      ) : (
                        <div className="sm:col-span-3">
                          <InputText
                            name={"filters[" + idx + "].value"}
                            title="Value"
                            value={item.value}
                            setValue={(e) => updateItemByIdx(filters, setFilters, idx, { value: e })}
                          />
                        </div>
                      )}
                    </Fragment>
                  </div>
                </CollapsibleRow>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const firstProperty = filterByProperties.length > 0 ? filterByProperties[0].value : "";
                setFilters([
                  ...filters,
                  {
                    name: firstProperty,
                    condition: "equals",
                    value: "",
                    match: "and",
                  },
                ]);
              }}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-gray-500">{filters.length === 0 ? "No filters" : "Add filter"}</span>
            </button>
          </InputGroup>

          {/* <InputGroup title="Sort">
        {sort.map((item, idx) => (
          <input key={idx} type="text" name="sort[]" readOnly hidden value={JSON.stringify(item)} />
        ))}
        <div className="space-y-2 mb-2">
          {sort
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => (
              <CollapsibleRow
                className="bg-gray-50"
                key={idx}
                initial={true}
                title={`${item.name} (${item.asc ? "asc" : "desc"})`}
                value={
                  <div className="flex space-x-1 items-center text-sm">
                    <div className="font-medium">{item.name}</div>
                    <div className="font-light text-gray-500">{item.asc ? "asc" : "desc"}</div>
                  </div>
                }
                onRemove={() => setSort(sort.filter((_, i) => i !== idx))}
              >
                <div className="grid grid-cols-2 gap-3">
                  <InputSelector
                    withSearch={false}
                    name={"sort[" + idx + "].name"}
                    title="Property"
                    value={item.name}
                    setValue={(e) => updateItemByIdx(sort, setSort, idx, { name: e })}
                    options={entity.properties.map((property) => {
                      return {
                        name: t(property.title),
                        value: property.name,
                      };
                    })}
                  />
                  <InputSelect
                    name={"sort[" + idx + "].order"}
                    title="Order"
                    value={item.asc ? "asc" : "desc"}
                    setValue={(e) => updateItemByIdx(sort, setSort, idx, { asc: e?.toString() === "asc" })}
                    options={[
                      {
                        name: "Ascending",
                        value: "asc",
                      },
                      {
                        name: "Descending",
                        value: "desc",
                      },
                    ]}
                  />
                </div>
              </CollapsibleRow>
            ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setSort([...sort, { name: entity.properties.find((f) => !f.isDefault)?.name ?? "", asc: true, order: OrderHelper.getNextOrder(sort) }])
          }
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <span className="block text-xs font-normal text-gray-500">{filters.length === 0 ? "No sort fields" : "Add sort"}</span>
        </button>
      </InputGroup> */}
        </Fragment>
      )}

      <InputGroup title="Preview">
        <div className="space-y-2">
          <RowsList
            view={layout}
            entity={entity}
            items={fakeItems}
            columns={properties.map((p) => ({
              name: p.name ?? "",
              title: p.title ?? "",
              visible: true,
            }))}
          />
        </div>
      </InputGroup>
    </FormGroup>
  );
}
