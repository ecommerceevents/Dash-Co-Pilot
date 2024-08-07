import { SubscriptionPriceDto } from "./SubscriptionPriceDto";
import { SubscriptionFeatureDto } from "./SubscriptionFeatureDto";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { SubscriptionUsageBasedPriceDto } from "./SubscriptionUsageBasedPriceDto";
import { TenantSubscriptionProduct, TenantType } from "@prisma/client";

export interface SubscriptionProductDto {
  id?: string;
  stripeId: string;
  order: number;
  title: string;
  description: string | null;
  groupTitle?: string | null;
  groupDescription?: string | null;
  badge: string | null;
  active: boolean;
  model: PricingModel;
  public: boolean;
  prices: SubscriptionPriceDto[];
  features: SubscriptionFeatureDto[];
  translatedTitle?: string;
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[];
  tenantProducts?: TenantSubscriptionProduct[];
  assignsTenantTypes?: TenantType[];
  billingAddressCollection?: string | null;
  hasQuantity?: boolean;
  canBuyAgain?: boolean;
}
