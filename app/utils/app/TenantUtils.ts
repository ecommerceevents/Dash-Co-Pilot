import { TFunction } from "i18next";
import { TenantWithUsage } from "../db/tenants.db.server";
import SubscriptionUtils from "./SubscriptionUtils";

function getProducts({ t, item }: { t: TFunction; item: TenantWithUsage }) {
  if (item.subscription?.products) {
    return item.subscription.products.map((item) => SubscriptionUtils.getProductTitle({ t, item })).join(", ");
  }
  return "";
}

export default {
  getProducts,
};
