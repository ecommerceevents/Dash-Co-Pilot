import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import clsx from "~/utils/shared/ClassesUtils";
import { useEffect, useState } from "react";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import Plan from "./Plan";
import ToggleBillingPeriod from "./ToggleBillingPeriod";
import CurrencyToggle from "~/components/ui/toggles/CurrencyToggle";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { getBillingPeriodParams, getYearlyDiscount } from "~/utils/helpers/PricingHelper";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import { SubscriptionPriceDto } from "~/application/dtos/subscriptions/SubscriptionPriceDto";
import Stripe from "stripe";
import { useSearchParams } from "@remix-run/react";

interface Props {
  items: SubscriptionProductDto[];
  tenantSubscription?: TenantSubscriptionWithDetails | null;
  canSubmit?: boolean;
  className?: string;
  stripeCoupon: Stripe.Coupon | null;
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
  onClickFeature?: (name: string) => void;
}
export default function Plans({ items, tenantSubscription, canSubmit, className, stripeCoupon, currenciesAndPeriod, onClickFeature }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currency, setCurrency] = useState(currenciesAndPeriod.currencies.value);
  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>(currenciesAndPeriod.billingPeriods.value);

  useEffect(() => {
    if (currency !== currenciesAndPeriod.currencies.value) {
      setCurrency(currenciesAndPeriod.currencies.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currenciesAndPeriod.currencies.value]);

  function getRecurringPrices() {
    let prices: SubscriptionPriceDto[] = [];
    items
      .filter((f) => f.model !== PricingModel.ONCE)
      .forEach((product) => {
        const recurringPrices = product.prices;
        prices = prices.concat(recurringPrices);
      });
    return prices;
  }

  function alreadyOwned(plan: SubscriptionProductDto) {
    const found = tenantSubscription?.products.find((f) => f.subscriptionProductId === plan.id);
    if (found) {
      return true;
    }
    return false;
  }

  function checkUpgradeDowngrade(plan: SubscriptionProductDto) {
    const existing = tenantSubscription?.products.find((f) => f)?.subscriptionProduct;
    if (existing) {
      if (plan.order > existing.order) {
        return { upgrade: true };
      } else {
        return { downgrade: true };
      }
    }
  }

  return (
    <div className={clsx(className)}>
      <div className="flex items-center justify-between">
        <div>
          <CurrencyToggle
            value={currency}
            setValue={(e) => {
              searchParams.set("c", e.toString());
              setSearchParams(searchParams, {
                preventScrollReset: true,
              });
              setCurrency(e);
            }}
            possibleCurrencies={currenciesAndPeriod.currencies.options}
            darkMode
          />
        </div>
        <div>
          <ToggleBillingPeriod
            currency={currency}
            products={items}
            size="sm"
            billingPeriod={billingPeriod}
            onChange={(e) => {
              // console.log("Set billing period: ", SubscriptionBillingPeriod[e]);
              searchParams.set("b", getBillingPeriodParams(e));
              setSearchParams(searchParams, {
                preventScrollReset: true,
              });
              setBillingPeriod(e);
            }}
            yearlyDiscount={getYearlyDiscount(getRecurringPrices(), currency)}
            possibleBillingPeriods={currenciesAndPeriod.billingPeriods.options}
            darkMode
          />
        </div>
      </div>
      <div
        className={clsx(
          "grid gap-6 lg:gap-3",
          items.length === 2 && "lg:grid-cols-2 xl:grid-cols-2",
          items.length === 3 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length === 4 && "lg:grid-cols-4 xl:grid-cols-4",
          items.length === 5 && "lg:grid-cols-4 xl:grid-cols-4",
          items.length === 6 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length === 7 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length >= 8 && "lg:grid-cols-3 xl:grid-cols-3"
        )}
      >
        {items.map((plan, index) => {
          return (
            <Plan
              key={index}
              className={clsx((items.length === 1 || (items.length === 4 && index === 3)) && "lg:col-span-1")}
              product={plan}
              title={plan.title}
              description={plan.description ?? undefined}
              badge={plan.badge ?? undefined}
              features={plan.features}
              billingPeriod={billingPeriod}
              currency={currency}
              prices={plan.prices}
              model={plan.model}
              usageBasedPrices={plan.usageBasedPrices}
              alreadyOwned={alreadyOwned(plan)}
              // tenantSubscription={tenantSubscription}
              canSubmit={canSubmit}
              isUpgrade={checkUpgradeDowngrade(plan)?.upgrade}
              isDowngrade={checkUpgradeDowngrade(plan)?.downgrade}
              stripeCoupon={stripeCoupon}
              onClickFeature={onClickFeature}
            />
          );
        })}
      </div>
    </div>
  );
}
