import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createPlan } from "~/utils/services/.server/pricingService";
import { createAdminLog } from "~/utils/db/logs.db.server";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { SubscriptionUsageBasedPriceDto } from "~/application/dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import { useTypedLoaderData } from "remix-typedjson";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  plans: SubscriptionProductDto[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.pricing.create");
  const { t } = await getTranslations(request);

  const data: LoaderData = {
    title: `${t("admin.pricing.new")} | ${process.env.APP_NAME}`,
    plans: await getAllSubscriptionProducts(),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();

  const action = form.get("action")?.toString();

  if (action !== "create") {
    return badRequest({ error: t("shared.invalidForm") });
  }
  const order = Number(form.get("order"));
  const title = form.get("title")?.toString();
  const description = form.get("description")?.toString() ?? "";
  const model = Number(form.get("model"));
  const badge = form.get("badge")?.toString() ?? "";
  const groupTitle = form.get("group-title")?.toString() ?? "";
  const groupDescription = form.get("group-description")?.toString() ?? "";
  const isPublic = Boolean(form.get("is-public"));
  const isBillingRequired = Boolean(form.get("is-billing-required"));
  const hasQuantity = Boolean(form.get("has-quantity"));
  const canBuyAgain = Boolean(form.get("can-buy-again"));

  const featuresArr = form.getAll("features[]");
  const features: SubscriptionFeatureDto[] = featuresArr.map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  const prices: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string; trialDays?: number }[] = form
    .getAll("prices[]")
    .map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

  const oneTimePricesWithZero = prices.filter((p) => p.billingPeriod === SubscriptionBillingPeriod.ONCE && p.price === 0);
  if (oneTimePricesWithZero.length > 0) {
    return badRequest({ error: "One-time prices can't be zero" });
  }

  const usageBasedPrices: SubscriptionUsageBasedPriceDto[] = form.getAll("usage-based-prices[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if (!title) {
    return badRequest({ error: "Plan title required" });
  }

  const plan: SubscriptionProductDto = {
    stripeId: "",
    order,
    title,
    model,
    description,
    badge,
    groupTitle,
    groupDescription,
    active: true,
    public: isPublic,
    prices: [],
    features: [],
    usageBasedPrices,
    billingAddressCollection: isBillingRequired ? "required" : "auto",
    hasQuantity,
    canBuyAgain,
  };

  try {
    await createPlan(plan, prices, features, usageBasedPrices, t);
    await createAdminLog(request, "Created pricing plan", plan.title);

    return redirect("/admin/settings/pricing");
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export default function NewPricingPlanRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("admin.pricing.title")}</h1>
      <BreadcrumbSimple
        className="w-full"
        home="/admin/dashboard"
        menu={[
          { title: t("admin.pricing.title"), routePath: "/admin/settings/pricing" },
          { title: t("admin.pricing.new"), routePath: "/admin/settings/pricing/new" },
        ]}
      />
      <PricingPlanForm plans={data.plans} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
