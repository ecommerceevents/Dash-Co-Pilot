import { useEffect } from "react";
import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import {
  cancelStripeSubscription,
  createCustomerPortalSession,
  createStripeSetupSession,
  deleteStripePaymentMethod,
  getStripeCustomer,
  getStripeInvoices,
  getStripePaymentIntents,
  getStripePaymentMethods,
  getStripeSubscription,
  getStripeUpcomingInvoice,
} from "~/utils/stripe.server";
import { getUserInfo } from "~/utils/session.server";
import { getUser } from "~/utils/db/users.db.server";
import { getTranslations } from "~/locale/i18next.server";
import Stripe from "stripe";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getOrPersistTenantSubscription, getTenantSubscription } from "~/utils/db/tenantSubscriptions.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getPlanFeaturesUsage } from "~/utils/services/.server/subscriptionService";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
// import MyPaymentMethods from "~/components/core/settings/subscription/MyPaymentMethods";
import { useTypedLoaderData } from "remix-typedjson";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { promiseHash } from "~/utils/promises/promiseHash";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { cancelTenantSubscriptionProduct, getTenantSubscriptionProductById } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import { MetaFunctionArgs } from "~/utils/meta/MetaFunctionArgs";
import EventsService from "~/modules/events/services/.server/EventsService";
import { SubscriptionCancelledDto } from "~/modules/events/dtos/SubscriptionCancelledDto";
import SubscriptionSettings from "~/modules/users/components/SubscriptionSettings";
import toast from "react-hot-toast";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppData } from "~/utils/data/useAppData";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  customer: Stripe.Customer | Stripe.DeletedCustomer | null;
  myInvoices: Stripe.Invoice[];
  myPayments: Stripe.PaymentIntent[];
  myFeatures: PlanFeatureUsageDto[];
  myUpcomingInvoice: Stripe.Invoice | null;
  myPaymentMethods: Stripe.PaymentMethod[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "app.$tenant.settings.subscription");
  let { t } = await time(getTranslations(request), "getTranslations");
  const tenantId = await time(getTenantIdFromUrl(params), "getTenantIdFromUrl");
  await time(verifyUserHasPermission(request, "app.settings.subscription.view", tenantId), "verifyUserHasPermission");

  const userInfo = await time(getUserInfo(request), "getUserInfo");
  const user = await time(getUser(userInfo.userId), "getUser");
  if (!user) {
    return badRequest({ error: "Invalid user" });
  }
  const tenant = await time(getTenant(tenantId), "getTenant");
  if (!tenant) {
    return badRequest({ error: "Invalid tenant with id: " + tenantId });
  }

  const tenantSubscription = await time(getOrPersistTenantSubscription(tenantId), "getOrPersistTenantSubscription");
  const { customer, myInvoices, myPayments, myUpcomingInvoice, myPaymentMethods, myFeatures } = await time(
    promiseHash({
      customer: getStripeCustomer(tenantSubscription.stripeCustomerId),
      myInvoices: getStripeInvoices(tenantSubscription.stripeCustomerId) ?? [],
      myPayments: getStripePaymentIntents(tenantSubscription.stripeCustomerId, "succeeded") ?? [],
      myUpcomingInvoice: getStripeUpcomingInvoice(tenantSubscription.stripeCustomerId),
      myPaymentMethods: getStripePaymentMethods(tenantSubscription.stripeCustomerId),
      myFeatures: getPlanFeaturesUsage(tenantId),
    }),
    "subscription[getStripeData]"
  );
  const data: LoaderData = {
    title: `${t("app.navbar.subscription")} | ${process.env.APP_NAME}`,
    customer,
    myFeatures,
    myInvoices,
    myPayments,
    myUpcomingInvoice,
    myPaymentMethods,
  };
  return json(data, { headers: getServerTimingHeader() });
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const tenantSubscription = await getTenantSubscription(tenantId);
  const form = await request.formData();

  const action = form.get("action")?.toString();

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    return badRequest({
      error: "Invalid stripe customer",
    });
  } else if (action === "cancel") {
    const tenantSubscriptionProductId = form.get("tenant-subscription-product-id")?.toString() ?? "";
    const tenantSubscriptionProduct = await getTenantSubscriptionProductById(tenantSubscriptionProductId);
    if (!tenantSubscriptionProduct?.stripeSubscriptionId) {
      return badRequest({ error: "Not subscribed" });
    }
    const user = await getUser(userInfo.userId);
    const tenant = await getTenant(tenantId);
    if (user && tenant) {
      await EventsService.create({
        request,
        event: "subscription.cancelled",
        tenantId: tenant.id,
        userId: user.id,
        data: {
          user: { id: user.id, email: user.email },
          tenant: { id: tenant.id, name: tenant.name },
          subscription: {
            product: { id: tenantSubscriptionProduct.subscriptionProductId, title: t(tenantSubscriptionProduct.subscriptionProduct.title) },
          },
        } satisfies SubscriptionCancelledDto,
      });
    }
    await cancelStripeSubscription(tenantSubscriptionProduct?.stripeSubscriptionId);
    const stripeSubscription = await getStripeSubscription(tenantSubscriptionProduct.stripeSubscriptionId);
    await cancelTenantSubscriptionProduct(tenantSubscriptionProduct.id, {
      cancelledAt: new Date(),
      endsAt: stripeSubscription?.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(),
    });
    const actionData: ActionData = {
      success: "Successfully cancelled",
    };
    return json(actionData);
  } else if (action === "add-payment-method") {
    const session = await createStripeSetupSession(request, tenantSubscription.stripeCustomerId);
    return redirect(session?.url ?? "");
  } else if (action === "delete-payment-method") {
    await deleteStripePaymentMethod(form.get("id")?.toString() ?? "");
    return json({});
  } else if (action === "open-customer-portal") {
    const session = await createCustomerPortalSession(request, tenantSubscription.stripeCustomerId);
    return redirect(session?.url ?? "");
  }
};

export const meta = ({ data }: MetaFunctionArgs<LoaderData>) => [{ title: data.title }];

export default function SubscriptionRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appData = useAppData();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <EditPageLayout className="mb-12">
      <SubscriptionSettings
        {...data}
        mySubscription={appData.mySubscription}
        currentTenant={appData.currentTenant}
        permissions={{
          viewInvoices: getUserHasPermission(appData, "app.settings.subscription.invoices.view") && data.myInvoices.length > 0,
        }}
      />
    </EditPageLayout>
  );
}
