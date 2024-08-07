import Stripe from "stripe";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionUsageBasedPriceDto } from "~/application/dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { cachified } from "./cache.server";
import { getAllSubscriptionProducts } from "./db/subscriptionProducts.db.server";
import { convertToCurrency } from "./services/.server/subscriptionService";

const stripe = new Stripe(process.env.STRIPE_SK?.toString() ?? "", {
  apiVersion: "2022-08-01",
});

export async function createStripeCheckoutSession(data: {
  subscriptionProduct: SubscriptionProductDto;
  customer?: string;
  line_items: { price: string; quantity?: number }[];
  mode: "payment" | "setup" | "subscription";
  success_url: string;
  cancel_url: string;
  freeTrialDays?: number;
  coupon?: string;
  promo_code?: string;
  referral?: string | null;
}) {
  const discounts: { coupon?: string; promotion_code?: string }[] = [];
  if (data.coupon) {
    discounts.push({ coupon: data.coupon });
  } else if (data.promo_code) {
    discounts.push({ promotion_code: data.promo_code });
  }
  let billing_address_collection: "auto" | "required" | undefined = undefined;
  if (data.subscriptionProduct.billingAddressCollection === "required") {
    billing_address_collection = "required";
  } else if (data.subscriptionProduct.billingAddressCollection === "auto") {
    billing_address_collection = "auto";
  }
  let client_reference_id: string | undefined = undefined;
  if (data.referral) {
    client_reference_id = data.referral;
  }
  return await stripe.checkout.sessions
    .create({
      discounts,
      customer: data.customer,
      line_items: data.line_items,
      mode: data.mode,
      success_url: data.success_url,
      cancel_url: data.cancel_url,
      customer_creation: data.mode === "payment" && !data.customer ? "always" : undefined,
      payment_method_collection: data.mode === "subscription" ? "if_required" : undefined,
      subscription_data: {
        trial_period_days: data.freeTrialDays,
      },
      billing_address_collection,
      client_reference_id,
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    });
}

export async function createStripeSetupSession(request: Request, customer: string) {
  return await stripe.checkout.sessions.create({
    customer,
    success_url: `${request.url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.url}`,
    mode: "setup",
    payment_method_types: ["card"],
  });
}

export async function deleteStripePaymentMethod(id: string) {
  return await stripe.paymentMethods.detach(id);
}

export async function getStripeSession(id: string) {
  return await stripe.checkout.sessions
    .retrieve(id, {
      expand: ["line_items"],
    })
    .catch(() => {
      return null;
    });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.del(subscriptionId).catch((e: any) => {
    // eslint-disable-next-line no-console
    console.log("Could not cancel stripe subscription", e.message);
  });
}

export async function reactivateStripeSubscription(subscriptionId: string) {
  return await stripe.subscriptions
    .update(subscriptionId, {
      cancel_at_period_end: false,
    })
    .catch((e: any) => {
      // eslint-disable-next-line no-console
      console.log(e.message);
    });
}

export async function getStripeSubscription(id: string) {
  try {
    return await stripe.subscriptions.retrieve(id);
  } catch (e) {
    return null;
  }
}

export async function createStripeSubscription(customer: string, price: string, trial_end?: number) {
  return await stripe.subscriptions.create({
    customer,
    items: [
      {
        price,
      },
    ],
    trial_end,
  });
}

export async function getStripeInvoices(id: string | null) {
  if (!id) {
    return [];
  }
  try {
    return (
      await stripe.invoices.list({
        customer: id,
      })
    ).data;
  } catch (e) {
    return [];
  }
}

export async function getStripePaymentIntents(id: string | null, status?: Stripe.PaymentIntent.Status) {
  if (!id) {
    return [];
  }
  try {
    let items = (
      await stripe.paymentIntents.list({
        customer: id,
      })
    ).data;
    if (status) {
      items = items.filter((item) => item.status === status);
    }
    return items;
  } catch (e) {
    return [];
  }
}

export async function getStripePaymentIntent(id: string) {
  try {
    return await stripe.paymentIntents.retrieve(id);
  } catch (e) {
    return null;
  }
}

export async function getStripeUpcomingInvoice(id: string | null) {
  if (!id) {
    return null;
  }
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: id,
    });
  } catch (e) {
    return null;
  }
}

export async function getStripePaymentMethods(customer: string | null) {
  if (!customer) {
    return [];
  }
  try {
    return (
      await stripe.paymentMethods.list({
        customer,
        type: "card",
      })
    ).data;
  } catch (e) {
    return [];
  }
}

export async function createStripeCustomer(email: string, name: string) {
  return await stripe.customers
    .create({
      email,
      name,
    })
    .catch((e: any) => {
      // eslint-disable-next-line no-console
      console.error(e.message);
      return null;
    });
}

