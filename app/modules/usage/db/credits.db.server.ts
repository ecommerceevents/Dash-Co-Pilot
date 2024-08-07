import { Credit, Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";

export type CreditWithDetails = Credit & {
  tenant: TenantSimple;
  user: UserSimple | null;
};

export async function getAllCredits({
  tenantId,
  filters,
  filterableProperties,
  pagination,
}: {
  tenantId: string | null;
  filters: FiltersDto;
  filterableProperties: FilterablePropertyDto[];
  pagination: { pageSize: number; page: number };
}): Promise<{
  items: CreditWithDetails[];
  pagination: PaginationDto;
}> {
  const q = filters.query || "";

  const AND_filters: Prisma.CreditWhereInput[] = [];
  filterableProperties.forEach((filter) => {
    const value = filters.properties.find((f) => f.name === filter.name)?.value;
    if (value) {
      AND_filters.push({
        [filter.name]: value === "null" ? null : value,
      });
    }
  });

  const OR_filters: Prisma.CreditWhereInput[] = [];
  if (q) {
    OR_filters.push({ type: { contains: q, mode: "insensitive" } }, { objectId: { contains: q, mode: "insensitive" } });
  }

  const whereFilters: Prisma.CreditWhereInput = {};
  if (OR_filters.length > 0) {
    whereFilters.OR = OR_filters;
  }
  if (AND_filters.length > 0) {
    whereFilters.AND = AND_filters;
  }

  if (tenantId) {
    whereFilters.tenantId = tenantId;
  }
  const items = await db.credit.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: whereFilters,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
  });
  const totalItems = await db.credit.count({
    where: whereFilters,
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function createCredit(data: { tenantId: string; userId: string | null; type: string; objectId: string | null; amount: number }) {
  return await db.credit.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      objectId: data.objectId,
      amount: data.amount,
    },
  });
}
export async function deleteCredits(ids: string[]) {
  return await db.credit.deleteMany({
    where: {
      id: { in: ids },
    },
  });
}
