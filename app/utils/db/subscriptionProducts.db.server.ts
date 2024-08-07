import { SubscriptionFeature, SubscriptionPrice, SubscriptionProduct } from ".prisma/client";
import { SubscriptionUsageBasedPrice, SubscriptionUsageBasedTier } from "@prisma/client";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { db } from "~/utils/db.server";

export type SubscriptionPriceWithProduct = SubscriptionPrice & {
  subscriptionProduct: SubscriptionProduct;
};

export type SubscriptionUsageBasedPriceWithProduct = SubscriptionUsageBasedPrice & {
  subscriptionProduct: SubscriptionProduct;
};

export async function getAllSubscriptionProductsWithTenants(): Promise<SubscriptionProductDto[]> {
  return await db.subscriptionProduct
    .findMany({
      include: {
        tenantProducts: true,
        usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
        prices: true,
        assignsTenantTypes: true,
        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: [{ public: "desc" }, { order: "asc" }],
    })
    .catch(() => {
      return [];
    });
}

export async function getAllSubscriptionProducts(isPublic?: boolean): Promise<SubscriptionProductDto[]> {
  if (isPublic) {
    return await db.subscriptionProduct
      .findMany({
        where: {
          active: true,
          public: true,
        },
        include: {
          tenantProducts: true,
          usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
          prices: true,
          assignsTenantTypes: true,
          features: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      })
      .catch(() => {
        return [];
      });
  }
  return await db.subscriptionProduct
    .findMany({
      where: {
        active: true,
      },
      include: {
        tenantProducts: true,
        usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
        prices: true,
        assignsTenantTypes: true,
        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })
    .catch(() => {
      return [];
    });
}

export async function getSubscriptionProductsInIds(ids: string[]): Promise<SubscriptionProductDto[]> {
  return await db.subscriptionProduct.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      tenantProducts: true,
      usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
      prices: true,
      assignsTenantTypes: true,
      features: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getAllSubscriptionFeatures(): Promise<
  { name: string; order: number; title: string; type: number; value: number; accumulate: boolean }[]
> {
  return await db.subscriptionFeature.findMany({
    select: { name: true, order: true, title: true, type: true, value: true, accumulate: true },
  });
}

export async function getSubscriptionProduct(id: string): Promise<SubscriptionProductDto | null> {
  return await db.subscriptionProduct.findUnique({
    where: {
      id,
    },
    include: {
      tenantProducts: true,
      usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
      prices: true,
      assignsTenantTypes: true,
      features: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getSubscriptionProductByStripeId(stripeId: string) {
  return await db.subscriptionProduct.findFirst({
    where: {
      stripeId,
    },
  });
}

export async function getSubscriptionPrices(): Promise<SubscriptionPriceWithProduct[]> {
  return await db.subscriptionPrice
    .findMany({
      include: {
        subscriptionProduct: true,
      },
      orderBy: [
        {
          subscriptionProduct: {
            order: "asc",
          },
        },
        {
          price: "asc",
        },
      ],
    })
    .catch(() => {
      return [];
    });
}

export async function getSubscriptionPrice(id: string): Promise<SubscriptionPriceWithProduct | null> {
  return await db.subscriptionPrice
    .findUnique({
      where: { id },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getSubscriptionPriceByStripeId(stripeId: string): Promise<SubscriptionPriceWithProduct | null> {
  return await db.subscriptionPrice
    .findFirst({
      where: { stripeId },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getSubscriptionUsageBasedPriceByStripeId(stripeId: string): Promise<SubscriptionUsageBasedPriceWithProduct | null> {
  return await db.subscriptionUsageBasedPrice
    .findFirst({
      where: { stripeId },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function createSubscriptionProduct(data: {
  stripeId: string;
  order: number;
  title: string;
  model: PricingModel;
  description?: string;
  badge?: string;
  groupTitle?: string;
  groupDescription?: string;
  active: boolean;
  public: boolean;
  billingAddressCollection: string;
  hasQuantity: boolean;
  canBuyAgain: boolean;
}): Promise<SubscriptionProduct> {
  return await db.subscriptionProduct.create({
    data: {
      stripeId: data.stripeId,
      order: data.order,
      title: data.title,
      model: data.model,
      description: data.description,
      badge: data.badge,
      groupTitle: data.groupTitle,
      groupDescription: data.groupDescription,
      active: data.active,
      public: data.public,
      billingAddressCollection: data.billingAddressCollection,
      hasQuantity: data.hasQuantity,
      canBuyAgain: data.canBuyAgain,
    },
  });
}

export async function updateSubscriptionProduct(
  id: string,
  data: {
    stripeId?: string;
    order?: number;
    title?: string;
    model?: PricingModel;
    description?: string | null;
    badge?: string | null;
    groupTitle?: string | null;
    groupDescription?: string | null;
    public?: boolean;
    billingAddressCollection?: string;
    hasQuantity?: boolean;
    canBuyAgain?: boolean;
  }
): Promise<SubscriptionProduct> {
  return await db.subscriptionProduct.update({
    where: {
      id,
    },
    data: {
      stripeId: data.stripeId,
      order: data.order,
      title: data.title,
      model: data.model,
      description: data.description,
      badge: data.badge,
      groupTitle: data.groupTitle,
      groupDescription: data.groupDescription,
      public: data.public,
      billingAddressCollection: data.billingAddressCollection,
      hasQuantity: data.hasQuantity,
      canBuyAgain: data.canBuyAgain,
    },
  });
}

export async function updateSubscriptionProductStripeId(id: string, data: { stripeId: string }) {
  return await db.subscriptionProduct.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateSubscriptionPriceStripeId(id: string, data: { stripeId: string }) {
  return await db.subscriptionPrice.update({
    where: {
      id,
    },
    data,
  });
}

export async function createSubscriptionPrice(data: {
  subscriptionProductId: string;
  stripeId: string;
  type: SubscriptionPriceType;
  billingPeriod: SubscriptionBillingPeriod;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
}): Promise<SubscriptionPrice> {
  return await db.subscriptionPrice.create({ data });
}

export async function createSubscriptionUsageBasedPrice(data: {
  subscriptionProductId: string;
  stripeId: string;
  currency: string;
  billingPeriod: SubscriptionBillingPeriod;
  unit: string;
  unitTitle: string;
  unitTitlePlural: string;
  usageType: string;
  aggregateUsage: string;
  tiersMode: string;
  billingScheme: string;
}): Promise<SubscriptionUsageBasedPrice> {
  return await db.subscriptionUsageBasedPrice.create({ data });
}

export async function createSubscriptionUsageBasedTier(data: {
  subscriptionUsageBasedPriceId: string;
  from: number;
  to: number | undefined;
  perUnitPrice: number | undefined;
  flatFeePrice: number | undefined;
}): Promise<SubscriptionUsageBasedTier> {
  return await db.subscriptionUsageBasedTier.create({ data });
}

export async function createSubscriptionFeature(
  subscriptionProductId: string,
  data: {
    order: number;
    title: string;
    name: string;
    type: SubscriptionFeatureLimitType;
    value: number;
    href?: string | null;
    badge?: string | null;
    accumulate?: boolean;
  }
): Promise<SubscriptionFeature> {
  return await db.subscriptionFeature.create({
    data: {
      subscriptionProductId,
      order: data.order,
      title: data.title,
      name: data.name,
      type: data.type,
      value: data.value,
      href: data.href,
      badge: data.badge,
      accumulate: data.accumulate,
    },
  });
}

export async function deleteSubscriptionProduct(id: string) {
  return await db.subscriptionProduct.delete({
    where: {
      id,
    },
  });
}

export async function deleteSubscriptionPrice(id: string) {
  return await db.subscriptionPrice.delete({
    where: {
      id,
    },
  });
}

export async function deleteSubscriptionUsageBasedTier(id: string) {
  return await db.subscriptionUsageBasedTier.delete({
    where: {
      id,
    },
  });
}

export async function deleteSubscriptionUsageBasedPrice(id: string) {
  return await db.subscriptionUsageBasedPrice.delete({
    where: {
      id,
    },
  });
}

export async function deleteSubscriptionFeatures(subscriptionProductId: string) {
  return await db.subscriptionFeature.deleteMany({
    where: {
      subscriptionProductId,
    },
  });
}
