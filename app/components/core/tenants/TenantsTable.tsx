import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DateUtils from "~/utils/shared/DateUtils";
import TableSimple from "~/components/ui/tables/TableSimple";
import { TenantWithUsage } from "~/utils/db/tenants.db.server";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import NumberUtils from "~/utils/shared/NumberUtils";
import SubscriptionUtils from "~/utils/app/SubscriptionUtils";
import { RowHeaderActionDto } from "~/application/dtos/data/RowHeaderActionDto";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import Stripe from "stripe";
import { Link } from "@remix-run/react";

interface Props {
  items: TenantWithUsage[];
  pagination: PaginationDto;
  actions?: RowHeaderActionDto<TenantWithUsage>[];
  tenantInvoices?: Stripe.Invoice[];
  isStripeTest?: boolean;
}
export default function TenantsTable({ items, pagination, actions = [], tenantInvoices, isStripeTest }: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<TenantWithUsage>[]>([]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<TenantWithUsage>[] = [];
    headers.push({
      name: "tenant",
      title: t("models.tenant.object"),
      value: (i) => (
        <div className="max-w-sm truncate">
          <div className="flex items-center space-x-1 truncate font-medium text-gray-800">
            <Link to={`/admin/accounts/${i.id}`} className="hover:underline">
              {i.name}
            </Link>
            {i.deactivatedReason && <SimpleBadge title={t("shared.deactivated") + ": " + i.deactivatedReason} color={Colors.RED} />}
          </div>

          <Link
            to={"/app/" + i.slug}
            className="rounded-md border-b border-dashed text-xs text-gray-500 hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
          >
            <span>/{i.slug}</span>
          </Link>
        </div>
      ),
    });
    headers.push({
      name: "subscription",
      title: t("admin.tenants.subscription.title"),
      value: (i) => "",
      formattedValue: (item) => (
        <span>
          {item.subscription?.products ? (
            <>
              <div>
                {item.subscription.products.map((product) => {
                  return (
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
                      {product.endsAt && (
                        <>
                          {new Date() < new Date(product.endsAt) ? (
                            <div className="text-orange-500">
                              {t("settings.subscription.ends")} {DateUtils.dateMonthDayYear(product.endsAt)}
                            </div>
                          ) : (
                            <div className="text-red-500">
                              {t("settings.subscription.endedAt")} {DateUtils.dateMonthDayYear(product.endsAt)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <span className="text-sm italic text-gray-400">{t("settings.subscription.noSubscription")}</span>
          )}
        </span>
      ),
    });
    if (tenantInvoices !== undefined) {
      function getTenantInvoices(tenant: TenantWithUsage) {
        const items = tenantInvoices?.filter((f) => f.customer?.toString() === tenant.subscription?.stripeCustomerId) ?? [];
        const sortedByCreatedDesc = items.sort((a, b) => (a.created > b.created ? 1 : -1));
        return sortedByCreatedDesc;
      }
      function lastTenantInvoice(tenant: TenantWithUsage): Stripe.Invoice | undefined {
        const items = getTenantInvoices(tenant);
        return items.length > 0 ? items[items.length - 1] : undefined;
      }
      function getTotalPaid(tenant: TenantWithUsage): number {
        const items = getTenantInvoices(tenant);
        return items.reduce((a, b) => a + Number(b.amount_paid / 100), 0);
      }
      headers.push({
        name: "lastInvoice",
        title: "Last invoice",
        value: (i) => (
          <a
            className="flex flex-col space-y-1 hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://dashboard.stripe.com${isStripeTest ? "/test" : ""}/customers/${i.subscription?.stripeCustomerId ?? ""}`}
          >
            <div className="flex flex-col space-y-1">{!lastTenantInvoice(i) ? <span>-</span> : <TenantInvoice item={lastTenantInvoice(i)!} />}</div>
          </a>
        ),
      });
      headers.push({
        name: "totalInvoicesPaid",
        title: "Total paid",
        value: (i) => (
          <a
            className="flex flex-col space-y-1 hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://dashboard.stripe.com${isStripeTest ? "/test" : ""}/customers/${i.subscription?.stripeCustomerId ?? ""}`}
          >
            {getTotalPaid(i) === 0 ? (
              <span>-</span>
            ) : (
              <div>
                ${NumberUtils.decimalFormat(getTotalPaid(i))} ({getTenantInvoices(i).filter((f) => f.paid).length})
              </div>
            )}
          </a>
        ),
      });
    }
    headers.push({
      name: "types",
      title: t("shared.types"),
      value: (i) => (i.types.length === 0 ? <span className="text-gray-600">{t("shared.default")}</span> : i.types.map((f) => f.title).join(", ")),
    });
    headers.push({
      name: "users",
      title: t("models.user.plural"),
      className: "max-w-xs truncate",
      value: (i) => i.users.map((f) => f.user.email).join(", "),
      href: (i) => `/admin/accounts/users?tenantId=${i.id}`,
    });
    headers.push({
      name: "rows",
      title: t("models.row.plural"),
      value: (item) => <Link to={"/admin/entities/rows?tenantId=" + item.id}>{item._count.rows}</Link>,
    });
    headers.push({
      name: "events",
      title: "Events",
      value: (i) => i._count.events,
      formattedValue: (i) => <Link to={`/admin/events?tenantId=${i.id}`}>{i._count.events}</Link>,
    });
    headers.push({
      name: "createdAt",
      title: t("shared.createdAt"),
      value: (i) => i.createdAt,
      formattedValue: (item) => (
        <div className="flex flex-col">
          <div>{DateUtils.dateYMD(item.createdAt)}</div>
          <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
        </div>
      ),
    });
    setHeaders(headers);
  }, [isStripeTest, t, tenantInvoices]);

  return (
    <div className="space-y-2">
      <TableSimple
        items={items}
        headers={headers}
        actions={[
          {
            title: t("admin.tenants.overview"),
            onClickRoute: (_, item) => `/admin/accounts/${item.id}`,
          },
          ...actions,
        ]}
        pagination={pagination}
      />
    </div>
  );
}

function TenantInvoice({ item }: { item: Stripe.Invoice }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <div title={DateUtils.dateYMD(new Date(item.created * 1000))} className="flex items-center space-x-1">
        <div className="flex items-baseline space-x-1">
          <div>${NumberUtils.decimalFormat(item.total / 100)}</div>
          <div className="text-xs uppercase text-gray-500">{item.currency}</div>
        </div>
        <SimpleBadge title={t("app.subscription.invoices.status." + item.status)} color={item.status === "paid" ? Colors.GREEN : Colors.YELLOW} />
      </div>
      <div className="text-xs text-gray-400">{item.created ? DateUtils.dateAgo(new Date(item.created * 1000)) : ""}</div>
    </div>
  );
}
