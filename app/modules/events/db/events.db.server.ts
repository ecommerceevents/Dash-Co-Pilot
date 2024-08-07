import { Event } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationResultDto } from "~/application/dtos/data/PaginationResultDto";
import { db } from "~/utils/db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";

export type EventWithAttempts = Event & {
  tenant: TenantSimple | null;
  user: UserSimple | null;
  // attempts: {
  //   id: string;
  //   startedAt: Date | null;
  //   finishedAt: Date | null;
  //   endpoint: string;
  //   success: boolean | null;
  //   status: number | null;
  //   message: string | null;
  // }[];
};

export type EventWithDetails = Event & {
  tenant: TenantSimple | null;
  user: UserSimple | null;
  // attempts: EventWebhookAttempt[];
};

export async function getEvents(
  pagination: { current: { page: number; pageSize: number }; filters: FiltersDto },
  tenantId?: string | null
): Promise<{
  items: EventWithAttempts[];
  pagination: PaginationResultDto;
}> {
  const whereFilters = RowFiltersHelper.getFiltersCondition(pagination.filters);
  const items = await db.event.findMany({
    take: pagination.current.pageSize,
    skip: pagination.current.pageSize * (pagination.current.page - 1),
    where: {
      AND: [whereFilters, { tenantId }],
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
      // attempts: {
      //   select: {
      //     id: true,
      //     startedAt: true,
      //     finishedAt: true,
      //     endpoint: true,
      //     success: true,
      //     status: true,
      //     message: true,
      //   },
      // },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.event.count({
    where: {
      tenantId,
      ...whereFilters,
    },
  });
  const totalPages = Math.ceil(totalItems / pagination.current.pageSize);

  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      page: pagination.current.page,
      pageSize: pagination.current.pageSize,
      sortedBy: undefined,
      query: undefined,
    },
  };
}

export async function getEvent(id: string): Promise<EventWithDetails | null> {
  return await db.event.findUnique({
    where: {
      id,
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      user: { select: UserModelHelper.selectSimpleUserProperties },
      // attempts: true,
    },
  });
}

export async function createEvent(data: { tenantId: string | null; userId: string | null; name: string; data: string; description: string | null }) {
  return await db.event.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      name: data.name,
      data: data.data,
      description: data.description,
    },
  });
}
