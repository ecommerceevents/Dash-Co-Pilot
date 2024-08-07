import { Tenant, Log, ApiKey, Prisma } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { db } from "../db.server";
import ApiHelper from "../helpers/ApiHelper";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import { getUserInfo } from "../session.server";
import { EntityWithDetails } from "./entities/entities.db.server";
import { callEntityWebhooks } from "./entities/entityWebhooks.db.server";
import { RowCommentWithDetails } from "./entities/rowComments.db.server";
import { RowWithDetails } from "./entities/rows.db.server";
import { UserWithoutPassword } from "./users.db.server";
import UserModelHelper from "../helpers/models/UserModelHelper";

export type LogWithDetails = Log & {
  user: UserWithoutPassword | null;
  apiKey: ApiKey | null;
  tenant?: Tenant | null;
  comment?: RowCommentWithDetails | null;
};

const include = {
  user: true,
  tenant: true,
  apiKey: true,
  comment: {
    include: {
      ...UserModelHelper.includeSimpleCreatedByUser,
      reactions: {
        include: {
          ...UserModelHelper.includeSimpleCreatedByUser,
        },
      },
    },
  },
};

export async function getAllLogs(
  pagination: { page: number; pageSize: number },
  filters: FiltersDto
): Promise<{ items: LogWithDetails[]; pagination: PaginationDto }> {
  const where = RowFiltersHelper.getFiltersCondition(filters);
  const items = await db.log.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include,
    where,
  });
  const totalItems = await db.log.count({
    where,
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

export async function getLogs(
  tenantId: string,
  pagination: { page: number; pageSize: number },
  filters: FiltersDto
): Promise<{ items: LogWithDetails[]; pagination: PaginationDto }> {
  const where = RowFiltersHelper.getFiltersCondition(filters);
  const items = await db.log.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: { tenantId, ...where },
    include,
  });
  const totalItems = await db.log.count({
    where: { tenantId, ...where },
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

export async function getAllRowLogs({
  entityId,
  rowId,
  tenantId,
  pagination,
}: {
  entityId?: string;
  rowId?: string;
  tenantId?: string | null;
  pagination: { page: number; pageSize: number };
}): Promise<{ items: LogWithDetails[]; pagination: PaginationDto }> {
  let where: Prisma.LogWhereInput = { rowId: { not: null } };
  if (entityId) {
    where = { ...where, row: { entityId } };
  }
  if (rowId) {
    where = { ...where, rowId };
  }
  if (tenantId !== undefined) {
    where = { ...where, tenantId };
  }
  const items = await db.log.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include,
  });
  const totalItems = await db.log.count({
    where,
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

export async function getRowLogs(tenantId: string | null, rowId: string): Promise<LogWithDetails[]> {
  return await db.log.findMany({
    where: {
      tenantId,
      rowId,
    },
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRowLogsById(rowId: string): Promise<LogWithDetails[]> {
  return await db.log.findMany({
    where: {
      rowId,
    },
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createLog(request: Request, tenantId: string | null, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.log.create({
    data: {
      tenantId,
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

export async function createManualLog(userId: string, tenantId: string | null, pathname: string, action: string, details: string) {
  await db.log.create({
    data: {
      tenantId,
      userId,
      url: pathname,
      action,
      details,
    },
  });
}

export async function createRowLog(
  request: Request,
  data: {
    tenantId: string | null;
    createdByUserId?: string | null;
    createdByApiKey?: string | null;
    action: string;
    entity: EntityWithDetails;
    item: RowWithDetails | null;
    commentId?: string | null;
    details?: string;
  }
) {
  const log = await db.log.create({
    data: {
      tenantId: data.tenantId,
      userId: data.createdByUserId ?? null,
      apiKeyId: data.createdByApiKey ?? null,
      url: new URL(request.url).pathname,
      rowId: data.item?.id ?? null,
      action: data.action,
      details: data.details ?? null,
      commentId: data.commentId ?? null,
    },
  });
  const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
  await callEntityWebhooks({
    logId: log.id,
    entityId: data.entity.id,
    action: data.action,
    body: apiFormat,
    request,
  });
  return log;
}

export async function createManualRowLog(
  data: {
    tenantId: string | null;
    createdByUserId?: string | null;
    createdByApiKey?: string | null;
    action: string;
    entity: EntityWithDetails;
    item: RowWithDetails | null;
    commentId?: string | null;
  },
  request?: Request
) {
  let details = "";
  const log = await db.log.create({
    data: {
      tenantId: data.tenantId,
      userId: data.createdByUserId ?? null,
      apiKeyId: data.createdByApiKey ?? null,
      url: request ? new URL(request.url).pathname : "",
      rowId: data.item?.id ?? null,
      action: data.action,
      details,
      commentId: data.commentId ?? null,
    },
  });
  const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
  await callEntityWebhooks({
    logId: log.id,
    entityId: data.entity.id,
    action: data.action,
    body: apiFormat,
    // request,
  });
  return log;
}

export async function createLogLogin(request: Request, user: UserWithoutPassword) {
  // eslint-disable-next-line no-console
  // console.log({ clientIpAddress: getClientIPAddress(request.headers) });

  await db.log.create({
    data: {
      userId: user.id,
      url: "",
      action: DefaultLogActions.Login,
      details: "",
    },
  });
}

export async function createLogLogout(request: Request, userId: string) {
  await db.log.create({
    data: {
      userId,
      url: "",
      action: DefaultLogActions.Logout,
      details: "",
    },
  });
}

export async function createAdminLog(request: Request, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.log.create({
    data: {
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

export async function getLastUserLog(userId: string): Promise<Log | null> {
  return await db.log.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
