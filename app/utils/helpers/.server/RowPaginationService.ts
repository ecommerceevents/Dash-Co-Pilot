import { Prisma } from "@prisma/client";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { RowWithDetails, getRows, countRows } from "~/utils/db/entities/rows.db.server";

export async function getRowsWithPagination({
  pageSize,
  page,
  entityId,
  entityName,
  tenantId,
  portalId,
  userId,
  sortedBy,
  filters,
  rowWhere,
  includePublic,
  orderBy,
}: {
  pageSize: number;
  page: number;
  entityId?: string;
  entityName?: string;
  tenantId?: string | null;
  portalId?: string | null;
  userId?: string | undefined;
  sortedBy?: SortedByDto[];
  filters?: RowFiltersDto;
  rowWhere?: Prisma.RowWhereInput;
  includePublic?: boolean;
  orderBy?: Prisma.RowOrderByWithRelationInput[];
}): Promise<{
  items: RowWithDetails[];
  pagination: PaginationDto;
}> {
  if (!orderBy) {
    orderBy = [{ order: "desc" }, { createdAt: "desc" }];
  }

  let skip: number | undefined = pageSize * (page - 1);
  let take: number | undefined = pageSize;
  if (pageSize === -1) {
    skip = undefined;
    take = undefined;
  }
  const items = await getRows({ entityId, entityName, tenantId, userId, take, skip, orderBy, filters, rowWhere, includePublic });
  const totalItems = await countRows({ entityId, entityName, tenantId, userId, filters, rowWhere, includePublic });
  let totalPages = Math.ceil(totalItems / pageSize);
  if (pageSize === -1) {
    totalPages = 1;
  }

  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      page,
      pageSize,
      sortedBy,
      query: undefined,
    },
  };
}
