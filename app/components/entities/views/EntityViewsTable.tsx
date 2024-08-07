import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import TenantBadge from "~/components/core/tenants/TenantBadge";
import UserBadge from "~/components/core/users/UserBadge";
import DateCell from "~/components/ui/dates/DateCell";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntityViewWithTenantAndUser } from "~/utils/db/entities/entityViews.db.server";
import { defaultDisplayProperties } from "~/utils/helpers/PropertyHelper";
import NumberUtils from "~/utils/shared/NumberUtils";
import EntityViewLayoutBadge from "./EntityViewLayoutBadge";

export default function EntityViewsTable({
  items,
  onClickRoute,
}: {
  items: EntityViewWithTenantAndUser[];
  onClickRoute: (item: EntityViewWithTenantAndUser) => string;
}) {
  const { t } = useTranslation();
  return (
    <TableSimple
      items={items}
      actions={[
        {
          title: t("shared.edit"),
          onClickRoute: (_, i) => onClickRoute(i),
        },
      ]}
      headers={[
        // {
        //   name: "debug",
        //   title: "Debug",
        //   value: (i) => (
        //     <div>
        //       <ShowPayloadModalButton title="Debug" description="Debug" payload={JSON.stringify(i, null, 2)} />
        //     </div>
        //   ),
        // },
        {
          name: "entity",
          title: t("models.entity.object"),
          value: (i) => (
            <div className="flex flex-col">
              <div>{t(i.entity.titlePlural)}</div>
              {/* <div className="text-xs text-gray-500">{i.entity.name}</div> */}
            </div>
          ),
        },
        {
          name: "Layout",
          title: t("models.view.layout"),
          value: (i) => (
            <div>
              <EntityViewLayoutBadge layout={i.layout} className="mx-auto h-5 w-5 text-gray-400" />
            </div>
          ),
        },
        {
          name: "title",
          title: t("models.view.title"),
          className: "w-full",
          value: (i) => (
            <div className="flex flex-col">
              <Link to={`/admin/entities/views/${i.id}`} className="hover:underline">
                {t(i.title)}
              </Link>
              {/* <div className="text-xs text-gray-500">{i.name}</div> */}
            </div>
          ),
        },
        {
          name: "appliesTo",
          title: t("models.view.appliesTo"),
          value: (i) => (
            <div className="flex items-center space-x-1">
              <div>
                {i.isSystem ? (
                  <div className="font-medium italic">System view</div>
                ) : !i.tenant && !i.user ? (
                  <div className="flex flex-col">
                    <div className="font-medium italic">
                      Default <span className="text-xs font-normal text-gray-500">(all accounts)</span>
                    </div>
                  </div>
                ) : i.tenant && i.user ? (
                  <div className="flex items-center space-x-1">
                    <div>
                      <TenantBadge item={i.tenant} />
                    </div>
                    <div>&rarr;</div>
                    <UserBadge item={i.user} />
                  </div>
                ) : i.tenant ? (
                  <div>
                    <TenantBadge item={i.tenant} />
                  </div>
                ) : i.user ? (
                  <div>
                    <UserBadge item={i.user} />
                  </div>
                ) : (
                  <div className="italic text-red-500">Invalid view</div>
                )}
              </div>
            </div>
          ),
        },
        {
          name: "properties",
          title: t("models.view.properties"),
          value: (i) => {
            return (
              <div>
                {/* {i.properties
                  .map((p) => {
                    const defaultProperty = defaultDisplayProperties.find((f) => f.name === p.name);
                    if (defaultProperty) {
                      return t(defaultProperty.title);
                    }
                    return p.name;
                  })
                  .join(", ")} */}
                <ShowPayloadModalButton
                  description={i.properties.length > 1 ? `${i.properties.length} properties` : `${i.properties.length} property`}
                  title="Properties"
                  payload={JSON.stringify(
                    i.properties.map((p) => {
                      const defaultProperty = defaultDisplayProperties.find((f) => f.name === p.name);
                      if (defaultProperty) {
                        return t(defaultProperty.title);
                      }
                      return p.name;
                    }),
                    null,
                    2
                  )}
                />
              </div>
            );
          },
        },
        {
          name: "filters",
          title: t("models.view.filters"),
          value: (i) => (
            <div>
              <ShowPayloadModalButton
                description={i.filters.length > 1 ? `${i.filters.length} filters` : `${i.filters.length} filter`}
                title="filters"
                payload={JSON.stringify(
                  i.filters.map((p) => {
                    return `${p.name} ${p.condition} ${p.value}`;
                  }),
                  null,
                  2
                )}
              />
            </div>
          ),
        },
        {
          name: "sort",
          title: t("models.view.sort"),
          value: (i) => (
            <div>
              <ShowPayloadModalButton
                description={i.sort.length > 1 ? `${i.sort.length} sort` : `${i.sort.length} sort`}
                title="sort"
                payload={JSON.stringify(
                  i.sort.map((p) => {
                    return `${p.name} ${p.asc ? "asc" : "desc"}`;
                  }),
                  null,
                  2
                )}
              />
            </div>
          ),
        },
        {
          name: "pageSize",
          title: t("models.view.pageSize"),
          value: (i) => <div>{NumberUtils.intFormat(i.pageSize)}</div>,
        },
        {
          name: "isDefault",
          title: t("models.view.isDefault"),
          value: (i) => <div>{i.isDefault ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
        },
        {
          name: "updatedAt",
          title: t("shared.updatedAt"),
          value: (i) => <DateCell date={i.updatedAt ?? null} />,
        },
        {
          name: "createdAt",
          title: t("shared.createdAt"),
          value: (i) => <DateCell date={i.createdAt ?? null} />,
        },
        {
          name: "createdBy",
          title: t("shared.createdBy"),
          value: (i) => (i.createdByUser ? <UserBadge item={i.createdByUser} /> : <div>-</div>),
        },
      ]}
      noRecords={
        <div className="p-12 text-center">
          <h3 className="mt-1 text-sm font-medium text-gray-900">No views yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create custom views to display your data</p>
        </div>
      }
    />
  );
}
