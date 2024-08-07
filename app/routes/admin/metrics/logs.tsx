import { MetricLog, Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useSearchParams, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import SpeedBadge from "~/modules/metrics/components/SpeedBadge";
import MetricService from "~/modules/metrics/services/MetricService";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { db } from "~/utils/db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";

type ItemDto = MetricLog & {
  tenant: Tenant | null;
  user: UserSimple | null;
};
type LoaderData = {
  items: ItemDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.metrics.view");
  const { filterableProperties, whereFilters } = await MetricService.getFilters({ request });

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const items = await db.metricLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: whereFilters,
    include: {
      tenant: true,
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
    orderBy: !pagination.sortedBy.length
      ? { createdAt: "desc" }
      : pagination.sortedBy.map((x) => ({
          [x.name]: x.direction,
        })),
  });
  const totalItems = await db.metricLog.count({
    where: whereFilters,
  });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  if (form.get("action") === "delete") {
    await verifyUserHasPermission(request, "admin.metrics.delete");
    const ids = (form.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
    await db.metricLog.deleteMany({
      where: { id: { in: ids } },
    });
    return json({ success: true });
  } else {
    return json({ error: t("shared.invalidForm"), success: false }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const submit = useSubmit();

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedRows, setSelectedRows] = useState<ItemDto[]>([]);
  function onDelete(ids: string[]) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("ids", ids.join(","));
    submit(form, {
      method: "post",
    });
  }
  return (
    <>
      <IndexPageLayout
        title="Metrics"
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: "Summary",
            routePath: "/admin/metrics/summary",
          },
          {
            name: "All logs",
            routePath: "/admin/metrics/logs",
          },
          {
            name: "Settings",
            routePath: "/admin/metrics/settings",
          },
        ]}
      >
        <div className="space-y-2">
          <div className="flex w-full items-center space-x-2">
            <div className="flex-grow">
              <InputSearchWithURL />
            </div>
            {selectedRows.length > 0 && (
              <ButtonSecondary
                destructive
                disabled={!getUserHasPermission(appOrAdminData, "admin.metrics.delete")}
                onClick={() => {
                  onDelete(selectedRows.map((x) => x.id));
                  setSelectedRows([]);
                }}
              >
                Delete {selectedRows.length}
              </ButtonSecondary>
            )}
            <ButtonSecondary onClick={() => setSearchParams(searchParams)}>
              <RefreshIcon className="h-4 w-4" />
            </ButtonSecondary>
            <InputFilters filters={data.filterableProperties} />
          </div>
        </div>
        <TableSimple
          selectedRows={selectedRows}
          onSelected={setSelectedRows}
          items={data.items}
          pagination={data.pagination}
          headers={[
            {
              name: "route",
              title: "Route name",
              value: (item) => <FilterableValueLink name="route" value={item.route} />,
            },
            {
              name: "url",
              title: "URL",
              value: (item) => <FilterableValueLink name="url" value={item.url} />,
            },
            {
              name: "function",
              title: "Function",
              value: (item) => <FilterableValueLink name="function" value={item.function} />,
              className: "w-full",
            },
            {
              name: "speed",
              title: "Speed",
              value: (item) => <SpeedBadge duration={item.duration} />,
            },
            {
              sortBy: "duration",
              name: "duration",
              title: "Duration",
              value: (item) => <div>{item.duration.toFixed(3)} ms</div>,
            },
            {
              name: "type",
              title: "Type",
              value: (item) => <FilterableValueLink name="type" value={item.type} />,
            },
            {
              name: "tenant",
              title: "Tenant",
              value: (item) => <FilterableValueLink name="tenantId" value={item.tenant?.name} param={item.tenant?.id} />,
            },
            {
              name: "user",
              title: "User",
              value: (item) => <FilterableValueLink name="userId" value={item.user?.email} param={item.user?.id} />,
            },
            {
              name: "env",
              title: "Env",
              value: (item) => <FilterableValueLink name="env" value={item.env} />,
            },
            {
              sortBy: "createdAt",
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (item) => DateUtils.dateYMDHMS(item.createdAt),
              formattedValue: (item) => <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>,
            },
            {
              name: "actions",
              title: "",
              value: (item) => (
                <button type="button" onClick={() => onDelete([item.id])} className="text-red-600 hover:text-red-900 hover:underline">
                  Delete
                </button>
              ),
            },
          ]}
        />
      </IndexPageLayout>
    </>
  );
}
