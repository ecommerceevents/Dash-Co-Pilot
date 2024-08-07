import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import Stripe from "stripe";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { Colors } from "~/application/enums/shared/Colors";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import GearIcon from "~/components/ui/icons/GearIcon";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getAllPortalSubscriptionProductsWithUsers } from "~/modules/portals/db/portalSubscriptionProducts.db.server";
import { PortalWithDetails, getPortalById, updatePortal } from "~/modules/portals/db/portals.db.server";
import PortalServer from "~/modules/portals/services/Portal.server";
import StripeConnectServer from "~/modules/portals/services/StripeConnect.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  item: PortalWithDetails;
  stripeAccount: Stripe.Account | null;
  items: SubscriptionProductDto[];
  portalUrl: string;
};

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.pricing) {
    throw json({ error: "Pricing is not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  let stripeAccount: Stripe.Account | null = null;
  try {
    stripeAccount = item.stripeAccountId ? await StripeConnectServer.getStripeAccount(item.stripeAccountId) : null;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    await updatePortal(item, {
      stripeAccountId: null,
    });
  }
  // if (!stripeAccount && item.stripeAccountId) {
  //   await updatePortal(item, { stripeAccountId: null });
  //   item.stripeAccountId = null;
  // }
  if (stripeAccount && !stripeAccount.charges_enabled) {
    // return redirect(UrlUtils.getModulePath(params, `portals/${params.portal}/pricing/stripe`));
  }
  const portalUrl = PortalServer.getPortalUrl(item);
  const items = await getAllPortalSubscriptionProductsWithUsers(item.id);
  const data: LoaderData = {
    item,
    stripeAccount,
    items: items.sort((x, y) => {
      return x?.order > y?.order ? 1 : -1;
    }),
    portalUrl,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();

  return (
    <EditPageLayout
      title="Pricing"
      withHome={false}
      buttons={
        <>
          <ButtonSecondary to="stripe">
            <GearIcon className="h-4 w-4" />
          </ButtonSecondary>
          <ButtonSecondary to={`${data.portalUrl}/pricing`} target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <div>{t("shared.preview")}</div>
          </ButtonSecondary>
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
      menu={[
        // {
        //   title: t("models.portal.plural"),
        //   routePath: UrlUtils.getModulePath(params, "portals"),
        // },
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}/pricing`),
        },
      ]}
    >
      {data.stripeAccount === null ? (
        <WarningBanner title="Stripe not Connected">
          You don't have a Stripe account connected.{" "}
          <Link to={UrlUtils.getModulePath(params, `portals/${params.portal}/pricing/stripe`)} className="underline">
            Click here to connect your Stripe account.
          </Link>
        </WarningBanner>
      ) : !data.stripeAccount.charges_enabled ? (
        <WarningBanner title="Stripe Integration Pending">
          Your Stripe integration is pending.{" "}
          <Link to={UrlUtils.getModulePath(params, `portals/${params.portal}/pricing/stripe`)} className="underline">
            Click here to continue.
          </Link>
        </WarningBanner>
      ) : null}
      <div>
        <TableSimple
          items={data.items}
          headers={[
            {
              name: "order",
              title: t("models.subscriptionProduct.order"),
              value: (i) => i.order,
            },
            {
              name: "title",
              title: t("models.subscriptionProduct.title"),
              value: (item) => (
                <>
                  {t(item.title)}{" "}
                  {item.badge && (
                    <span className=" border-theme-200 bg-theme-50 text-theme-800 ml-1 rounded-md border px-1 py-0.5 text-xs">{t(item.badge)}</span>
                  )}
                </>
              ),
            },
            {
              name: "model",
              title: t("models.subscriptionProduct.model"),
              value: (item) => <>{t("pricing." + PricingModel[item.model])}</>,
            },
            // ...allFeatures.map((feature) => {
            //   return {
            //     name: feature.name,
            //     title: feature.name,
            //     value: (item: SubscriptionProductDto) => <PlanFeatureValue item={getFeatureValue(item, feature.name)} />,
            //   };
            // }),
            {
              name: "subscriptions",
              title: t("models.subscriptionProduct.plural"),
              value: (item) => (
                <div className=" lowercase text-gray-400">
                  {item.tenantProducts?.length ?? 0} {t("shared.active")}
                </div>
              ),
            },
            {
              name: "active",
              title: t("models.subscriptionProduct.status"),
              value: (item) => (
                <>
                  {item.active ? (
                    <>
                      {item.public ? (
                        <SimpleBadge title={t("models.subscriptionProduct.public")} color={Colors.TEAL} />
                      ) : (
                        <SimpleBadge title={t("models.subscriptionProduct.custom")} color={Colors.ORANGE} />
                      )}
                    </>
                  ) : (
                    <SimpleBadge title={t("shared.inactive")} color={Colors.RED} />
                  )}
                </>
              ),
            },
            {
              name: "actions",
              title: t("shared.actions"),
              value: (item) => (
                <div className="flex items-center space-x-2">
                  <ButtonTertiary disabled={!item.id} to={"edit/" + item.id}>
                    {t("shared.edit")}
                  </ButtonTertiary>
                </div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
