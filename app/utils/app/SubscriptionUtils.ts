import { TFunction } from "i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceWithProduct } from "../db/subscriptionProducts.db.server";
import DateUtils from "../shared/DateUtils";
import NumberUtils from "../shared/NumberUtils";
import { TenantSubscriptionProductWithDetails } from "../db/subscriptions/tenantSubscriptionProducts.db.server";

function getProductTitle({ t, item }: { t: TFunction; item: TenantSubscriptionProductWithDetails }) {
  let title =
    t(item.subscriptionProduct.title) +
    " " +
    item.prices
      .map(
        (f) => `$${NumberUtils.decimalFormat(Number(f.subscriptionPrice?.price ?? 0))} - ${getBillingPeriodDescription(t, f.subscriptionPrice!.billingPeriod)}`
      )
      .join(", ");
  if (item.endsAt) {
    title += ` (ends ${DateUtils.dateAgo(item.endsAt)})`;
  }
  return title;
}

function getPriceDescription(t: TFunction, item: SubscriptionPriceWithProduct) {
  return `${t(item.subscriptionProduct.title)} - $${NumberUtils.decimalFormat(Number(item.price))} - ${getBillingPeriodDescription(t, item.billingPeriod)}`;
}

function getBillingPeriodDescription(t: TFunction, billingPeriod: SubscriptionBillingPeriod) {
  return t("pricing." + SubscriptionBillingPeriod[billingPeriod].toString()).toString();
}

export default {
  getProductTitle,
  getPriceDescription,
  getBillingPeriodDescription,
};
