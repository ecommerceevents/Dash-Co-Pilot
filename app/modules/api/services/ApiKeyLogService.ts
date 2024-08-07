import { Prisma } from "@prisma/client";
import { Params } from "@remix-run/react";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { db } from "~/utils/db.server";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { ApiCallSummaryDto } from "../dtos/ApiCallSummaryDto";
import ApiKeyLogUtils from "../utils/ApiKeyLogUtils";
import { ApiKeyLogDto } from "../dtos/ApiKeyLogDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";

async function getSummary({ request, params }: { request: Request; params: Params }) {
  const { filterableProperties, whereFilters, allTenants } = await getFilters({ request, params });
  const searchParams = new URL(request.url).searchParams;
  let groupBy = ApiKeyLogUtils.getGroupByValues(searchParams);
  let items: ApiCallSummaryDto[] = [];
  if (groupBy.length > 0) {
    try {
      const data = await db.apiKeyLog.groupBy({
        by: groupBy.map((x) => x as Prisma.ApiKeyLogScalarFieldEnum),
        where: whereFilters,
        _avg: { duration: true },
        _count: { _all: true },
        orderBy: {
          _avg: { duration: "desc" },
        },
      });
      items = data.map((x) => x as ApiCallSummaryDto);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log({ error: e.message });
      throw Error("Invalid group by: " + groupBy.join(", "));
    }
  }
  return { items, allTenants, filterableProperties };
}

async function getDetails({ request, params }: { request: Request; params: Params }): Promise<{
  items: ApiKeyLogDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
}> {
  const { filterableProperties, whereFilters } = await getFilters({ request, params });

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const include: Prisma.ApiKeyLogInclude = {
    apiKey: {
      select: { alias: true, tenant: { select: { id: true, name: true } } },
    },
  };
  if (!whereFilters.tenantId) {
    include.tenant = { select: { id: true, name: true, slug: true } };
  }
  const items = await db.apiKeyLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: whereFilters,
    include,
    orderBy: !pagination.sortedBy.length
      ? { createdAt: "desc" }
      : pagination.sortedBy.map((x) => ({
          [x.name]: x.direction,
        })),
  });
  const totalItems = await db.apiKeyLog.count({
    where: whereFilters,
  });

  return {
    items: items as ApiKeyLogDto[],
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

async function getGroupBys(tenantId: string | null) {
  // let where: Prisma.ApiKeyLogWhereInput = {};
  // if (tenantId) {
  //   where = { apiKeyId: tenantId };
  // }
  const allMethods = [
    { name: "GET", value: "GET" },
    { name: "POST", value: "POST" },
    { name: "PUT", value: "PUT" },
    { name: "PATCH", value: "PATCH" },
    { name: "DELETE", value: "DELETE" },
  ];
  // const allEndpoints = await db.apiKeyLog.groupBy({
  //   by: ["endpoint"],
  //   where,
  //   _count: { endpoint: true },
  //   orderBy: { _count: { endpoint: "desc" } },
  // });
  // const allParams = await db.apiKeyLog.groupBy({
  //   where,
  //   by: ["params"],
  //   _count: { params: true },
  //   orderBy: { _count: { params: "desc" } },
  // });
  // const allStatus = await db.apiKeyLog.groupBy({
  //   by: ["status"],
  //   where,
  //   _count: { status: true },
  //   orderBy: { _count: { status: "desc" } },
  // });
  // const allApiKeys = tenantId ? await getApiKeys(tenantId) : await getAllApiKeys();

  return {
    allMethods,
    // allEndpoints,
    // allParams,
    // allStatus,
    // allApiKeys,
  };
}
async function getFilterableProperties(tenantId: string | null) {
  const {
    allMethods,
    // allEndpoints,
    // allParams,
    // allStatus,
    // allApiKeys
  } = await getGroupBys(tenantId);
  const filterableProperties: FilterablePropertyDto[] = [
    { name: "method", title: "Method", options: allMethods },
    {
      name: "endpoint",
      title: "Endpoint",
      // options: allEndpoints.map((item) => ({ name: `${item.endpoint} (${item._count.endpoint})`, value: item.endpoint })),
    },
    {
      name: "params",
      title: "Params",
      // options: allParams.map((item) => ({ name: `${item.params} (${item._count.params})`, value: item.params }))
    },
    {
      name: "status",
      title: "Status",
      // options: allStatus.map((item) => ({ name: `${item.status ?? "- No status -"} (${item._count.status})`, value: item.status?.toString() ?? "{null}" })),
    },
    {
      name: "apiKeyId",
      title: "API Key",
      // options: allApiKeys.map((item) => ({ name: `${item.alias} (${item.tenant?.name ?? "{Admin}"})`, value: item.id })),
    },
  ];
  let allTenants: { id: string; name: string; slug: string }[] = [];
  if (tenantId === null) {
    allTenants = await adminGetAllTenantsIdsAndNames();
    filterableProperties.unshift({
      name: "tenantId",
      title: "models.tenant.object",
      options: [
        { value: "null", name: "{null}" },
        ...allTenants.map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    });
  }
  return { filterableProperties, allTenants };
}

async function getFilters({ request, params }: { request: Request; params: Params }) {
  const tenantId = await getTenantIdOrNull({ request, params });
  const { filterableProperties, allTenants } = await getFilterableProperties(tenantId);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const q = filters.query || "";

  const AND_filters: Prisma.ApiKeyLogWhereInput[] = [];
  filterableProperties.forEach((filter) => {
    const value = filters.properties.find((f) => f.name === filter.name)?.value;
    if (value) {
      let formattedValue = filter.name === "status" ? Number(value) : value;
      AND_filters.push({
        [filter.name]: value === "null" ? null : formattedValue,
      });
    }
  });

  const OR_filters: Prisma.ApiKeyLogWhereInput[] = [];
  if (q) {
    OR_filters.push(
      { ip: { contains: q, mode: "insensitive" } },
      { endpoint: { contains: q, mode: "insensitive" } },
      { method: { contains: q, mode: "insensitive" } },
      { params: { contains: q, mode: "insensitive" } },
      { error: { contains: q, mode: "insensitive" } }
    );
  }
  const whereFilters: Prisma.ApiKeyLogWhereInput = {};
  if (OR_filters.length > 0) {
    whereFilters.OR = OR_filters;
  }
  if (AND_filters.length > 0) {
    whereFilters.AND = AND_filters;
  }
  if (tenantId) {
    whereFilters.tenantId = tenantId;
  }

  return { filterableProperties, whereFilters, allTenants };
}

async function deleteMany(ids: string[]) {
  return await db.apiKeyLog.deleteMany({
    where: { id: { in: ids } },
  });
}

export default {
  getSummary,
  getDetails,
  deleteMany,
};
