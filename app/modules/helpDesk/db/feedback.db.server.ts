import { Feedback, Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";

export type FeedbackWithDetails = Feedback & {
  tenant: TenantSimple | null;
  user: UserSimple | null;
};

export async function getAllFeedback({
  filters,
  filterableProperties,
  pagination,
}: {
  filters: FiltersDto;
  filterableProperties: FilterablePropertyDto[];
  pagination: { pageSize: number; page: number };
}): Promise<{
  items: FeedbackWithDetails[];
  pagination: PaginationDto;
}> {
  const q = filters.query || "";

  const AND_filters: Prisma.FeedbackWhereInput[] = [];
  filterableProperties.forEach((filter) => {
    const value = filters.properties.find((f) => f.name === filter.name)?.value;
    if (value) {
      AND_filters.push({
        [filter.name]: value === "null" ? null : value,
      });
    }
  });

  const OR_filters: Prisma.FeedbackWhereInput[] = [];
  if (q) {
    OR_filters.push({ message: { contains: q, mode: "insensitive" } });
  }

  const whereFilters: Prisma.FeedbackWhereInput = {};
  if (OR_filters.length > 0) {
    whereFilters.OR = OR_filters;
  }
  if (AND_filters.length > 0) {
    whereFilters.AND = AND_filters;
  }

  const items = await db.feedback.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
  });
  const totalItems = await db.feedback.count();
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

export async function createFeedback(data: { tenantId: string | null; userId: string | null; message: string; fromUrl: string }) {
  return await db.feedback.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      message: data.message,
      fromUrl: data.fromUrl,
    },
  });
}
