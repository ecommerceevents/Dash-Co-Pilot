import { BillingPeriodDto } from "../dtos/subscriptions/BillingPeriodDto";
import { SubscriptionBillingPeriod } from "../enums/subscriptions/SubscriptionBillingPeriod";

const billingPeriods: BillingPeriodDto[] = [
  {
    value: SubscriptionBillingPeriod.ONCE,
    recurring: false,
  },
  {
    value: SubscriptionBillingPeriod.MONTHLY,
    default: true,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.QUARTERLY,
    disabled: false,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.SEMI_ANNUAL,
    disabled: false,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.YEARLY,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.DAILY,
    disabled: true,
    recurring: true,
  },
  {
    value: SubscriptionBillingPeriod.WEEKLY,
    disabled: true,
    recurring: true,
  },
];
export default billingPeriods;
