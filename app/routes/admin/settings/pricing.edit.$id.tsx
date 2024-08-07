import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { deletePlan, updatePlan } from "~/utils/services/.server/pricingService";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { getAllSubscriptionProducts, getSubscriptionProduct } from "~/utils/db/subscriptionProducts.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { useAdminData } from "~/utils/data/useAdminData";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  item: SubscriptionProductDto;
  plans: SubscriptionProductDto[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  const item = await getSubscriptionProduct(params.id ?? "");
  if (!item) {
    return redirect("/admin/settings/pricing");
  }

  const data: LoaderData = {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
    item,
    plans: await getAllSubscriptionProducts(),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const item = await getSubscriptionProduct(params.id ?? "");
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.pricing.update");
    const order = Number(form.get("order"));
    const title = form.get("title")?.toString();
    const description = form.get("description")?.toString() ?? "";
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

    if (!title) {
      return badRequest({ error: "Title required" });
    }

    const plan: SubscriptionProductDto = {
      id: params.id,
      stripeId: "",
      order,
      title,
      description,
      badge,
      groupTitle,
      groupDescription,
      active: true,
      model: item.model,
      public: isPublic,
      prices: [],
      usageBasedPrices: [],
      features: [],
      billingAddressCollection: isBillingRequired ? "required" : "auto",
      hasQuantity,
      canBuyAgain,
    };

    try {
      await updatePlan(plan, features);
      await createAdminLog(request, "Updated pricing plan", plan.translatedTitle ?? plan.title);

      return redirect("/admin/settings/pricing");
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.pricing.delete");
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await deletePlan(item);
      return redirect("/admin/settings/pricing");
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function EditPricinPlanRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const adminData = useAdminData();
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
          { title: t("admin.pricing.edit"), routePath: "/admin/settings/pricing/edit" + data.item.id },
        ]}
      />
      <PricingPlanForm
        item={data.item}
        plans={data.plans}
        canUpdate={getUserHasPermission(adminData, "admin.pricing.update")}
        canDelete={getUserHasPermission(adminData, "admin.pricing.delete")}
      />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
