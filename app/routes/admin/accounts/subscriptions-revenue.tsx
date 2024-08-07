import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import NumberUtils from "~/utils/shared/NumberUtils";
import { StripeRevenueByProductPriceCurrency, getStripeRevenueByProductPriceCurrency } from "~/utils/stripe.server";

type LoaderData = {
  metatags: MetaTagsDto;
  items: StripeRevenueByProductPriceCurrency[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    metatags: [{ title: `Revenue | ${process.env.APP_NAME}` }],
    items: await getStripeRevenueByProductPriceCurrency(),
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();

  return (
    <EditPageLayout title={"Revenue"}>
      <TableSimple
        items={data.items}
        headers={[
          {
            name: "product",
            title: "Product",
            value: (item) => t(item.product),
          },
          {
            name: "billingPeriod",
            title: "Billing Period",
            value: (item) => t("pricing." + SubscriptionBillingPeriod[item.billingPeriod]),
          },
          {
            name: "currency",
            title: "Currency",
            value: (item) => item.currency,
          },
          {
            name: "revenueInCurrency",
            title: "Revenue in Currency",
            value: (item) => item.revenueInCurrency,
            formattedValue: (item) => (
              <div className="flex flex-col">
                <div>${NumberUtils.decimalFormat(item.revenueInCurrency)}</div>
              </div>
            ),
          },
          {
            name: "count",
            title: "Count",
            value: (item) => item.count,
            formattedValue: (item) => (
              <div className="flex flex-col">
                <div>{NumberUtils.intFormat(item.count)}</div>
                <div className="text-xs text-gray-500">{NumberUtils.decimalFormat(item.countPercentage * 100)}%</div>
              </div>
            ),
          },
          {
            name: "revenueUsd",
            title: "Revenue USD",
            value: (item) => item.revenueUsd,
            formattedValue: (item) => (
              <div className="flex flex-col">
                <div>${NumberUtils.decimalFormat(item.revenueUsd)} usd</div>
                <div className="text-xs text-gray-500">{NumberUtils.decimalFormat(item.revenuePercentageUsd * 100)}%</div>
              </div>
            ),
          },
        ]}
      />
    </EditPageLayout>
  );
}
