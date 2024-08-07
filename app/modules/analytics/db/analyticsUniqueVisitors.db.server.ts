import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export async function groupUniqueVisitorsBy(by: Prisma.AnalyticsUniqueVisitorScalarFieldEnum) {
  return (
    await db.analyticsUniqueVisitor.groupBy({
      by: [by],
      _count: true,
    })
  ).map((f) => ({ name: f[by]?.toString() ?? ("" as string), count: f._count }));
}
