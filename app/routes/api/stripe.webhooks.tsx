import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { TFunction } from "i18next";
import Stripe from "stripe";
import { SubscriptionEndedDto } from "~/modules/events/dtos/SubscriptionEndedDto";
import { getTranslations } from "~/locale/i18next.server";
import { clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";
import { getTenantSubscriptionProductByStripeSubscriptionId } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import EventsService from "~/modules/events/services/.server/EventsService";
import { getStripeSubscription } from "~/utils/stripe.server";
import { SubscriptionCancelledDto } from "~/modules/events/dtos/SubscriptionCancelledDto";
import { clearSubscriptionsCache } from "~/utils/services/.server/subscriptionService";

const stripe = new Stripe(process.env.STRIPE_SK?.toString() ?? "", {
  apiVersion: "2022-08-01",
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET?.toString() ?? "";
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return json("No signature", { status: 400 });
  }
  let event;
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.log(`⚠️  Webhook signature verification failed`, {
      err: err.message,
      sig,
      payload,
      secret,
    });
    return json(err.message, {
      status: 400,
    });
  }

  // eslint-disable-next-line no-console
  console.log({ event });

  if (event.type == "subscription_schedule.canceled") {
    const subscription = event.data.object as Stripe.SubscriptionSchedule;
    await updateTenantSubscription({ request, t, stripeSubscriptionId: subscription.id });
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateTenantSubscription({ request, t, stripeSubscriptionId: subscription.id });
  } else if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateTenantSubscription({ request, t, stripeSubscriptionId: subscription.id });
  }
  return json({
    received: true,
    event: event.type,
  });
};

async function updateTenantSubscription({ request, t, stripeSubscriptionId }: { request: Request; t: TFunction; stripeSubscriptionId: string }) {
  await clearSubscriptionsCache();
  const stripeSubscription = await getStripeSubscription(stripeSubscriptionId);
  if (!stripeSubscription) {
    // eslint-disable-next-line no-console
    console.log("Subscription not found: " + stripeSubscriptionId);
    return json("Subscription not found", { status: 404 });
  }
  const tenantSubscription = await getTenantSubscriptionProductByStripeSubscriptionId(stripeSubscription.id);
  if (!tenantSubscription) {
    // eslint-disable-next-line no-console
    console.log("Account subscription not found: " + stripeSubscriptionId);
    return json("Account subscription not found", { status: 404 });
  }
  // eslint-disable-next-line no-console
  console.log({ stripeSubscription });
  let cancelledAt: Date | null = null;
  let endsAt: Date | null = null;
  if (stripeSubscription.cancel_at) {
    endsAt = new Date(stripeSubscription.cancel_at * 1000);
    cancelledAt = new Date(stripeSubscription.cancel_at * 1000);
  } else if (stripeSubscription.canceled_at) {
    cancelledAt = new Date(stripeSubscription.canceled_at * 1000);
    endsAt = stripeSubscription.ended_at ? new Date(stripeSubscription.ended_at * 1000) : new Date();
  }
  const data: Prisma.TenantSubscriptionProductUpdateInput = {
    cancelledAt,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    endsAt,
  };
  const today = new Date();
  // eslint-disable-next-line no-console
  console.log({ today });
  // notify if has ended
  if (data.endsAt && data.endsAt <= today && !tenantSubscription.endsAt) {
    await EventsService.create({
      request,
      event: "subscription.ended",
      tenantId: tenantSubscription.tenantSubscription.tenant.id,
      userId: null,
      data: {
        user: null,
        tenant: { id: tenantSubscription.tenantSubscription.tenant.id, name: tenantSubscription.tenantSubscription.tenant.name },
        subscription: {
          product: {
            id: tenantSubscription.subscriptionProduct.id,
            title: t(tenantSubscription.subscriptionProduct.title),
          },
        },
      } satisfies SubscriptionEndedDto,
    });
  } else if (data.cancelledAt && tenantSubscription.cancelledAt === null) {
    await EventsService.create({
      request,
      event: "subscription.cancelled",
      tenantId: tenantSubscription.tenantSubscription.tenant.id,
      userId: null,
      data: {
        user: null,
        tenant: { id: tenantSubscription.tenantSubscription.tenant.id, name: tenantSubscription.tenantSubscription.tenant.name },
        subscription: {
          product: {
            id: tenantSubscription.subscriptionProduct.id,
            title: t(tenantSubscription.subscriptionProduct.title),
          },
        },
      } satisfies SubscriptionCancelledDto,
    });
  }
  // eslint-disable-next-line no-console
  console.log({ data });
  return await db.tenantSubscriptionProduct
    .update({
      where: { id: tenantSubscription.id },
      data,
      include: { tenantSubscription: true },
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
      return item;
    });
}
