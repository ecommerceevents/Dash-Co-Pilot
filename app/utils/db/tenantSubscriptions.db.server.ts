import { TenantSubscription } from "@prisma/client";
import { db } from "../db.server";
import { TenantSubscriptionProductWithDetails } from "./subscriptions/tenantSubscriptionProducts.db.server";
import TenantSubscriptionProductModelHelper from "../helpers/models/TenantSubscriptionProductModelHelper";
import { clearCacheKey } from "../cache.server";

export type TenantSubscriptionWithDetails = TenantSubscription & {
  products: TenantSubscriptionProductWithDetails[];
};

export async function getOrPersistTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetails> {
  const subscription = await db.tenantSubscription.findUnique({
    where: {
      tenantId,
    },
    include: {
      products: {
        include: TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
        orderBy: {
          subscriptionProduct: {
            order: "desc",
          },
        },
      },
    },
  });

  if (!subscription) {
    return await createTenantSubscription(tenantId, "");
  }
  return subscription;
}

export async function getTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetails | null> {
  return await db.tenantSubscription.findUnique({
    where: {
      tenantId,
    },
    include: {
      products: {
        include: TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
        orderBy: {
          subscriptionProduct: {
            order: "desc",
          },
        },
      },
    },
  });
}

export async function getTenantSubscriptions(): Promise<TenantSubscriptionWithDetails[]> {
  return await db.tenantSubscription.findMany({
    include: {
      products: {
        include: {
          subscriptionProduct: { include: { features: true } },
          prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
        },
        orderBy: {
          subscriptionProduct: {
            order: "desc",
          },
        },
      },
    },
  });
}

export async function createTenantSubscription(tenantId: string, stripeCustomerId: string) {
  return await db.tenantSubscription
    .create({
      data: {
        tenantId,
        stripeCustomerId,
      },
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
          },
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${tenantId}`);
      return item;
    });
}

export async function updateTenantSubscriptionCustomerId(tenantId: string, data: { stripeCustomerId: string }) {
  return await db.tenantSubscription
    .update({
      where: {
        tenantId,
      },
      data,
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${tenantId}`);
      return item;
    });
}
