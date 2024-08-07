import {
  Prisma,
  SubscriptionFeature,
  SubscriptionPrice,
  SubscriptionProduct,
  SubscriptionUsageBasedPrice,
  SubscriptionUsageBasedTier,
  TenantSubscription,
  TenantSubscriptionProduct,
  TenantSubscriptionProductPrice,
} from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";
import TenantSubscriptionProductModelHelper from "~/utils/helpers/models/TenantSubscriptionProductModelHelper";
import { TenantSimple } from "../tenants.db.server";
import { clearCacheKey } from "~/utils/cache.server";
import { clearSubscriptionsCache } from "~/utils/services/.server/subscriptionService";

export type TenantSubscriptionProductWithDetails = TenantSubscriptionProduct & {
  subscriptionProduct: SubscriptionProduct & { features: SubscriptionFeature[] };
  prices: (TenantSubscriptionProductPrice & {
    subscriptionPrice: SubscriptionPrice | null;
    subscriptionUsageBasedPrice: (SubscriptionUsageBasedPrice & { tiers: SubscriptionUsageBasedTier[] }) | null;
  })[];
};

export type TenantSubscriptionProductWithTenant = TenantSubscriptionProductWithDetails & {
  tenantSubscription: TenantSubscription & { tenant: TenantSimple };
};

export async function getAllTenantSubscriptionProducts(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: TenantSubscriptionProductWithTenant[]; pagination: PaginationDto }> {
  let where: Prisma.TenantSubscriptionProductWhereInput = {};
  const filterTenantId = filters?.properties.find((p) => p.name === "tenantId")?.value;
  const filterSubscriptionProductId = filters?.properties.find((p) => p.name === "subscriptionProductId")?.value;
  const filterStatus = filters?.properties.find((p) => p.name === "status")?.value;

  where = {
    subscriptionProductId: filterSubscriptionProductId ? { equals: filterSubscriptionProductId } : undefined,
    tenantSubscription: {
      tenantId: filterTenantId ? { equals: filterTenantId } : undefined,
    },
  };
  if (filterStatus === "active") {
    where = {
      ...where,
      OR: [
        {
          endsAt: { gte: new Date() },
        },
        {
          endsAt: null,
        },
      ],
    };
  } else if (filterStatus === "ended") {
    where = {
      ...where,
      endsAt: { lt: new Date(), not: null },
    };
  } else if (filterStatus === "active-cancelled") {
    where = {
      ...where,
      OR: [
        {
          endsAt: { gte: new Date() },
        },
        {
          endsAt: null,
        },
      ],
      cancelledAt: { not: null },
    };
  } else if (filterStatus === "active-not-cancelled") {
    where = {
      ...where,
      OR: [
        {
          endsAt: { gte: new Date() },
        },
        {
          endsAt: null,
        },
      ],
      cancelledAt: null,
    };
  }

  const items = await db.tenantSubscriptionProduct.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where,
    include: {
      ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
      tenantSubscription: {
        include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.tenantSubscriptionProduct.count({
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

export async function getTenantSubscriptionProduct(tenantId: string, subscriptionProductId: string): Promise<TenantSubscriptionProductWithTenant | null> {
  return await db.tenantSubscriptionProduct.findFirst({
    where: {
      tenantSubscription: { tenantId },
      subscriptionProductId,
    },
    include: {
      tenantSubscription: {
        include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
      },
      ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
    },
  });
}

export async function getTenantSubscriptionProductById(id: string): Promise<TenantSubscriptionProductWithTenant | null> {
  return await db.tenantSubscriptionProduct.findUnique({
    where: {
      id,
    },
    include: {
      tenantSubscription: {
        include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
      },
      ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
    },
  });
}

export async function getTenantSubscriptionProductByStripeSubscriptionId(stripeSubscriptionId: string): Promise<TenantSubscriptionProductWithTenant | null> {
  return await db.tenantSubscriptionProduct.findFirst({
    where: {
      stripeSubscriptionId,
    },
    include: {
      tenantSubscription: {
        include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
      },
      ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
    },
  });
}

export async function addTenantSubscriptionProduct(data: {
  tenantSubscriptionId: string;
  subscriptionProductId: string;
  stripeSubscriptionId?: string;
  quantity?: number;
  fromCheckoutSessionId?: string | null;
  prices: {
    subscriptionPriceId?: string;
    subscriptionUsageBasedPriceId?: string;
  }[];
}) {
  return await db.tenantSubscriptionProduct
    .create({
      data: {
        tenantSubscriptionId: data.tenantSubscriptionId,
        subscriptionProductId: data.subscriptionProductId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        quantity: data.quantity,
        fromCheckoutSessionId: data.fromCheckoutSessionId,
        endsAt: null,
        cancelledAt: null,
        prices: {
          create: data.prices.map((price) => ({
            subscriptionPriceId: price.subscriptionPriceId,
            subscriptionUsageBasedPriceId: price.subscriptionUsageBasedPriceId,
          })),
        },
      },
      include: { tenantSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
      return item;
    });
}

export async function updateTenantSubscriptionProduct(
  id: string,
  data: {
    quantity?: number;
    cancelledAt?: Date | null;
    endsAt?: Date | null;
  }
) {
  return await db.tenantSubscriptionProduct
    .update({
      where: { id },
      data,
      include: { tenantSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
      return item;
    });
}

export async function cancelTenantSubscriptionProduct(
  id: string,
  data: {
    cancelledAt: Date | null;
    endsAt: Date | null;
  }
) {
  await clearSubscriptionsCache();
  return await db.tenantSubscriptionProduct
    .update({
      where: { id },
      data: {
        cancelledAt: data.cancelledAt,
        endsAt: data.endsAt,
      },
      include: { tenantSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
    });
}
