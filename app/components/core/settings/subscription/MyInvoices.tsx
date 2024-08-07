import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getFormattedPriceInCurrency } from "~/utils/helpers/PricingHelper";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: Stripe.Invoice[];
}

export default function MyInvoices({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{t("app.subscription.invoices.title")}</div>
      {items.length === 0 ? (
        <div className="text-sm italic text-gray-500">{t("shared.noRecords")}</div>
      ) : (
        <TableSimple
          items={items}
          headers={[
            {
              name: "date",
              title: t("shared.createdAt"),
              value: (i) => DateUtils.dateYMD(new Date(i.created * 1000)),
              formattedValue: (item) => (
                <div className="flex flex-col">
                  <div>{DateUtils.dateYMD(new Date(item.created * 1000))}</div>
                  <div className="text-xs">{DateUtils.dateAgo(new Date(item.created * 1000))}</div>
                </div>
              ),
            },
            {
              name: "amount",
              title: t("app.subscription.invoices.amount"),
              value: (i) => (
                <div className="flex flex-col">
                  <div>
                    {getFormattedPriceInCurrency({
                      currency: i.currency,
                      price: Number(i.amount_paid) / 100,
                    })}
                  </div>
                  <div className="text-xs uppercase text-gray-500">{i.currency}</div>
                </div>
              ),
            },
            {
              name: "status",
              title: t("shared.status"),
              value: (i) => (
                <div>
                  <SimpleBadge title={t("app.subscription.invoices.status." + i.status)} color={i.status === "paid" ? Colors.GREEN : Colors.YELLOW} />
                </div>
              ),
            },
            {
              className: "w-full",
              name: "items",
              title: t("app.subscription.invoices.items"),
              value: (i) => (
                <div className="flex flex-col">
                  {i.lines.data.map((lineItem, idx) => {
                    return (
                      <div key={idx}>
                        {lineItem.price?.nickname && <span>{t(lineItem.price?.nickname)} - </span>}
                        {lineItem.description}
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
          actions={[
            {
              title: (
                <div className="flex justify-center">
                  <DownloadIcon className="h-4 w-4" />
                </div>
              ),
              onClickRoute: (_, item) => item.invoice_pdf ?? "",
              disabled: (item) => !item.invoice_pdf,
              onClickRouteTarget: "_blank",
              firstColumn: true,
            },
          ]}
        />
      )}
    </div>
  );
}
