import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";

export interface PlanFeatureUsageDto {
  order: number;
  title: string;
  name: string;
  type: SubscriptionFeatureLimitType;
  value: number;
  used: number;
  remaining: number | "unlimited";
  enabled: boolean;
  message: string;
  entity?: { id: string; title: string; titlePlural: string; slug: string };
  period?: {
    firstDay: Date | null;
    lastDay: Date | null;
  };
}
