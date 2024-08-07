import { PortalSubscriptionFeature, PortalSubscriptionPrice, PortalSubscriptionProduct } from ".prisma/client";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { db } from "~/utils/db.server";

export type PortalSubscriptionPriceWithProduct = PortalSubscriptionPrice & {
  subscriptionProduct: PortalSubscriptionProduct;
};

export async function getAllPortalSubscriptionProductsWithUsers(portalId: string): Promise<SubscriptionProductDto[]> {
  return await db.portalSubscriptionProduct
    .findMany({
      where: {
        portalId,
      },
      include: {
        portalUserProducts: true,

        prices: true,

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

export async function getAllPortalSubscriptionProducts(portalId: string, isPublic?: boolean): Promise<SubscriptionProductDto[]> {
  if (isPublic) {
    return await db.portalSubscriptionProduct
      .findMany({
        where: {
          portalId,
          active: true,
          public: true,
        },
        include: {
          portalUserProducts: true,

          prices: true,

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
  return await db.portalSubscriptionProduct
    .findMany({
      where: {
        portalId,
        active: true,
      },
      include: {
        portalUserProducts: true,

        prices: true,

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

export async function getPortalSubscriptionProductsInIds(portalId: string, ids: string[]): Promise<SubscriptionProductDto[]> {
  return await db.portalSubscriptionProduct.findMany({
    where: {
      portalId,
      id: { in: ids },
    },
    include: {
      portalUserProducts: true,

      prices: true,

      features: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getAllPortalSubscriptionFeatures(
  portalId: string
): Promise<{ name: string; order: number; title: string; type: number; value: number; accumulate: boolean }[]> {
  return await db.portalSubscriptionFeature.findMany({
    where: {
      portalId,
    },
    select: { name: true, order: true, title: true, type: true, value: true, accumulate: true },
  });
}

export async function getPortalSubscriptionProduct(portalId: string, id: string): Promise<SubscriptionProductDto | null> {
  return await db.portalSubscriptionProduct.findUnique({
    where: {
      portalId,
      id,
    },
    include: {
      portalUserProducts: true,

      prices: true,

      features: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getPortalSubscriptionProductByStripeId(portalId: string, stripeId: string) {
  return await db.portalSubscriptionProduct.findFirst({
    where: {
      portalId,
      stripeId,
    },
  });
}

export async function getPortalSubscriptionPrices(portalId: string): Promise<PortalSubscriptionPriceWithProduct[]> {
  return await db.portalSubscriptionPrice
    .findMany({
      where: {
        portalId,
      },
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

export async function getPortalSubscriptionPrice(portalId: string, id: string): Promise<PortalSubscriptionPriceWithProduct | null> {
  return await db.portalSubscriptionPrice
    .findUnique({
      where: { portalId, id },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getPortalSubscriptionPriceByStripeId(portalId: string, stripeId: string): Promise<PortalSubscriptionPriceWithProduct | null> {
  return await db.portalSubscriptionPrice
    .findFirst({
      where: { portalId, stripeId },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function createPortalSubscriptionProduct(data: {
  portalId: string;
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
}): Promise<PortalSubscriptionProduct> {
  return await db.portalSubscriptionProduct.create({
    data: {
      portalId: data.portalId,
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

export async function updatePortalSubscriptionProduct(
  portalId: string,
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
): Promise<PortalSubscriptionProduct> {
  return await db.portalSubscriptionProduct.update({
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

export async function updatePortalSubscriptionProductStripeId(portalId: string, id: string, data: { stripeId: string }) {
  return await db.portalSubscriptionProduct.update({
    where: {
      portalId,
      id,
    },
    data,
  });
}

export async function updatePortalSubscriptionPriceStripeId(portalId: string, id: string, data: { stripeId: string }) {
  return await db.portalSubscriptionPrice.update({
    where: {
      portalId,
      id,
    },
    data,
  });
}

export async function createPortalSubscriptionPrice(data: {
  portalId: string;
  subscriptionProductId: string;
  stripeId: string;
  type: SubscriptionPriceType;
  billingPeriod: SubscriptionBillingPeriod;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
}): Promise<PortalSubscriptionPrice> {
  return await db.portalSubscriptionPrice.create({
    data: {
      portalId: data.portalId,
      subscriptionProductId: data.subscriptionProductId,
      stripeId: data.stripeId,
      type: data.type,
      billingPeriod: data.billingPeriod,
      price: data.price,
      currency: data.currency,
      trialDays: data.trialDays,
      active: data.active,
    },
  });
}

export async function createPortalSubscriptionFeature(
  portalId: string,
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
): Promise<PortalSubscriptionFeature> {
  return await db.portalSubscriptionFeature.create({
    data: {
      portalId,
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

export async function deletePortalSubscriptionProduct(portalId: string, id: string) {
  return await db.portalSubscriptionProduct.delete({
    where: {
      portalId,
      id,
    },
  });
}

export async function deletePortalSubscriptionPrice(portalId: string, id: string) {
  return await db.portalSubscriptionPrice.delete({
    where: {
      portalId,
      id,
    },
  });
}

export async function deletePortalSubscriptionFeatures(portalId: string, subscriptionProductId: string) {
  return await db.portalSubscriptionFeature.deleteMany({
    where: {
      portalId,
      subscriptionProductId,
    },
  });
}
