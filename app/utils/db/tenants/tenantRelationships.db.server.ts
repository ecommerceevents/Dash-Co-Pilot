import { Permission, Prisma, TenantRelationship, TenantType, TenantTypeRelationship, TenantUser } from "@prisma/client";
import { db } from "~/utils/db.server";
import { TenantSimple } from "../tenants.db.server";
import { UserSimple } from "../users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";

export type TenantRelationshipWithDetails = TenantRelationship & {
  tenantTypeRelationship: TenantTypeRelationship & {
    fromType: TenantType | null;
    toType: TenantType | null;
    permissions: Permission[];
  };
  fromTenant: TenantSimple;
  toTenant: TenantSimple & {
    users: (TenantUser & {
      user: UserSimple;
    })[];
  };
  createdByUser: UserSimple | null;
};

const includeTenantTypeRelationshipDetails = {
  tenantTypeRelationship: {
    include: { fromType: true, toType: true, permissions: true },
  },
  fromTenant: { select: TenantModelHelper.selectSimpleTenantProperties },
  toTenant: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      deactivatedReason: true,
      types: true,
      active: true,
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
  },
  createdByUser: {
    select: UserModelHelper.selectSimpleUserProperties,
  },
};

export async function getAllTenantRelationships(): Promise<TenantRelationship[]> {
  return await db.tenantRelationship.findMany();
}

export async function getAllTenantRelationshipsWithPagination(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: TenantRelationshipWithDetails[]; pagination: PaginationDto }> {
  let where: Prisma.TenantRelationshipWhereInput = {};
  const tenantId = filters?.properties.find((f) => f.name === "tenantId")?.value ?? filters?.query ?? "";
  if (tenantId) {
    if (where) {
      where = {
        OR: [where, { fromTenantId: tenantId }, { toTenantId: tenantId }],
      };
    } else {
      where = { OR: [{ fromTenantId: tenantId }, { toTenantId: tenantId }] };
    }
  }
  const typeId = filters?.properties.find((f) => f.name === "typeId")?.value;
  if (typeId) {
    if (typeId === "null") {
      where = {
        OR: [where, { tenantTypeRelationship: { fromTypeId: null } }, { tenantTypeRelationship: { toTypeId: null } }],
      };
    } else {
      where = {
        OR: [where, { tenantTypeRelationship: { fromTypeId: typeId } }, { tenantTypeRelationship: { toTypeId: typeId } }],
      };
    }
  }
  const items = await db.tenantRelationship.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where,
    include: includeTenantTypeRelationshipDetails,
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.tenantRelationship.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? 10,
      totalItems,
      totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
    },
  };
}

export async function getTenantRelationship(where: {
  tenantTypeRelationshipId: string;
  fromTenantId: string;
  toTenantId: string;
}): Promise<TenantRelationship | null> {
  return await db.tenantRelationship.findFirst({
    where,
  });
}

export async function getTenantRelationshipsFrom(tenantId: string): Promise<TenantRelationshipWithDetails[]> {
  return await db.tenantRelationship.findMany({
    where: {
      fromTenantId: tenantId,
    },
    include: includeTenantTypeRelationshipDetails,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTenantRelationshipsFromByUserTenants(tenantIds: string[]): Promise<TenantRelationshipWithDetails[]> {
  return await db.tenantRelationship.findMany({
    where: {
      fromTenantId: {
        in: tenantIds,
      },
    },
    include: includeTenantTypeRelationshipDetails,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTenantRelationshipByFrom(fromTenantId: string): Promise<TenantRelationship | null> {
  return await db.tenantRelationship.findFirst({
    where: { fromTenantId },
  });
}

export async function createTenantRelationship(data: {
  fromTenantId: string;
  toTenantId: string;
  tenantTypeRelationshipId: string;
  createdByUserId: string | null;
}) {
  return await db.tenantRelationship.create({
    data: {
      fromTenantId: data.fromTenantId,
      toTenantId: data.toTenantId,
      tenantTypeRelationshipId: data.tenantTypeRelationshipId,
      createdByUserId: data.createdByUserId,
    },
  });
}

export async function updateTenantRelationship(id: string, fromTenantId: string, toTenantId: string) {
  return await db.tenantRelationship.update({
    where: { id: id },
    data: { fromTenantId: fromTenantId, toTenantId: toTenantId },
  });
}

export async function deleteTenantRelationship(id: string) {
  return await db.tenantRelationship.delete({
    where: { id: id },
  });
}
