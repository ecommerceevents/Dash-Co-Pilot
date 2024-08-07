import { useSubmit, Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import MyBillingSession from "~/components/core/settings/subscription/MyBillingSession";
import MyInvoices from "~/components/core/settings/subscription/MyInvoices";
import MyPayments from "~/components/core/settings/subscription/MyPayments";
import MyProducts from "~/components/core/settings/subscription/MyProducts";
import MySubscriptionFeatures from "~/components/core/settings/subscription/MySubscriptionFeatures";
import MyUpcomingInvoice from "~/components/core/settings/subscription/MyUpcomingInvoice";
import SettingSection from "~/components/ui/sections/SettingSection";
import { TenantSubscriptionProductWithDetails } from "~/utils/db/subscriptions/tenantSubscriptionProducts.db.server";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";

export default function SubscriptionSettings({
  currentTenant,
  mySubscription,
  myInvoices,
  myPayments,
  myFeatures,
  myUpcomingInvoice,
  permissions,
}: {
  currentTenant: TenantSimple;
  mySubscription: TenantSubscriptionWithDetails | null;
  myInvoices: Stripe.Invoice[];
  myPayments: Stripe.PaymentIntent[];
  myFeatures: PlanFeatureUsageDto[];
  myUpcomingInvoice: Stripe.Invoice | null;
  permissions: {
    viewInvoices: boolean;
  };
}) {
  const { t } = useTranslation();
  const submit = useSubmit();

  function onCancel(item: TenantSubscriptionProductWithDetails) {
    const form = new FormData();
    form.set("action", "cancel");
    form.set("tenant-subscription-product-id", item.id);
    submit(form, {
      method: "post",
    });
  }

  // function onAddPaymentMethod() {
  //   const form = new FormData();
  //   form.set("action", "add-payment-method");
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function onOpenCustomerPortal() {
    const form = new FormData();
    form.set("action", "open-customer-portal");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="space-y-4">
      <SettingSection
        title={t("settings.subscription.title")}
        description={
          <div className="flex flex-col space-y-1">
            <div>{t("settings.subscription.description")}</div>
            <div>
              {mySubscription?.products && mySubscription.products.length > 0 && (
                <Link to={`/subscribe/${currentTenant.slug}`} className="text-theme-600 underline">
                  {t("settings.subscription.viewAllProducts")}
                </Link>
              )}
            </div>
          </div>
        }
        className=""
      >
        <MyProducts currentTenant={currentTenant} items={mySubscription?.products ?? []} onCancel={onCancel} />
      </SettingSection>

      {myFeatures.length > 0 && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-4">
              <div className="border-border border-t"></div>
            </div>
          </div>

          <SettingSection title={t("app.subscription.features.title")} description={t("app.subscription.features.description")} className="">
            <MySubscriptionFeatures features={myFeatures} withCurrentPlan={false} />
          </SettingSection>
        </>
      )}

      {permissions.viewInvoices && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-4">
              <div className="border-border border-t"></div>
            </div>
          </div>

          <SettingSection title={t("app.subscription.invoices.title")} description={t("app.subscription.invoices.description")}>
            <div className="space-y-2">
              <MyUpcomingInvoice item={myUpcomingInvoice} />
              <MyInvoices items={myInvoices} />
              <MyPayments items={myPayments} />
            </div>
          </SettingSection>
        </>
      )}

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-4">
          <div className="border-border border-t"></div>
        </div>
      </div>

      {/* <SettingSection title={t("app.subscription.paymentMethods.title")} description={t("app.subscription.paymentMethods.description")}>
          <div className="space-y-2">
            <MyPaymentMethods items={myPaymentMethods} onAdd={onAddPaymentMethod} onDelete={onDeletePaymentMethod} />
          </div>
        </SettingSection> */}

      <SettingSection title={t("app.subscription.billing.title")} description={t("app.subscription.billing.description")}>
        <div className="space-y-2">
          <MyBillingSession onClick={onOpenCustomerPortal} />
        </div>
      </SettingSection>
    </div>
  );
}
