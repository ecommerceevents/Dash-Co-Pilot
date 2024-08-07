import { SubscriptionProductDto } from "./SubscriptionProductDto";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionUsageBasedTier } from "@prisma/client";
import { Decimal } from "decimal.js";

export interface SubscriptionPriceDto {
  id?: string;
  stripeId: string;
  type: SubscriptionPriceType;
  billingPeriod: SubscriptionBillingPeriod;
  price: number | Decimal;
  currency: string;
  trialDays: number;
  active: boolean;
  priceBefore?: number;
  subscriptionProductId: string;
  subscriptionProduct?: SubscriptionProductDto;
  usageBasedPrices?: SubscriptionUsageBasedTier[];
}
