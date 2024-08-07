import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useNavigate, useOutlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import TenantBadge from "~/components/core/tenants/TenantBadge";
import DateCell from "~/components/ui/dates/DateCell";
import InputFilters from "~/components/ui/input/InputFilters";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import SubscriptionUtils from "~/utils/app/SubscriptionUtils";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { TenantSubscriptionProductWithTenant, getAllTenantSubscriptionProducts } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  metatags: MetaTagsDto;
  items: TenantSubscriptionProductWithTenant[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  isStripeTest: boolean;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.accounts.subscriptions");
  await time(verifyUserHasPermission(request, "admin.accounts.view"), "verifyUserHasPermission");
  let { t } = await time(getTranslations(request), "getTranslations");

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "status",
      title: t("shared.status"),
      manual: true,
      options: [
        { value: "active", name: "Active" },
        { value: "ended", name: "Ended" },
        { value: "active-cancelled", name: "Active Cancelled" },
        { value: "active-not-cancelled", name: "Active Not Cancelled" },
      ],
    },
    {
      name: "subscriptionProductId",
      title: t("models.subscriptionProduct.object"),
      manual: true,
      options: (await getAllSubscriptionProducts()).map((f) => {
        return {
          value: f.id ?? "",
          name: t(f.title),
        };
      }),
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      manual: true,
      options: (await adminGetAllTenantsIdsAndNames()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await time(getAllTenantSubscriptionProducts(filters, currentPagination), "getTenantSubscriptionsWithPagination");

  const data: LoaderData = {
    metatags: [{ title: `${t("models.subscription.plural")} | ${process.env.APP_NAME}` }],
    items,
    pagination,
    filterableProperties,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
  };
  return json(data, { headers: getServerTimingHeader() });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const outlet = useOutlet();
  const navigate = useNavigate();

  return (
    <EditPageLayout
      title={t("models.subscription.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} withSearch={false} />
        </>
      }
    >
      <TableSimple
        items={data.items}
        pagination={data.pagination}
        headers={[
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => <TenantBadge item={i.tenantSubscription.tenant} />,
          },
          {
            name: "subscriptionProduct",
            title: t("models.subscriptionProduct.object"),
            value: (i) => "",
            className: "w-full",
            formattedValue: (product) => (
              <span>
                <div key={product.id}>
                  <div>
                    {t(product.subscriptionProduct.title)}{" "}
                    {product.prices
                      .map(
                        (f) =>
                          `$${NumberUtils.decimalFormat(Number(f.subscriptionPrice?.price ?? 0))} - ${SubscriptionUtils.getBillingPeriodDescription(
                            t,
                            f.subscriptionPrice?.billingPeriod ?? 0
                          )}`
                      )
                      .join(", ")}
                  </div>
                </div>
              </span>
            ),
          },
          {
            name: "period",
            title: t("models.subscription.period"),
            value: (i) => (
              <div>
                {i.currentPeriodStart && i.currentPeriodEnd ? (
                  <div className="flex items-center space-x-1">
                    <DateCell date={i.currentPeriodStart} displays={["mdy"]} />
                    <div>-</div>
                    <DateCell date={i.currentPeriodEnd} displays={["mdy"]} />
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            ),
          },
          {
            name: "cancelledAt",
            title: t("models.subscription.cancelledAt"),
            value: (i) => <div>{i.cancelledAt ? <DateCell date={i.cancelledAt} displays={["mdy"]} /> : "-"}</div>,
          },
          {
            name: "endsAt",
            title: t("models.subscription.endsAt"),
            value: (i) => (
              <div>
                {i.endsAt ? (
                  <div>
                    {new Date() < new Date(i.endsAt) ? (
                      <div className="text-orange-500">
                        {t("settings.subscription.ends")} {DateUtils.dateMonthDayYear(i.endsAt)}
                      </div>
                    ) : (
                      <div className="text-red-500">
                        {t("settings.subscription.endedAt")} {DateUtils.dateMonthDayYear(i.endsAt)}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </div>
            ),
          },
          {
            name: "actions",
            title: "",
            value: (i) => (
              <Link to={`${i.id}`} className="hover:underline">
                {t("shared.edit")}
              </Link>
            ),
          },
        ]}
      />

      <SlideOverWideEmpty
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
