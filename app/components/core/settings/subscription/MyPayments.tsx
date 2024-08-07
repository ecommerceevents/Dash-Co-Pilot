import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import NumberUtils from "~/utils/shared/NumberUtils";

interface Props {
  items: Stripe.PaymentIntent[];
}

export default function MyPayments({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{t("app.subscription.payments.title")}</div>
      {items.length === 0 ? (
        <div className="text-sm italic text-gray-500">{t("shared.noRecords")}</div>
      ) : (
        <TableSimple
          items={items}
          headers={[
            {
              name: "paidAt",
              title: t("app.subscription.invoices.paidAt"),
              value: (i) => (
                <div>
                  {i.charges?.data
                    .filter((f) => f.status === "succeeded")
                    .map((m, index) => (
                      <div key={index}>
                        <div className="flex flex-col">
                          <div>{DateUtils.dateYMD(new Date(m.created * 1000))}</div>
                          <div className="text-xs">{DateUtils.dateAgo(new Date(m.created * 1000))}</div>
                        </div>
                      </div>
                    ))}
                </div>
              ),
            },
            {
              name: "amount",
              title: t("app.subscription.invoices.amount"),
              value: (i) => (
                <div className="flex flex-col">
                  <div>${NumberUtils.decimalFormat(i.amount / 100)}</div>
                  <div className="text-xs uppercase text-gray-500">{i.currency}</div>
                </div>
              ),
            },
            {
              name: "status",
              title: t("shared.status"),
              value: (i) => (
                <div>
                  <SimpleBadge title={t("app.subscription.payments.status." + i.status)} color={i.status === "succeeded" ? Colors.GREEN : Colors.GRAY} />
                </div>
              ),
            },
            {
              className: "w-full",
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
          ]}
          actions={[
            {
              title: (
                <div className="flex justify-center">
                  <DownloadIcon className="h-4 w-4" />
                </div>
              ),
              onClickRoute: (_, item) => item.charges?.data.find((f) => f.receipt_url)?.receipt_url ?? "",
              disabled: (item) => !item.charges?.data.find((f) => f.receipt_url)?.receipt_url,
              onClickRouteTarget: "_blank",
              firstColumn: true,
            },
          ]}
        />
      )}
    </div>
  );
}
