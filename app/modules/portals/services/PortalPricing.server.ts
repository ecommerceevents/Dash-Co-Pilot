import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import {
  createPortalSubscriptionProduct,
  createPortalSubscriptionPrice,
  createPortalSubscriptionFeature,
  updatePortalSubscriptionProductStripeId,
  updatePortalSubscriptionPriceStripeId,
  deletePortalSubscriptionPrice,
  deletePortalSubscriptionProduct,
  updatePortalSubscriptionProduct,
  deletePortalSubscriptionFeatures,
} from "../db/portalSubscriptionProducts.db.server";
import { TFunction } from "i18next";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import PortalSubscriptionServer from "./PortalSubscription.server";
import PortalStripeServer from "./PortalStripe.server";

async function createPlans(portalId: string, plans: SubscriptionProductDto[]) {
  let idx = 0;
  for (const plan of plans.sort((a, b) => a.order - b.order)) {
    // wait 5 seconds between each plan creation
    await createPlan(
      portalId,
      plan,
      plan.prices.map((price) => {
        return {
          billingPeriod: price.billingPeriod,
          currency: price.currency,
          price: Number(price.price),
        };
      }),
      plan.features
    );
    idx++;
    if (idx < plans.length) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function createPlan(
  portalId: string,
  plan: SubscriptionProductDto,
  prices: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string; trialDays?: number }[],
  features: SubscriptionFeatureDto[],
  t?: TFunction
) {
  // Create stripe product
  const stripeProduct = await PortalStripeServer.createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  // Save to db
  const product = await createPortalSubscriptionProduct({
    portalId,
    stripeId: stripeProduct?.id ?? "",
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description ?? undefined,
    badge: plan.badge ?? undefined,
    groupTitle: plan.groupTitle ?? undefined,
    groupDescription: plan.groupDescription ?? undefined,
    active: plan.active,
    public: plan.public,
    billingAddressCollection: plan.billingAddressCollection ?? "auto",
    hasQuantity: plan.hasQuantity ?? false,
    canBuyAgain: plan.canBuyAgain ?? false,
  });

  if (!product) {
    throw new Error("Could not create subscription product");
  }

  await Promise.all(
    prices.map(async (price) => {
      // Create stripe price
      const stripePrice = await PortalStripeServer.createStripePrice(stripeProduct?.id ?? "", price);
      // Save to db
      return await createPortalSubscriptionPrice({
        ...price,
        portalId,
        subscriptionProductId: product.id,
        stripeId: stripePrice?.id ?? "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: price.billingPeriod,
        price: price.price,
        currency: price.currency,
        trialDays: price.trialDays ?? 0,
        active: true,
      });
    })
  );

  await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        // Save to db
        return await createPortalSubscriptionFeature(portalId, product.id, feature);
      })
  );
}

async function syncPlan(
  portalId: string,
  plan: SubscriptionProductDto,
  prices: { id?: string; billingPeriod: SubscriptionBillingPeriod; price: number; currency: string }[]
) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }
  const stripeProduct = await PortalStripeServer.createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  if (!stripeProduct) {
    throw new Error("Could not create product");
  }
  await updatePortalSubscriptionProductStripeId(portalId, plan.id, {
    stripeId: stripeProduct.id,
  });

  prices.map(async (price) => {
    // Create stripe price
    const stripePrice = await PortalStripeServer.createStripePrice(stripeProduct?.id ?? "", price);
    if (!stripePrice) {
      throw new Error(`Could not create price ${plan.title} - ${price.price}`);
    }
    // Save to db
    await updatePortalSubscriptionPriceStripeId(portalId, price.id ?? "", {
      stripeId: stripePrice?.id ?? "",
    });
  });
}

async function updatePlan(portalId: string, plan: SubscriptionProductDto, features: SubscriptionFeatureDto[]) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }

  await PortalStripeServer.updateStripeProduct(plan.stripeId, { title: plan.translatedTitle ?? plan.title });

  await updatePortalSubscriptionProduct(portalId, plan.id, {
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description ?? undefined,
    badge: plan.badge ?? undefined,
    groupTitle: plan.groupTitle ?? undefined,
    groupDescription: plan.groupDescription ?? undefined,
    public: plan.public,
    billingAddressCollection: plan.billingAddressCollection ?? "auto",
    hasQuantity: plan.hasQuantity === undefined ? undefined : plan.hasQuantity,
    canBuyAgain: plan.canBuyAgain === undefined ? undefined : plan.canBuyAgain,
  });

  await deletePortalSubscriptionFeatures(portalId, plan.id ?? "");
  await PortalSubscriptionServer.clearSubscriptionsCache(portalId);

  return await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        return await createPortalSubscriptionFeature(portalId, plan.id ?? "", feature);
      })
  );
}

async function deletePlan(portalId: string, plan: SubscriptionProductDto) {
  await PortalSubscriptionServer.clearSubscriptionsCache(portalId);
  // eslint-disable-next-line no-console
  console.log(`Deleting ${plan.prices?.length} Flat-rate Prices`);

  await Promise.all(
    plan.prices
      .filter((f) => f.stripeId)
      .map(async (price) => {
        await PortalStripeServer.archiveStripePrice(price.stripeId);

        if (price.id) {
          await deletePortalSubscriptionPrice(portalId, price.id);
        }

        return null;
      })
  );

  // eslint-disable-next-line no-console
  console.log("Deleting Product with Stripe ID: " + plan.stripeId);
  if (plan.stripeId) {
    try {
      await PortalStripeServer.deleteStripeProduct(plan.stripeId);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      await PortalStripeServer.archiveStripeProduct(plan.stripeId);
    }
  }

  if (plan.id) {
    await deletePortalSubscriptionProduct(portalId, plan.id);
  }
}

export default {
  createPlans,
  createPlan,
  syncPlan,
  updatePlan,
  deletePlan,
};
