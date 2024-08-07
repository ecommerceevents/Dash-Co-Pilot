import Stripe from "stripe";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

export type PricingBlockDto = {
  style: PricingBlockStyle;
  allowCoupons?: boolean;
  contactUs?: PricingContactUsDto;
  headline?: string;
  subheadline?: string;
  position?: "left" | "center" | "right";
  data?: {
    items: SubscriptionProductDto[];
    coupon: { error?: string; stripeCoupon?: Stripe.Coupon | null } | undefined;
    currenciesAndPeriod: {
      currencies: { value: string; options: string[] };
      billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
    };
  } | null;
};

export type PricingContactUsDto = {
  title: string;
  description: string;
  features: string[];
};

export const PricingBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type PricingBlockStyle = (typeof PricingBlockStyles)[number]["value"];

export const defaultPricingBlock: PricingBlockDto = {
  style: "simple",
  allowCoupons: true,
  contactUs: {
    title: "pricing.contactUs",
    description: "pricing.customPlanDescription",
    features: ["+12 users", "Unlimited API calls", "Priority support"],
  },
  data: null,
};