export async function deleteStripeCustomer(id: string) {
  return await stripe.customers.del(id).catch((e: any) => {
    // eslint-disable-next-line no-console
    console.log("Could not delete stripe customer", e.message);
  });
}

export async function updateStripeCustomerPaymentMethod(id: string, default_payment_method: string) {
  return await stripe.customers.update(id, {
    invoice_settings: { default_payment_method },
  });
}

export async function createStripeProduct(data: { title: string }) {
  return await stripe.products.create({
    name: data.title,
  });
}

export async function updateStripeProduct(id: string, data: { title: string }) {
  return await stripe.products
    .update(id, {
      name: data.title,
    })
    .catch((error) => {
      // console.error(error);
      // ignore
    });
}

export async function createStripePrice(
  productId: string,
  data: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string; trialDays?: number }
) {
  if (!productId) {
    return undefined;
  }
  let recurring:
    | {
        interval: "day" | "week" | "month" | "year";
        trial_period_days: number | undefined;
        interval_count?: number;
      }
    | undefined = undefined;
  switch (data.billingPeriod) {
    case SubscriptionBillingPeriod.MONTHLY:
      recurring = { interval: "month", trial_period_days: data.trialDays };
      break;
    case SubscriptionBillingPeriod.QUARTERLY:
      recurring = { interval: "month", interval_count: 3, trial_period_days: data.trialDays };
      break;
    case SubscriptionBillingPeriod.SEMI_ANNUAL:
      recurring = { interval: "month", interval_count: 6, trial_period_days: data.trialDays };
      break;
    case SubscriptionBillingPeriod.WEEKLY:
      recurring = { interval: "week", trial_period_days: data.trialDays };
      break;
    case SubscriptionBillingPeriod.YEARLY:
      recurring = { interval: "year", trial_period_days: data.trialDays };
      break;
    case SubscriptionBillingPeriod.DAILY:
      recurring = { interval: "day", trial_period_days: data.trialDays };
      break;
  }
  return await stripe.prices.create({
    unit_amount: Math.round(data.price * 100),
    currency: data.currency,
    recurring,
    product: productId,
    active: true,
  });
}

export async function createStripeUsageBasedPrice(productId: string, data: SubscriptionUsageBasedPriceDto) {
  if (!productId) {
    return undefined;
  }
  let interval: "day" | "week" | "month" | "year" = "month";
  let interval_count: number | undefined = undefined;
  switch (data.billingPeriod) {
    case SubscriptionBillingPeriod.MONTHLY:
      interval = "month";
      break;
    case SubscriptionBillingPeriod.QUARTERLY:
      interval = "month";
      interval_count = 3;
      break;
    case SubscriptionBillingPeriod.SEMI_ANNUAL:
      interval = "month";
      interval_count = 6;
      break;
    case SubscriptionBillingPeriod.WEEKLY:
      interval = "week";
      break;
    case SubscriptionBillingPeriod.YEARLY:
      interval = "year";
      break;
    case SubscriptionBillingPeriod.DAILY:
      interval = "day";
      break;
  }
  const usage_type: "licensed" | "metered" = data.usageType === "licensed" ? "licensed" : "metered";
  const tiers_mode: "graduated" | "volume" = data.tiersMode === "graduated" ? "graduated" : "volume";
  const billing_scheme: "per_unit" | "tiered" = data.billingScheme === "per_unit" ? "per_unit" : "tiered";
  let aggregate_usage: "last_during_period" | "last_ever" | "max" | "sum" = "sum";
  if (data.aggregateUsage === "last_during_period") {
    aggregate_usage = "last_during_period";
  } else if (data.aggregateUsage === "last_ever") {
    aggregate_usage = "last_ever";
  } else if (data.aggregateUsage === "max") {
    aggregate_usage = "max";
  }

  const tiers: {
    up_to: "inf" | number;
    unit_amount_decimal?: string;
    flat_amount_decimal?: string;
  }[] = data.tiers
    .sort((x, y) => {
      if (x.to && y.to) {
        return (x.to > y.to ? 1 : -1) ?? 1;
      }
      return 1;
    })
    .map((tier) => {
      let up_to: "inf" | number = Number(tier.to);
      if (tier.to === undefined || tier.to === null) {
        up_to = "inf";
      }
      return {
        up_to,
        unit_amount_decimal: tier.perUnitPrice !== undefined ? (Number(tier.perUnitPrice) * 100)?.toString() : undefined,
        flat_amount_decimal: tier.flatFeePrice !== undefined ? (Number(tier.flatFeePrice) * 100)?.toString() : undefined,
      };
    });

  return await stripe.prices.create({
    currency: data.currency,
    tiers_mode,
    billing_scheme,
    nickname: data.unitTitle,
    recurring: { interval, interval_count, usage_type, aggregate_usage },
    product: productId,
    tiers,
    active: true,
    expand: ["tiers"],
  });
}

export async function deleteStripeProduct(productId: string) {
  return await stripe.products.del(productId);
}

