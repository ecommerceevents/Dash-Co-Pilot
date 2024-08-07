import { Prisma, SubscriptionProduct, TenantType, TenantTypeEntity, TenantTypeRelationship } from "@prisma/client";
import { db } from "~/utils/db.server";

export type TenantTypeWithDetails = TenantType & {
  fromTypes: TenantTypeRelationship[];
  toTypes: TenantTypeRelationship[];
  subscriptionProducts: SubscriptionProduct[];
  entities: TenantTypeEntity[];
  _count: { tenants: number };
};
const includeDetails = {
  fromTypes: true,
  toTypes: true,
  subscriptionProducts: true,
  entities: true,
  _count: { select: { tenants: true } },
};
export async function getAllTenantTypes(): Promise<TenantTypeWithDetails[]> {
  return await db.tenantType.findMany({
    include: includeDetails,
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getTenantTypesFrom(fromTypeIds: string[]): Promise<TenantTypeWithDetails[]> {
  return await db.tenantType.findMany({
    where: {
      fromTypes: {
        some: {
          OR: [
            {
              fromTypeId: { in: fromTypeIds },
            },
            { fromTypeId: { equals: null } },
          ],
        },
      },
    },
    include: includeDetails,
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getDefaultTenantTypes() {
  return await db.tenantType.findMany({
    where: { isDefault: true },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getTenantType(id: string): Promise<TenantTypeWithDetails | null> {
  return await db.tenantType.findUnique({
    where: { id: id },
    include: includeDetails,
  });
}

export async function getTenantTypeByTitle(title: string): Promise<TenantTypeWithDetails | null> {
  return await db.tenantType.findUnique({
    where: { title },
    include: includeDetails,
  });
}

export async function createTenantType(data: {
  title: string;
  titlePlural: string;
  description: string | null;
  isDefault?: boolean;
  subscriptionProducts: string[];
}) {
  return await db.tenantType.create({
    data: {
      title: data.title,
      titlePlural: data.titlePlural,
      description: data.description,
      isDefault: data.isDefault,
      subscriptionProducts: {
        connect: data.subscriptionProducts.map((id) => ({ id })),
      },
    },
  });
}

export async function updateTenantType(
  id: string,
  data: {
    title?: string;
    titlePlural?: string;
    description?: string | null;
    isDefault?: boolean;
    subscriptionProducts?: string[];
  }
) {
  const update: Prisma.TenantTypeUncheckedUpdateInput = {
    title: data.title,
    titlePlural: data.titlePlural,
    description: data.description,
    isDefault: data.isDefault,
  };
  if (data.subscriptionProducts) {
    update.subscriptionProducts = {
      set: data.subscriptionProducts.map((id) => ({ id })),
    };
  }
  return await db.tenantType.update({
    where: { id: id },
    data: update,
  });
}

export async function deleteTenantType(id: string) {
  return await db.tenantType.delete({
    where: { id: id },
  });
}
