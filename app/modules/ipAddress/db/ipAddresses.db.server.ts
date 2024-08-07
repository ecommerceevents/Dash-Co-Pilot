import { IpAddress } from "@prisma/client";
import Constants from "~/application/Constants";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";

export async function getAllIpAddresses(pagination?: { page: number; pageSize: number }): Promise<{ items: IpAddress[]; pagination: PaginationDto }> {
  const items = await db.ipAddress.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    orderBy: [{ createdAt: "desc" }],
  });
  const totalItems = await db.ipAddress.count({});

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
