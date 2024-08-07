import { json, redirect } from "@remix-run/node";
import Stripe from "stripe";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import plans from "~/application/pricing/plans.server";
import { PageBlockActionArgs } from "~/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { getAllSubscriptionProducts, getSubscriptionProductsInIds } from "~/utils/db/subscriptionProducts.db.server";
import SubscriptionHelper from "~/utils/helpers/SubscriptionHelper";
import { createStripeCheckoutSession, getStripeCoupon } from "~/utils/stripe.server";
import { getBaseURL } from "~/utils/url.server";
import { PricingBlockDto } from "./PricingBlockUtils";
import FeatureFlagsService from "~/modules/featureFlags/services/FeatureFlagsService";
import { getCurrenciesAndPeriods, getDefaultBillingPeriod, getDefaultCurrency } from "~/utils/helpers/PricingHelper";

export namespace PricingBlockService {
  export async function load({ request, params, t }: PageBlockLoaderArgs) {
    let items = await getAllSubscriptionProducts(true);
    const searchParams = new URL(request.url).searchParams;
    const couponParam = searchParams.get("coupon");
    const planParam = searchParams.get("plan")?.toString();
    if (planParam) {
      items = await getSubscriptionProductsInIds([planParam]);
    }
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
    const debugPricingModel = new URL(request.url).searchParams.get("model");
    const debugModel: PricingModel = debugPricingModel ? (Number(debugPricingModel) as PricingModel) : PricingModel.FLAT_RATE;

    let defaultCurrency = getDefaultCurrency(request);
    let defaultBillingPeriod = getDefaultBillingPeriod(request);

    const currencyFlag = await FeatureFlagsService.getFeatureFlagAction({ request, params, flagName: "currency" });
    if (currencyFlag) {
      // eslint-disable-next-line no-console
      console.log("[currencyFlag]", { currencyFlag });
      defaultCurrency = currencyFlag;
    }

    const filteredItems = items.length > 0 ? items : plans.filter((f) => f.model === debugModel || debugModel === PricingModel.ALL);
    const currenciesAndPeriod = getCurrenciesAndPeriods(
      filteredItems.flatMap((f) => f.prices),
      defaultCurrency,
      defaultBillingPeriod
    );
    return {
      items: filteredItems,
      coupon,
      currenciesAndPeriod,
    } satisfies PricingBlockDto["data"];
  }
  export async function subscribe({ request, form, t }: PageBlockActionArgs) {
    try {
      const selectedPlan = await SubscriptionHelper.getPlanFromForm(form);
      const session = await createStripeCheckoutSession({
        subscriptionProduct: selectedPlan.product,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: `${getBaseURL(request)}/pricing/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${request.url}`,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      });
      return redirect(session?.url ?? "");
    } catch (e: any) {
      return json({ error: t(e.message) }, { status: 400 });
    }
  }
}