export async function archiveStripeProduct(productId: string) {
  return await stripe.products
    .update(productId, {
      active: false,
    })
    .catch(() => {
      // ignore
    });
}

export async function archiveStripePrice(productId: string) {
  return await stripe.prices
    .update(productId, {
      active: false,
    })
    .catch(() => {
      // ignore
    });
}

export async function getUsageRecordSummaries(id: string) {
  try {
    const items = await stripe.subscriptionItems.listUsageRecordSummaries(id);
    return items.data;
  } catch {
    // ignore
    return [];
  }
}

export async function createUsageRecord(id: string, quantity: number, action: "increment" | "set", timestamp: number | "now" = "now") {
  return await stripe.subscriptionItems
    .createUsageRecord(id, {
      quantity,
      action,
      timestamp,
    })
    .catch(() => {
      // ignore
      return null;
    });
}

export async function getStripeCoupon(id: string) {
  return await stripe.coupons.retrieve(id, {
    expand: ["applies_to"],
  });
}

export async function getStripePromotionCode(id: string) {
  return await stripe.promotionCodes.retrieve(id);
}

export async function getStripeCustomer(id: string | null) {
  if (!id) {
    return null;
  }
  return await stripe.customers.retrieve(id, {
    expand: ["invoice_settings"],
  });
}

export async function getOpenInvoices(id: string) {
  return await cachified({
    key: `stripe:openInvoices:${id}`,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    getFreshValue: () =>
      stripe.invoices.list({
        customer: id,
        status: "open",
      }),
  });
}

export async function createCustomerPortalSession(request: Request, id: string) {
  return await stripe.billingPortal.sessions.create({
    customer: id,
    return_url: `${request.url}`,
  });
}

export async function getAllStripePayments() {
  return cachified({
    key: `stripe:payments`,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    getFreshValue: async () => {
      let items: Stripe.PaymentIntent[] = [];
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      let max = 10;
      while (hasMore) {
        const result: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.charges", "data.invoice"],
        });
        items = items.concat(result.data);
        hasMore = result.has_more;
        startingAfter = result.data[result.data.length - 1].id;
        max--;
        if (max <= 0) {
          break;
        }
      }
      return items;
    },
  });
}

export type StripeRevenueByProductPriceCurrency = {
  product: string;
  billingPeriod: SubscriptionBillingPeriod;
  currency: string;
  revenueInCurrency: number;
  count: number;
  countPercentage: number;
  revenueUsd: number;
  revenuePercentageUsd: number;
};
export async function getStripeRevenueByProductPriceCurrency(): Promise<StripeRevenueByProductPriceCurrency[]> {
  const items: StripeRevenueByProductPriceCurrency[] = [];
  const allProducts = await getAllSubscriptionProducts();

  const payments = await getAllStripePayments();
  payments.forEach((payment) => {
    if (payment.status !== "succeeded") {
      return;
    }
    const invoice = payment.invoice;
    if (typeof invoice === "string") {
      throw new Error("invoice is string");
    }
    const lines = invoice?.lines?.data[0];
    const plan = lines?.plan;
    // const price = lines?.price;
    const amount = payment.amount / 100;
    const currency = payment.currency;
    // const interval = plan?.interval;
    const priceId = plan?.id;

    const productId = plan?.product;
    // const priceType = price?.type;

    const product = allProducts.find((x) => x.stripeId === productId);
    let productName = "?";
    let billingPeriod: SubscriptionBillingPeriod = SubscriptionBillingPeriod.DAILY;
    if (product) {
      productName = product.title;
    }

    const price = product?.prices.find((x) => x.stripeId === priceId);
    if (price) {
      billingPeriod = price.billingPeriod;
    }

    const existing = items.find((x) => x.product === productName && x.currency === currency && x.billingPeriod === billingPeriod);

    let revenueUsd = amount;
    if (currency !== "usd") {
      revenueUsd = convertToCurrency({
        from: currency,
        to: "usd",
        price: amount,
      });
    }

    if (existing) {
      existing.revenueInCurrency += amount;
      existing.revenueUsd += revenueUsd;
      existing.count++;
    } else {
      items.push({
        product: productName,
        billingPeriod,
        currency,
        revenueInCurrency: amount,
        revenueUsd,
        count: 1,
        countPercentage: 0,
        revenuePercentageUsd: 0,
      });
    }
  });

  // process percentages
  const totalRevenue = items.reduce((x, y) => x + y.revenueUsd, 0);
  const totalCount = items.reduce((x, y) => x + y.count, 0);
  items.forEach((item) => {
    item.countPercentage = item.count / totalCount;
    item.revenuePercentageUsd = item.revenueUsd / totalRevenue;
  });

  // sort by revenue desc
  return items.sort((x, y) => (x.revenueUsd > y.revenueUsd ? -1 : 1));
}
