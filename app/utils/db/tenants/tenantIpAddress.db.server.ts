import { ApiKey, Tenant, TenantIpAddress } from "@prisma/client";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import Constants from "~/application/Constants";

export type TenantIpAddressWithDetails = TenantIpAddress & {
  tenant: Tenant;
  user: UserSimple | null;
  apiKey: ApiKey | null;
};

export async function getAllTenantIpAddresses(pagination?: {
  page: number;
  pageSize: number;
}): Promise<{ items: TenantIpAddressWithDetails[]; pagination: PaginationDto }> {
  const items = await db.tenantIpAddress.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    include: {
      tenant: true,
      user: {
        select: UserModelHelper.selectSimpleUserProperties,
      },
      apiKey: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  const totalItems = await db.tenantIpAddress.count({});

  return {
    items,
    pagination: {
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
    },
  };
}

export async function createUniqueTenantIpAddress(data: { ip: string; fromUrl: string; tenantId: string; userId?: string | null; apiKeyId?: string | null }) {
  const existing = await db.tenantIpAddress.findFirst({
    where: {
      ip: data.ip,
      tenantId: data.tenantId,
      userId: data.userId,
      apiKeyId: data.apiKeyId,
    },
  });
  if (existing) {
    return;
  }
  return await db.tenantIpAddress.create({
    data,
  });
}
