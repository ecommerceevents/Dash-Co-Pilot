import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

export interface CreateUsageBasedPriceTiersDto {
  currency: string;
  billingPeriod: SubscriptionBillingPeriod;
  usage_type: "licensed" | "metered";
  aggregate_usage: string | "last_during_period" | "last_ever" | "max" | "sum";
  tiers_mode: string | "graduated" | "volume";
  billing_scheme: string | "per_unit" | "tiered";
  tiers: {
    from: number;
    up_to: "inf" | number;
    unit_amount: number | undefined;
    flat_amount: number | undefined;
  }[];
}
