import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

interface Props {
  className?: string;
  billingPeriod: SubscriptionBillingPeriod;
  onChange: (billingPeriod: SubscriptionBillingPeriod) => void;
  yearlyDiscount: string | undefined;
  size?: "sm" | "md";
  disabled?: boolean;
  possibleBillingPeriods: SubscriptionBillingPeriod[];
  darkMode?: boolean;
  currency: string;
  products: SubscriptionProductDto[];
}

export default function ToggleBillingPeriod({
  className,
  billingPeriod,
  onChange,
  yearlyDiscount,
  size = "md",
  disabled,
  possibleBillingPeriods,
  darkMode,
  currency,
  products,
}: Props) {
  const { t } = useTranslation();
  // const [discounts, setDiscounts] = useState<{ billingPeriod: SubscriptionBillingPeriod; discount?: number }[]>([]);

  // useEffect(() => {
  //   setDiscounts(findDiscounts({ currency, products, billingPeriods: possibleBillingPeriods }));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currency]);

  function setBillingPeriod(item: SubscriptionBillingPeriod) {
    if (billingPeriod !== item) {
      onChange(item);
    }
  }
  const isMonthlyOrYearly =
    possibleBillingPeriods.length === 2 &&
    possibleBillingPeriods.includes(SubscriptionBillingPeriod.MONTHLY) &&
    possibleBillingPeriods.includes(SubscriptionBillingPeriod.YEARLY);

  // function getBillingPeriodTitle(billingPeriod: SubscriptionBillingPeriod) {
  //   const discount = discounts.find((d) => d.billingPeriod === billingPeriod)?.discount;
  //   const discountText = discount ? ` (${discount}%)` : "";
  //   return `${t("pricing." + SubscriptionBillingPeriod[billingPeriod])}${discountText}`;
  // }
  return (
    <Fragment>
      {isMonthlyOrYearly ? (
        <div className={clsx("flex items-center justify-center space-x-4", className)}>
          <button type="button" className="text-sm font-medium" onClick={() => setBillingPeriod(SubscriptionBillingPeriod.MONTHLY)}>
            {t("pricing.MONTHLY")}
          </button>
          <button
            disabled={disabled}
            type="button"
            className={clsx(
              "focus:ring-primary relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2",
              disabled && "cursor-not-allowed opacity-80"
            )}
            onClick={() =>
              setBillingPeriod(billingPeriod === SubscriptionBillingPeriod.MONTHLY ? SubscriptionBillingPeriod.YEARLY : SubscriptionBillingPeriod.MONTHLY)
            }
          >
            <div className={clsx("bg-primary rounded-full shadow-md outline-none transition", size === "sm" && "h-4 w-8", size === "md" && "h-8 w-16")}></div>
            <div
              className={clsx(
                "bg-primary-foreground absolute left-1 top-1 inline-flex transform items-center justify-center rounded-full shadow-sm transition-all duration-200 ease-in-out",
                size === "sm" && "h-2 w-2",
                size === "md" && "h-6 w-6",
                billingPeriod === 3 && "translate-x-0",
                billingPeriod === 4 && size === "sm" && "translate-x-4",
                billingPeriod === 4 && size === "md" && "translate-x-8"
              )}
            ></div>
          </button>
          <button type="button" className="text-sm font-medium" onClick={() => setBillingPeriod(SubscriptionBillingPeriod.YEARLY)}>
            {t("pricing.YEARLY")}{" "}
            {yearlyDiscount && (
              <span className="ml-1 inline-flex items-center rounded-md bg-teal-100 px-2.5 py-0.5 text-sm font-medium text-teal-800">{yearlyDiscount}</span>
            )}
          </button>
        </div>
      ) : possibleBillingPeriods.length > 1 ? (
        <Fragment>
          <div className={className}>
            <select
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(Number(e.target.value) as SubscriptionBillingPeriod)}
              className={clsx(
                "focus:ring-primary focus:border-primary block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-800 focus:outline-none sm:text-sm",
                darkMode && "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
              )}
            >
              {possibleBillingPeriods.map((item) => {
                return (
                  <option key={item} value={item}>
                    {t("pricing." + SubscriptionBillingPeriod[item])}
                  </option>
                );
              })}
            </select>
          </div>
        </Fragment>
      ) : null}
    </Fragment>
  );
}
