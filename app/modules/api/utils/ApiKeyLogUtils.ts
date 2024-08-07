import { Prisma } from "@prisma/client";
import ApiKeyLogsConstants from "./ApiKeyLogsConstants";

function getGroupByValues(searchParams: URLSearchParams) {
  const groupByValues = searchParams
    .getAll("groupBy")
    .filter((x) => x)
    .sort();
  const groupBy: Prisma.ApiKeyLogScalarFieldEnum[] = [];
  for (const param of groupByValues) {
    if (Object.keys(Prisma.ApiKeyLogScalarFieldEnum).includes(param)) {
      groupBy.push(param as Prisma.ApiKeyLogScalarFieldEnum);
    }
  }
  return groupBy.length > 0 ? groupBy.map((x) => x.toString()) : ApiKeyLogsConstants.DEFAULT_GROUP_BY;
}

export default {
  getGroupByValues,
};
