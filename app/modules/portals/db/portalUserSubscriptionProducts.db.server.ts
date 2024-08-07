import {
  Prisma,
  PortalSubscriptionFeature,
  PortalSubscriptionPrice,
  PortalSubscriptionProduct,
  PortalUserSubscription,
  PortalUserSubscriptionProduct,
  PortalUserSubscriptionProductPrice,
} from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { clearCacheKey } from "~/utils/cache.server";
import PortalUserSubscriptionProductModelHelper from "../helpers/PortalUserSubscriptionProductModelHelper";
import PortalSubscriptionServer from "../services/PortalSubscription.server";

export type PortalUserSubscriptionProductWithDetails = PortalUserSubscriptionProduct & {
  subscriptionProduct: PortalSubscriptionProduct & { features: PortalSubscriptionFeature[] };
  prices: (PortalUserSubscriptionProductPrice & {
    subscriptionPrice: PortalSubscriptionPrice | null;
  })[];
};

export type PortalUserSubscriptionProductWithTenant = PortalUserSubscriptionProductWithDetails & {
  portalUserSubscription: PortalUserSubscription & {
    portalUser: { id: string; email: string };
  };
};

export async function getAllPortalUserSubscriptionProducts(
  portalId: string,
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: PortalUserSubscriptionProductWithTenant[]; pagination: PaginationDto }> {
  let where: Prisma.PortalUserSubscriptionProductWhereInput = {};
  const filterPortalUserId = filters?.properties.find((p) => p.name === "portalUserId")?.value;
  const filterSubscriptionProductId = filters?.properties.find((p) => p.name === "subscriptionProductId")?.value;
  const filterStatus = filters?.properties.find((p) => p.name === "status")?.value;

  where = {
    subscriptionProductId: filterSubscriptionProductId ? { equals: filterSubscriptionProductId } : undefined,
    portalUserSubscription: {
      portalUserId: filterPortalUserId ? { equals: filterPortalUserId } : undefined,
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

  const items = await db.portalUserSubscriptionProduct.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where: {
      portalId,
      ...where,
    },
    include: {
      ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
      portalUserSubscription: {
        include: { portalUser: { select: { id: true, email: true } } },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.portalUserSubscriptionProduct.count({
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

export async function getPortalUserSubscriptionProduct(
  portalId: string,
  portalUserId: string,
  subscriptionProductId: string
): Promise<PortalUserSubscriptionProductWithTenant | null> {
  return await db.portalUserSubscriptionProduct.findFirst({
    where: {
      portalId,
      portalUserSubscription: { portalUserId },
      subscriptionProductId,
    },
    include: {
      portalUserSubscription: {
        include: { portalUser: { select: { id: true, email: true } } },
      },
      ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
    },
  });
}

export async function getPortalUserSubscriptionProductById(portalId: string, id: string): Promise<PortalUserSubscriptionProductWithTenant | null> {
  return await db.portalUserSubscriptionProduct.findUnique({
    where: {
      portalId,
      id,
    },
    include: {
      portalUserSubscription: {
        include: { portalUser: { select: { id: true, email: true } } },
      },
      ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
    },
  });
}

export async function getPortalUserSubscriptionProductByStripeSubscriptionId(
  portalId: string,
  stripeSubscriptionId: string
): Promise<PortalUserSubscriptionProductWithTenant | null> {
  return await db.portalUserSubscriptionProduct.findFirst({
    where: {
      portalId,
      stripeSubscriptionId,
    },
    include: {
      portalUserSubscription: {
        include: { portalUser: { select: { id: true, email: true } } },
      },
      ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
    },
  });
}

export async function addPortalUserSubscriptionProduct(data: {
  portalId: string;
  portalUserSubscriptionId: string;
  subscriptionProductId: string;
  stripeSubscriptionId?: string;
  quantity?: number;
  fromCheckoutSessionId?: string | null;
  prices: {
    subscriptionPriceId?: string;
  }[];
}) {
  return await db.portalUserSubscriptionProduct
    .create({
      data: {
        portalId: data.portalId,
        portalUserSubscriptionId: data.portalUserSubscriptionId,
        subscriptionProductId: data.subscriptionProductId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        quantity: data.quantity,
        fromCheckoutSessionId: data.fromCheckoutSessionId,
        endsAt: null,
        cancelledAt: null,
        prices: {
          create: data.prices.map((price) => ({
            portalId: data.portalId,
            subscriptionPriceId: price.subscriptionPriceId,
          })),
        },
      },
      include: { portalUserSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
      return item;
    });
}

export async function updatePortalUserSubscriptionProduct(
  portalId: string,
  id: string,
  data: {
    quantity?: number;
    cancelledAt?: Date | null;
    endsAt?: Date | null;
  }
) {
  return await db.portalUserSubscriptionProduct
    .update({
      where: { portalId, id },
      data,
      include: { portalUserSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
      return item;
    });
}

export async function cancelPortalUserSubscriptionProduct(
  portalId: string,
  id: string,
  data: {
    cancelledAt: Date | null;
    endsAt: Date | null;
  }
) {
  await PortalSubscriptionServer.clearSubscriptionsCache(portalId);
  return await db.portalUserSubscriptionProduct
    .update({
      where: { portalId, id },
      data: {
        cancelledAt: data.cancelledAt,
        endsAt: data.endsAt,
      },
      include: { portalUserSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
    });
}
