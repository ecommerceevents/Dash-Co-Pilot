import { TenantSubscriptionProductPrice } from "@prisma/client";
import { Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionPriceDto } from "~/application/dtos/subscriptions/SubscriptionPriceDto";
import { Colors } from "~/application/enums/shared/Colors";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useRootData } from "~/utils/data/useRootData";
import { TenantSubscriptionProductWithDetails } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import { getFormattedPriceInCurrency } from "~/utils/helpers/PricingHelper";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  item: TenantSubscriptionProductWithDetails;
  onCancel?: (item: TenantSubscriptionProductWithDetails) => void;
}
export default function TenantProduct({ item, onCancel }: Props) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const confirmModal = useRef<RefConfirmModal>(null);
  function getFormattedPrice(price: TenantSubscriptionProductPrice & { subscriptionPrice: SubscriptionPriceDto | null }) {
    const formattedPrice = getFormattedPriceInCurrency({ price: Number(price.subscriptionPrice?.price), currency: price.subscriptionPrice?.currency });
    let priceString = ``;
    if (price.subscriptionPrice?.billingPeriod === SubscriptionBillingPeriod.ONCE) {
      priceString = `${formattedPrice} x ${item.quantity ?? 1} ${t("pricing.periods.ONCE")}`;
    } else if (price.subscriptionPrice?.billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      priceString = `${formattedPrice}/${t("pricing.periods.MONTHLY")}`;
    } else if (price.subscriptionPrice?.billingPeriod === SubscriptionBillingPeriod.YEARLY) {
      priceString = `${formattedPrice}/${t("pricing.periods.YEARLY")}`;
    }
    return priceString;
  }
  function getPlanTitle() {
    if (item.quantity && item.quantity > 1) {
      return `${item.quantity} x ${t(item.subscriptionProduct.title)}`;
    }
    return `${t(item.subscriptionProduct.title)}`;
  }
  function cancelSubscription() {
    confirmModal.current?.show(t("settings.subscription.confirmCancel"));
  }
  function confirmedCancel() {
    if (onCancel) {
      onCancel(item);
    }
  }
  return (
    <div className="group space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex w-full justify-between">
        <div className="text-base font-medium text-gray-900">{getPlanTitle()}</div>
        <div className="flex-shrink-0">
          {item.cancelledAt ? (
            <SimpleBadge title={t("settings.subscription.cancelled")} color={Colors.RED} />
          ) : (
            <SimpleBadge title={t("settings.subscription.active")} color={Colors.GREEN} />
          )}
        </div>
      </div>

      <div className="w-full border border-gray-100"></div>

      {item.currentPeriodStart && item.currentPeriodEnd && (
        <div className="flex flex-col text-sm text-gray-700 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-2">
            {!item.endsAt ? (
              <div title={`From ${DateUtils.dateYMDHMSMS(item.currentPeriodStart)} to ${DateUtils.dateYMDHMSMS(item.currentPeriodEnd)}`}>
                {t("settings.subscription.period.current")} ({DateUtils.dateMonthDayYear(item.currentPeriodStart)} –{" "}
                {DateUtils.dateMonthDayYear(item.currentPeriodEnd)})
              </div>
            ) : (
              <div className="flex space-x-2">
                <div>
                  {new Date() < new Date(item.endsAt) ? (
                    <span>
                      {t("settings.subscription.ends")} {DateUtils.dateMonthDayYear(item.endsAt)}
                    </span>
                  ) : (
                    <span>
                      {t("settings.subscription.endedAt")} {DateUtils.dateMonthDayYear(item.endsAt)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            {!item.cancelledAt && (
              <button
                type="button"
                onClick={cancelSubscription}
                className="invisible border border-transparent px-2 py-1 text-sm text-gray-700  hover:rounded-md hover:border-gray-200 hover:bg-gray-50 group-hover:visible group-hover:underline"
              >
                {t("settings.subscription.cancel")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-1">
        {item.prices
          .sort((a) => {
            if (a.subscriptionPrice) {
              return -1;
            }
            return 1;
          })
          .map((price) => {
            return (
              <Fragment key={price.id}>
                {price.subscriptionPrice && (
                  <div className="flex items-baseline space-x-1 text-sm text-gray-500">
                    <span>{getFormattedPrice(price)}</span>
                    {/* <span className="text-xs uppercase">{price.subscriptionPrice.currency}</span> */}
                  </div>
                )}
                {price.subscriptionUsageBasedPrice && (
                  <div className="text-sm text-gray-500">
                    <div className="font-bold">{t(price.subscriptionUsageBasedPrice.unitTitlePlural)}</div>
                    {price.subscriptionUsageBasedPrice.tiers
                      .sort((a, b) => a.from - b.from)
                      .map((tier, idx) => {
                        return (
                          <div key={idx} className="flex items-center space-x-1">
                            {price.subscriptionUsageBasedPrice?.tiersMode === "graduated" ? <div>{idx === 0 ? "First" : "Next"}</div> : <div>Total</div>}
                            {tier.to ? (
                              <>
                                <div>{tier.from}</div>
                                <div>-</div>
                                <div>{tier.to ? tier.to : "-"}</div>
                              </>
                            ) : (
                              <>
                                <div>{">="}</div>
                                <div>{tier.from}</div>
                              </>
                            )}
                            {tier.perUnitPrice && (
                              <div>
                                <>
                                  +
                                  {getFormattedPriceInCurrency({
                                    price: Number(tier.perUnitPrice),
                                    currency: price.subscriptionUsageBasedPrice?.currency,
                                  })}{" "}
                                  x {t(price.subscriptionUsageBasedPrice?.unitTitle ?? "")}
                                </>
                              </div>
                            )}
                            {tier.flatFeePrice && (
                              <div>
                                <>+{getFormattedPriceInCurrency({ price: Number(tier.flatFeePrice), currency: price.subscriptionUsageBasedPrice?.currency })}</>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </Fragment>
            );
          })}
      </div>

      {rootData.debug && (
        <div className="hidden space-y-2 rounded-md border border-dashed border-indigo-300 bg-indigo-50 p-3 text-xs group-hover:block">
          <div className="font-bold">Debug Mode</div>
          <div className="flex items-baseline space-x-2">
            <div className="font-medium">ID:</div>
            <div>{item.id}</div>
          </div>
          {item.stripeSubscriptionId && (
            <div className="flex items-baseline space-x-2">
              <div className="font-medium">Stripe ID:</div>
              <a
                target="_blank"
                className=" underline"
                rel="noreferrer"
                href={`https://dashboard.stripe.com${rootData.isStripeTest ? "/test" : ""}/subscriptions/${item.stripeSubscriptionId}`}
              >
                {item.stripeSubscriptionId}
              </a>
            </div>
          )}
        </div>
      )}
      <ConfirmModal ref={confirmModal} onYes={confirmedCancel} destructive />
    </div>
  );
}
