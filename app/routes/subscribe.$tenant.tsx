import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { AppLoaderData } from "~/utils/data/useAppData";
import { loadAppData } from "~/utils/data/.server/appData";
import PlansGrouped from "~/components/core/settings/subscription/plans/PlansGrouped";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { getAllSubscriptionProducts, getSubscriptionProductsInIds } from "~/utils/db/subscriptionProducts.db.server";
import { getOrPersistTenantSubscription, updateTenantSubscriptionCustomerId } from "~/utils/db/tenantSubscriptions.db.server";
import { createStripeCheckoutSession, createStripeCustomer, getStripeCoupon } from "~/utils/stripe.server";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef } from "react";
import SubscriptionHelper from "~/utils/helpers/SubscriptionHelper";
import { useTypedLoaderData } from "remix-typedjson";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import Stripe from "stripe";
import { getBaseURL } from "~/utils/url.server";
import { getCurrenciesAndPeriods, getDefaultBillingPeriod, getDefaultCurrency } from "~/utils/helpers/PricingHelper";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

type LoaderData = AppLoaderData & {
  title: string;
  items: SubscriptionProductDto[];
  coupon?: { error?: string; stripeCoupon?: Stripe.Coupon | null };
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "subscribe.$tenant");
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);

  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    throw redirect(`/app`);
  }

  const appData = await time(loadAppData({ request, params, t }, time), "loadAppData");
  let items = await getAllSubscriptionProducts(true);
  const searchParams = new URL(request.url).searchParams;
  const planParam = searchParams.get("plan")?.toString();
  if (planParam) {
    items = await getSubscriptionProductsInIds([planParam]);
  }

  const couponParam = searchParams.get("coupon");
  let coupon: { error?: string; stripeCoupon?: Stripe.Coupon | null } | undefined = undefined;
  if (couponParam) {
    try {
      const stripeCoupon = await getStripeCoupon(couponParam);
      if (!stripeCoupon) {
        throw Error(t("pricing.coupons.invalid"));
      }
      if (stripeCoupon.max_redemptions && stripeCoupon.times_redeemed > stripeCoupon.max_redemptions) {
        throw Error(t("pricing.coupons.expired"));
      }
      if (!stripeCoupon.valid) {
        throw Error(t("pricing.coupons.invalid"));
      }
      coupon = { stripeCoupon };
    } catch (e: any) {
      coupon = { error: e.message };
    }
  }

  const defaultCurrency = getDefaultCurrency(request);
  const defaultBillingPeriod = getDefaultBillingPeriod(request);

  const data: LoaderData = {
    title: `${t("pricing.subscribe")} | ${process.env.APP_NAME}`,
    ...appData,
    items,
    coupon,
    currenciesAndPeriod: getCurrenciesAndPeriods(
      items.flatMap((f) => f.prices),
      defaultCurrency,
      defaultBillingPeriod
    ),
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
  const form = await request.formData();

  const tenantSubscription = await getOrPersistTenantSubscription(tenantId);
  const user = await getUser(userInfo.userId);
  const tenant = await getTenant(tenantId);

  if (!tenantSubscription.stripeCustomerId && user && tenant) {
    const customer = await createStripeCustomer(user.email, tenant.name);
    if (customer) {
      tenantSubscription.stripeCustomerId = customer.id;
      await updateTenantSubscriptionCustomerId(tenant.id, {
        stripeCustomerId: customer.id,
      });
    }
  }

  const action = form.get("action")?.toString();

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    return badRequest({
      error: "Invalid stripe customer",
    });
  }

  if (action === "subscribe") {
    try {
      const selectedPlan = await SubscriptionHelper.getPlanFromForm(form);
      const session = await createStripeCheckoutSession({
        subscriptionProduct: selectedPlan.product,
        customer: tenantSubscription.stripeCustomerId,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: `${getBaseURL(request)}/subscribe/${params.tenant}/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${request.url}`,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      });
      if (!session || !session.url) {
        return badRequest({
          error: "Could not update subscription",
        });
      }
      return redirect(session.url);
    } catch (e: any) {
      return badRequest({ error: t(e.message) });
    }
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AppSubscriptionRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  function canSubscribe() {
    return getUserHasPermission(data, "app.settings.subscription.update");
  }
  return (
    <div>
      <div className="pt-4">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-shrink-0 justify-center">
            <div className="mt-4 flex">
              <Link to={`/app/${data.currentTenant.slug}/settings/subscription`} className="w-full text-center text-sm font-medium hover:underline">
                <span aria-hidden="true"> &larr;</span> {t(t("settings.subscription.goToSubscription"))}
              </Link>
            </div>
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-7xl space-y-4 overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.pricing.title")}</h1>
                <p className="text-muted-foreground mt-4 text-lg leading-6">
                  {searchParams.get("error")?.toString() === "subscription_required" ? (
                    <span className="text-red-500">{t("pricing.required")}</span>
                  ) : (
                    <span>{t("front.pricing.headline")}</span>
                  )}
                </p>
              </div>
              {data?.items && (
                <PlansGrouped
                  items={data.items}
                  canSubmit={canSubscribe()}
                  tenantSubscription={data.mySubscription}
                  stripeCoupon={data.coupon?.stripeCoupon || null}
                  currenciesAndPeriod={data.currenciesAndPeriod}
                />
              )}
              <ErrorModal ref={errorModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
