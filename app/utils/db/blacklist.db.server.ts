import { Blacklist } from "@prisma/client";
import Constants from "~/application/Constants";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "../db.server";

export async function getBlacklist(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: Blacklist[]; pagination: PaginationDto }> {
  const items = await db.blacklist.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    orderBy: [{ registerAttempts: "desc" }, { createdAt: "desc" }],
  });
  const totalItems = await db.blacklist.count({});

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

export async function findInBlacklist(type: string, value: string): Promise<Blacklist | null> {
  return await db.blacklist.findFirst({
    where: {
      type,
      value,
    },
  });
}

export async function addBlacklistAttempt(item: Blacklist) {
  // eslint-disable-next-line no-console
  console.log(`[BLACKLISTED ${item.type.toUpperCase()}]`, { type: item.type, value: item.value, registerAttempts: item.registerAttempts + 1 });
  return await db.blacklist.updateMany({
    where: {
      type: item.type,
      value: item.value,
    },
    data: {
      registerAttempts: item.registerAttempts + 1,
    },
  });
}

export async function addToBlacklist(data: { type: string; value: string }) {
  return await db.blacklist.create({
    data,
  });
}

export async function deleteFromBlacklist(where: { type: string; value: string }) {
  return await db.blacklist.deleteMany({
    where,
  });
}
