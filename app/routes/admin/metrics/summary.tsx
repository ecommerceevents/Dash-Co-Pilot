import { Prisma } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ServerError from "~/components/ui/errors/ServerError";
import InputCombobox from "~/components/ui/input/InputCombobox";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import TableSimple from "~/components/ui/tables/TableSimple";
import SpeedBadge from "~/modules/metrics/components/SpeedBadge";
import MetricService from "~/modules/metrics/services/MetricService";
import { db } from "~/utils/db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import NumberUtils from "~/utils/shared/NumberUtils";

const defaultGroupBy = ["function"];

type ItemDto = {
  userId: string | null;
  tenantId: string | null;
  function: string;
  route: string;
  url: string;
  env: string;
  type: string;
  _avg: {
    duration: number | null;
  };
  _count: {
    _all: number;
  };
};

type LoaderData = {
  items: ItemDto[];
  users: { id: string; email: string }[];
  tenants: { id: string; name: string }[];
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.metrics.view");
  const { filterableProperties, whereFilters } = await MetricService.getFilters({ request });
  const searchParams = new URL(request.url).searchParams;

  let users: { id: string; email: string }[] = [];
  let tenants: { id: string; name: string }[] = [];

  let groupBy = getGroupByValues(searchParams);
  let items: ItemDto[] = [];
  if (groupBy.length > 0) {
    const data = await db.metricLog.groupBy({
      by: groupBy.map((x) => x as Prisma.MetricLogScalarFieldEnum),
      where: whereFilters,
      _avg: { duration: true },
      _count: { _all: true },
      orderBy: {
        _avg: { duration: "desc" },
      },
    });
    items = data.map((x) => x as ItemDto);
    const userIds: string[] = [];
    const tenantIds: string[] = [];
    for (const item of items) {
      if (item.userId && !userIds.includes(item.userId)) {
        userIds.push(item.userId);
      }
      if (item.tenantId && !tenantIds.includes(item.tenantId)) {
        tenantIds.push(item.tenantId);
      }
    }
    users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });
    tenants = await db.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
  }
  const data: LoaderData = {
    items,
    users,
    tenants,
    filterableProperties,
  };
  return json(data);
};

function getGroupByValues(searchParams: URLSearchParams) {
  const groupByValues = searchParams
    .getAll("groupBy")
    .filter((x) => x)
    .sort();
  const groupBy: Prisma.MetricLogScalarFieldEnum[] = [];
  for (const param of groupByValues) {
    if (Object.keys(Prisma.MetricLogScalarFieldEnum).includes(param)) {
      groupBy.push(param as Prisma.MetricLogScalarFieldEnum);
    }
  }
  return groupBy.length > 0 ? groupBy.map((x) => x.toString()) : defaultGroupBy;
}

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groupBy, setGroupBy] = useState<string[]>(getGroupByValues(searchParams));

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<ItemDto>[]>([]);

  useEffect(() => {
    if (getGroupByValues(searchParams).sort().join(",") !== groupBy.sort().join(",")) {
      searchParams.delete("groupBy");
      groupBy.forEach((by) => {
        searchParams.append("groupBy", by);
      });
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<ItemDto>[] = [];
    let currentGroupBy = groupBy;
    if (currentGroupBy.length === 0) {
      currentGroupBy = defaultGroupBy;
    }
    const getCountLink = (item: ItemDto) => {
      const searchParams = new URLSearchParams();
      searchParams.set("pageSize", "100");
      currentGroupBy.forEach((groupBy) => {
        if (groupBy === "function") {
          searchParams.append("function", item.function);
        } else if (groupBy === "route") {
          searchParams.append("route", item.route);
        } else if (groupBy === "url") {
          searchParams.append("url", item.url);
        } else if (groupBy === "env") {
          searchParams.append("env", item.env);
        } else if (groupBy === "type") {
          searchParams.append("type", item.type);
        } else if (groupBy === "userId") {
          searchParams.append("userId", item.userId ?? "null");
        } else if (groupBy === "tenantId") {
          searchParams.append("tenantId", item.tenantId ?? "null");
        }
      });
      return `/admin/metrics/logs?${searchParams.toString()}`;
    };
    const getUser = (item: ItemDto) => {
      return data.users.find((x) => x.id === item.userId);
    };
    const getTenant = (item: ItemDto) => {
      return data.tenants.find((x) => x.id === item.tenantId);
    };
    if (groupBy.includes("env")) {
      headers.push({
        name: "env",
        title: "Env",
        value: (item) => <FilterableValueLink name="env" value={item.env} />,
      });
    }
    if (groupBy.includes("type")) {
      headers.push({
        name: "type",
        title: "Type",
        value: (item) => <FilterableValueLink name="type" value={item.type} />,
      });
    }
    if (groupBy.includes("route")) {
      headers.push({
        name: "route",
        title: "Route name",
        value: (item) => <FilterableValueLink name="route" value={item.route} />,
      });
    }
    if (groupBy.includes("url")) {
      headers.push({
        name: "url",
        title: "URL",
        value: (item) => <FilterableValueLink name="url" value={item.url} />,
      });
    }
    if (groupBy.includes("function")) {
      headers.push({
        name: "function",
        title: "Function",
        value: (item) => (
          <div className={clsx(item.function === "_unidentifiedFunction_" && "text-red-500")}>
            <FilterableValueLink name="function" value={item.function} />
          </div>
        ),
        className: "w-full",
      });
    }
    if (groupBy.includes("userId")) {
      headers.push({
        name: "userId",
        title: "User",
        value: (item) => <FilterableValueLink name="userId" value={getUser(item)?.email ?? ""} />,
      });
    }
    if (groupBy.includes("tenantId")) {
      headers.push({
        name: "tenantId",
        title: "Tenant",
        value: (item) => <FilterableValueLink name="tenantId" value={getTenant(item)?.name ?? ""} />,
      });
    }
    headers.push({
      name: "count",
      title: "Count",
      value: (item) => (
        <Link to={getCountLink(item)} className="hover:underline">
          {NumberUtils.intFormat(Number(item._count._all))}
        </Link>
      ),
    });
    headers.push({
      name: "speed",
      title: "Speed",
      value: (item) => <SpeedBadge duration={Number(item._avg.duration)} />,
    });
    headers.push({
      name: "duration",
      title: "Avg. duration",
      value: (item) => <div>{NumberUtils.custom(Number(item._avg.duration), "0,0.001")} ms</div>,
    });
    // headers.push({
    //   name: "all",
    //   title: "All",
    //   value: (item) => <div>{JSON.stringify(item)}</div>,
    // });

    setHeaders(headers);
  }, [data, groupBy]);

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
            <InputCombobox
              name="groupBy"
              prefix="Group by: "
              selectPlaceholder="Select group by"
              options={[
                { value: "env", name: "Env" },
                { value: "type", name: "Type" },
                { value: "route", name: "Route" },
                { value: "url", name: "URL" },
                { value: "userId", name: "User" },
                { value: "tenantId", name: "Tenant" },
                { value: "function", name: "Function" },
              ]}
              value={groupBy}
              onChange={(value) => {
                setGroupBy(value as string[]);
              }}
            />
            <div className="flex-grow">{/* <InputSearchWithURL /> */}</div>
            <InputFilters filters={data.filterableProperties} />
          </div>
          {groupBy.length === 0 ? (
            <WarningBanner title="Group by" text="Please select at least one group by" />
          ) : (
            <TableSimple items={data.items} headers={headers} />
          )}
        </div>
      </IndexPageLayout>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
