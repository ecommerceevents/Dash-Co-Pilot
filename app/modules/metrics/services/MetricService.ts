import { Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { db } from "~/utils/db.server";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { getFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

async function getGroupBys() {
  const allEnvs = [
    { name: "Production", value: "production" },
    { name: "Staging", value: "staging" },
    { name: "Development", value: "development" },
  ];
  const allTypes = [
    { name: "Loader", value: "loader" },
    { name: "Action", value: "action" },
  ];
  const allRoutes = await db.metricLog.groupBy({
    by: ["route"],
    _count: { route: true },
    orderBy: { _count: { route: "desc" } },
  });
  const allUrls = await db.metricLog.groupBy({
    by: ["url"],
    _count: { url: true },
    orderBy: { _count: { url: "desc" } },
  });
  const allFunctions = await db.metricLog.groupBy({
    by: ["function"],
    _count: { function: true },
    orderBy: { _count: { function: "desc" } },
  });

  return {
    allEnvs,
    allTypes,
    allRoutes,
    allUrls,
    allFunctions,
  };
}
async function getFilterableProperties() {
  const { allEnvs, allTypes, allRoutes, allUrls, allFunctions } = await getGroupBys();
  const filterableProperties: FilterablePropertyDto[] = [
    { name: "env", title: "Environment", options: allEnvs },
    { name: "type", title: "Type", options: allTypes },
    { name: "route", title: "Route", options: allRoutes.map((item) => ({ name: `${item.route} (${item._count.route})`, value: item.route })) },
    { name: "url", title: "Url", options: allUrls.map((item) => ({ name: `${item.url} (${item._count.url})`, value: item.url })) },
    {
      name: "function",
      title: "Function",
      options: allFunctions.map((item) => ({ name: `${item.function} (${item._count.function})`, value: item.function })),
    },
    {
      name: "tenantId",
      title: "models.tenant.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllTenantsIdsAndNames()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
    {
      name: "userId",
      title: "models.user.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllUsersNames()).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
  ];
  return filterableProperties;
}
async function getFilters({ request }: { request: Request }) {
  const filterableProperties = await getFilterableProperties();
  // const searchParams = new URL(request.url).searchParams;
  // const current = getPaginationFromCurrentUrl(searchParams);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const q = filters.query || "";

  const AND_filters: Prisma.MetricLogWhereInput[] = [];
  filterableProperties.forEach((filter) => {
    const value = filters.properties.find((f) => f.name === filter.name)?.value;
    if (value) {
      AND_filters.push({
        [filter.name]: value === "null" ? null : value,
      });
    }
  });

  const OR_filters: Prisma.MetricLogWhereInput[] = [];
  if (q) {
    OR_filters.push(
      { env: { contains: q, mode: "insensitive" } },
      { type: { contains: q, mode: "insensitive" } },
      { route: { contains: q, mode: "insensitive" } },
      { url: { contains: q, mode: "insensitive" } },
      { function: { contains: q, mode: "insensitive" } }
    );
  }

  const whereFilters: Prisma.MetricLogWhereInput = {};
  if (OR_filters.length > 0) {
    whereFilters.OR = OR_filters;
  }
  if (AND_filters.length > 0) {
    whereFilters.AND = AND_filters;
  }

  return { filterableProperties, whereFilters };
}
export default {
  getFilters,
};
