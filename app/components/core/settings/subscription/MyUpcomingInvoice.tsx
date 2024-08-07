import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { getFormattedPriceInCurrency } from "~/utils/helpers/PricingHelper";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  item: Stripe.Invoice | null;
}

export default function MyUpcomingInvoice({ item }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {item && (
        <div className="space-y-2">
          <div className="flex justify-between space-x-2">
            <div className="text-sm font-medium">{t("app.subscription.invoices.upcoming")}</div>
            <div className="text-sm text-gray-500">{item.next_payment_attempt && DateUtils.dateMonthDayYear(new Date(item.next_payment_attempt * 1000))}</div>
          </div>
          <div className="flex flex-col rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
            <div>
              <span className="font-medium">
                {getFormattedPriceInCurrency({
                  currency: item.currency,
                  price: Number(item.amount_due / 100),
                })}
              </span>{" "}
              <span className="text-sm uppercase text-gray-500">{item.currency}</span>
            </div>
            {item.lines.data.map((lineItem, idx) => {
              return (
                <div key={idx} className="text-sm">
                  {lineItem.price?.nickname && <span>{t(lineItem.price?.nickname)} &rarr; </span>}
                  {lineItem.description}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
