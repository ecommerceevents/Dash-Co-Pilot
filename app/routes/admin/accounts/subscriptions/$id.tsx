import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputText from "~/components/ui/input/InputText";
import { TenantSubscriptionProductWithTenant, getTenantSubscriptionProductById } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  item: TenantSubscriptionProductWithTenant;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getTenantSubscriptionProductById(params.id!);
  if (!item) {
    return json({ error: "Not found" }, { status: 404 });
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div className="space-y-2">
      <InputText title={t("models.tenant.object")} defaultValue={data.item.tenantSubscription.tenant.name} readOnly />
      <InputText title={"Stripe ID"} defaultValue={data.item.stripeSubscriptionId ?? ""} readOnly />
      <InputText title={t("models.subscriptionProduct.object")} defaultValue={t(data.item.subscriptionProduct.title)} readOnly />
      <InputText title={t("models.subscription.quantity")} defaultValue={data.item.quantity?.toString() ?? ""} readOnly />
      {data.item.prices.length > 0 && (
        <InputGroup title={t("models.subscription.price")}>
          <div className="space-y-1">
            {data.item.prices.map((price) => (
              <Fragment key={price.id}>
                {price.subscriptionPrice ? (
                  <div className="grid grid-cols-3 gap-2">
                    <InputText defaultValue={price.subscriptionPrice.currency} readOnly />
                    <InputText defaultValue={price.subscriptionPrice.price?.toString() ?? ""} readOnly />
                    <InputText defaultValue={SubscriptionBillingPeriod[price.subscriptionPrice.billingPeriod]} readOnly />
                  </div>
                ) : (
                  <Fragment></Fragment>
                )}
              </Fragment>
            ))}
          </div>
        </InputGroup>
      )}
      <InputGroup title="Current period">
        <div className="space-y-1">
          <InputText title="Started at" defaultValue={data.item.currentPeriodStart ? DateUtils.dateYMD(data.item.currentPeriodStart) : "-"} readOnly />
          <InputText title="Ends at" defaultValue={data.item.currentPeriodEnd ? DateUtils.dateYMD(data.item.currentPeriodEnd) : "-"} readOnly />
        </div>
      </InputGroup>
      <InputText title="Created at" defaultValue={DateUtils.dateYMD(data.item.createdAt)} readOnly />
      <InputText title="Canceled at" defaultValue={data.item.cancelledAt ? DateUtils.dateYMD(data.item.cancelledAt) : "-"} readOnly />
      <InputText title="Ends at" defaultValue={data.item.endsAt ? DateUtils.dateYMD(data.item.endsAt) : "-"} readOnly />
    </div>
  );
}
