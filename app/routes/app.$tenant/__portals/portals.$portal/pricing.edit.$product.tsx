import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { getAllPortalSubscriptionProducts, getPortalSubscriptionProduct } from "~/modules/portals/db/portalSubscriptionProducts.db.server";
import { getPortalById } from "~/modules/portals/db/portals.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import UrlUtils from "~/utils/app/UrlUtils";
import PortalPricingServer from "~/modules/portals/services/PortalPricing.server";
import toast from "react-hot-toast";
import { useParams } from "@remix-run/react";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { Portal } from "@prisma/client";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  portal: Portal;
  item: SubscriptionProductDto;
  plans: SubscriptionProductDto[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const item = await getPortalSubscriptionProduct(portal.id, params.product ?? "");
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const data: LoaderData = {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
    portal,
    item,
    plans: await getAllPortalSubscriptionProducts(portal.id),
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

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const item = await getPortalSubscriptionProduct(portal.id, params.product ?? "");
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
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
      id: params.product,
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
      await PortalPricingServer.updatePlan(portal.id, plan, features);
      await createAdminLog(request, "Updated pricing plan", plan.translatedTitle ?? plan.title);

      return redirect(UrlUtils.getModulePath(params, "portals"));
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await PortalPricingServer.deletePlan(portal.id, item);
      return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pricing`));
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <EditPageLayout
      title={t("admin.pricing.title")}
      withHome={false}
      menu={[
        // {
        //   title: t("models.portal.plural"),
        //   routePath: UrlUtils.getModulePath(params, "portals"),
        // },
        {
          title: data.portal.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/pricing`),
        },
        {
          title: t("shared.edit"),
        },
      ]}
    >
      <PricingPlanForm item={data.item} plans={data.plans} canUpdate={true} canDelete={true} isPortalPlan={true} />
    </EditPageLayout>
  );
}
