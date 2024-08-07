import { ApiKey, ApiKeyEntity, ApiKeyLog, Tenant } from "@prisma/client";
import { db } from "../db.server";
import { getClientIPAddress } from "~/utils/server/IpUtils";
import { UserSimple } from "./users.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import UserModelHelper from "../helpers/models/UserModelHelper";
import UrlUtils from "../app/UrlUtils";
import { cachified, clearCacheKey } from "../cache.server";

export type ApiKeyWithDetails = ApiKey & {
  tenant: { id: string; name: string; slug: string; deactivatedReason: string | null };
  entities: (ApiKeyEntity & { entity: { id: string; title: string; titlePlural: string; slug: string } })[];
  createdByUser: UserSimple;
  _count: { apiKeyLogs: number };
};

export type ApiKeyLogWithDetails = ApiKeyLog & {
  apiKey: (ApiKey & { tenant: Tenant }) | null;
};
export type ApiKeyLogSimple = { apiKeyId: string | null; status: number | null };

export type ApiKeySimple = {
  id: string;
  alias: string;
  expires: Date | null;
  tenantId: string;
  active: boolean;
  entities: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    entityId: string;
  }[];
  tenant: { id: string; name: string; slug: string; deactivatedReason: string | null };
};

const include = {
  tenant: { select: { id: true, name: true, slug: true, deactivatedReason: true } },
  entities: {
    include: {
      entity: { select: { id: true, title: true, titlePlural: true, slug: true } },
    },
  },
  ...UserModelHelper.includeSimpleCreatedByUser,
  _count: {
    select: {
      apiKeyLogs: true,
    },
  },
};

export async function getAllApiKeys(): Promise<ApiKeyWithDetails[]> {
  return await db.apiKey.findMany({
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllApiKeyLogs(
  pagination: { page: number; pageSize: number },
  filters: FiltersDto
): Promise<{ items: ApiKeyLogWithDetails[]; pagination: PaginationDto }> {
  const where = RowFiltersHelper.getFiltersCondition(filters);
  const items = await db.apiKeyLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      apiKey: {
        include: { tenant: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.apiKeyLog.count({
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

export async function getAllApiKeyLogsSimple(tenantId?: string): Promise<ApiKeyLogSimple[]> {
  let where: any = {};
  if (tenantId) {
    where = {
      apiKey: {
        tenantId,
      },
    };
  }
  return await db.apiKeyLog.findMany({
    where,
    select: {
      apiKeyId: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTenantApiKeyLogs(
  tenantId: string,
  pagination: { page: number; pageSize: number },
  filters: FiltersDto
): Promise<{ items: ApiKeyLogWithDetails[]; pagination: PaginationDto }> {
  const where = {
    AND: [RowFiltersHelper.getFiltersCondition(filters), { apiKey: { tenantId } }],
  };
  const items = await db.apiKeyLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: { apiKey: { include: { tenant: true } } },
    orderBy: { createdAt: "desc" },
  });
  const totalItems = await db.apiKeyLog.count({ where });
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

export async function getApiKeys(tenantId: string): Promise<ApiKeyWithDetails[]> {
  return await db.apiKey.findMany({
    where: {
      tenantId,
    },
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApiKeyById(id: string): Promise<ApiKeyWithDetails | null> {
  return await db.apiKey.findUnique({
    where: { id },
    include,
  });
}

export async function getApiKey(key: string): Promise<ApiKeySimple | null> {
  return await cachified({
    key: `apiKey:${key}`,
    ttl: 1000 * 60 * 60,
    getFreshValue: () =>
      db.apiKey
        .findFirst({
          where: { key },
          select: {
            id: true,
            alias: true,
            expires: true,
            tenantId: true,
            active: true,
            entities: { select: { create: true, read: true, update: true, delete: true, entityId: true } },
            tenant: { select: { id: true, name: true, slug: true, deactivatedReason: true } },
          },
        })
        .catch(() => {
          return null;
        }),
  });
}

export async function getApiKeyByAlias(tenantId: string, alias: string): Promise<ApiKeyWithDetails | null> {
  return await db.apiKey.findFirst({
    where: { tenantId, alias },
    include,
  });
}

export async function getApiKeyLogs(id: string): Promise<ApiKeyLogWithDetails[]> {
  return await db.apiKeyLog.findMany({
    where: {
      apiKeyId: id,
    },
    include: {
      apiKey: {
        include: {
          tenant: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFirstApiKey(tenantId: string | null) {
  if (!tenantId) {
    return null;
  }
  return await db.apiKey
    .findFirstOrThrow({
      where: {
        tenantId,
        active: true,
      },
    })
    .catch(() => null);
}

export async function createApiKey(
  data: {
    tenantId: string;
    createdByUserId: string;
    alias: string;
    expires: Date | null;
    active: boolean;
  },
  entities: {
    entityId: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[]
) {
  const apiKey = await db.apiKey.create({
    data: {
      ...data,
      active: true,
    },
  });
  await Promise.all(
    entities.map(async (entity) => {
      return await db.apiKeyEntity.create({
        data: {
          apiKeyId: apiKey.id,
          entityId: entity.entityId,
          create: entity.create,
          read: entity.read,
          update: entity.update,
          delete: entity.delete,
        },
      });
    })
  );
  return apiKey;
}

export async function createApiKeyLog(
  request: Request,
  data: {
    tenantId: string | null;
    apiKeyId: string | null;
    endpoint: string;
    error?: string;
    status?: number;
  }
) {
  return await db.apiKeyLog.create({
    data: {
      tenantId: data.tenantId,
      apiKeyId: data.apiKeyId,
      endpoint: data.endpoint,
      error: data.error,
      status: data.status,
      ip: getClientIPAddress(request.headers)?.toString() ?? "",
      method: request.method,
      params: UrlUtils.searchParamsToString({
        type: "object",
        searchParams: new URL(request.url).searchParams,
      }),
    },
  });
}

export async function setApiKeyLogStatus(
  id: string,
  data: {
    status: number;
    startTime: number | null;
    error?: string | null;
  }
) {
  let duration: number | null = null;
  if (data.startTime) {
    const endTime = performance.now();
    duration = Number(endTime - data.startTime);
  }
  return await db.apiKeyLog.update({
    where: { id },
    data: {
      status: data.status,
      error: data.error,
      duration,
    },
  });
}

export async function updateApiKey(
  id: string,
  data: {
    tenantId: string;
    alias: string;
    expires: Date | null;
    active: boolean;
  },
  entities: {
    entityId: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[]
) {
  await db.apiKey
    .update({
      where: { id },
      data,
    })
    .then((item) => {
      clearCacheKey(`apiKey:${item.key}`);
      return item;
    });
  await db.apiKeyEntity.deleteMany({
    where: {
      apiKeyId: id,
    },
  });
  await Promise.all(
    entities.map(async (entity) => {
      return await db.apiKeyEntity.create({
        data: {
          apiKeyId: id,
          ...entity,
        },
      });
    })
  );
}

export async function deleteApiKey(id: string) {
  return await db.apiKey
    .delete({
      where: { id },
    })
    .then((item) => {
      clearCacheKey(`apiKey:${item.key}`);
      return item;
    });
}

export async function countTenantApiKeyLogs(tenantId: string) {
  return await db.apiKeyLog.count({
    where: { apiKey: { tenantId } },
  });
}
