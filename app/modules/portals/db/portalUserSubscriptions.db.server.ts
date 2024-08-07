import { PortalUserSubscription } from "@prisma/client";
import { clearCacheKey } from "~/utils/cache.server";
import { PortalUserSubscriptionProductWithDetails } from "./portalUserSubscriptionProducts.db.server";
import { db } from "~/utils/db.server";
import PortalUserSubscriptionProductModelHelper from "../helpers/PortalUserSubscriptionProductModelHelper";

export type PortalUserSubscriptionWithDetails = PortalUserSubscription & {
  products: PortalUserSubscriptionProductWithDetails[];
};

export async function getOrPersistPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetails> {
  const subscription = await db.portalUserSubscription.findUnique({
    where: {
      portalId,
      portalUserId,
    },
    include: {
      products: {
        include: PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
        orderBy: {
          subscriptionProduct: {
            order: "desc",
          },
        },
      },
    },
  });

  if (!subscription) {
    return await createPortalUserSubscription(portalId, portalUserId, "");
  }
  return subscription;
}

export async function getPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetails | null> {
  return await db.portalUserSubscription.findUnique({
    where: {
      portalId,
      portalUserId,
    },
    include: {
      products: {
        include: PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
        orderBy: {
          subscriptionProduct: {
            order: "desc",
          },
        },
      },
    },
  });
}

export async function getPortalUserSubscriptions(portalId: string): Promise<PortalUserSubscriptionWithDetails[]> {
  return await db.portalUserSubscription.findMany({
    where: {
      portalId,
    },
    include: {
      products: {
        include: {
          subscriptionProduct: { include: { features: true } },
          prices: { include: { subscriptionPrice: true } },
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

export async function createPortalUserSubscription(portalId: string, portalUserId: string, stripeCustomerId: string) {
  return await db.portalUserSubscription
    .create({
      data: {
        portalId,
        portalUserId,
        stripeCustomerId,
      },
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: { include: { subscriptionPrice: true } },
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
      clearCacheKey(`portalUserSubscription:${portalId}:${portalUserId}`);
      return item;
    });
}

export async function updatePortalUserSubscriptionCustomerId(portalId: string, portalUserId: string, data: { stripeCustomerId: string }) {
  return await db.portalUserSubscription
    .update({
      where: {
        portalId,
        portalUserId,
      },
      data,
    })
    .then((item) => {
      clearCacheKey(`portalUserSubscription:${portalId}:${portalUserId}`);
      return item;
    });
}
