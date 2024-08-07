import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createAdminLog } from "~/utils/db/logs.db.server";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionUsageBasedPriceDto } from "~/application/dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import { useTypedLoaderData } from "remix-typedjson";
import { getAllPortalSubscriptionProducts } from "~/modules/portals/db/portalSubscriptionProducts.db.server";
import { getPortalById, PortalWithDetails } from "~/modules/portals/db/portals.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import UrlUtils from "~/utils/app/UrlUtils";
import PortalPricingServer from "~/modules/portals/services/PortalPricing.server";
import toast from "react-hot-toast";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  portal: PortalWithDetails;
  plans: SubscriptionProductDto[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.pricing) {
    throw json({ error: "Pricing is not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const data: LoaderData = {
    title: `New product | ${process.env.APP_NAME}`,
    portal,
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
    await PortalPricingServer.createPlan(portal.id, plan, prices, features, t);
    await createAdminLog(request, "Created pricing plan", plan.title);

    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pricing`));
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const params = useParams();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <EditPageLayout
      title="New product"
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
          title: t("shared.new"),
        },
      ]}
    >
      <PricingPlanForm plans={data.plans} isPortalPlan={true} />
    </EditPageLayout>
  );
}
