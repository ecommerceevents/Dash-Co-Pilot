import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Logo from "~/components/brand/Logo";
import { getTranslations } from "~/locale/i18next.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { AppLoaderData } from "~/utils/data/useAppData";
import { loadAppData } from "~/utils/data/.server/appData";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { addTenantProductsFromCheckoutSession, CheckoutSessionResponse, getAcquiredItemsFromCheckoutSession } from "~/utils/services/.server/pricingService";
import { createLog } from "~/utils/db/logs.db.server";
import { persistCheckoutSessionStatus } from "~/utils/services/.server/subscriptionService";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { useRootData } from "~/utils/data/useRootData";

type LoaderData = AppLoaderData & {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "subscribe.$tenant.$session.success");
  let { t } = await time(getTranslations(request), "getTranslations");
  const tenantId = await time(getTenantIdFromUrl(params), "getTenantIdFromUrl");
  const userInfo = await time(getUserInfo(request), "getUserInfo");

  const user = await time(getUser(userInfo.userId), "getUser");
  if (!user) {
    throw redirect(`/login`);
  }
  const tenant = await time(getTenant(tenantId), "getTenant");
  if (!tenant) {
    throw redirect(`/app`);
  }

  await time(
    persistCheckoutSessionStatus({
      request,
      id: params.session ?? "",
      fromUrl: new URL(request.url).pathname,
      fromUserId: user.id,
      fromTenantId: tenant.id,
    }),
    "persistCheckoutSessionStatus"
  );
  const checkoutSession = await time(getAcquiredItemsFromCheckoutSession(params.session ?? ""), "getAcquiredItemsFromCheckoutSession");

  const appData = await time(loadAppData({ request, params, t }, time), "loadAppData");
  const data: LoaderData = {
    title: `${t("pricing.subscribe")} | ${process.env.APP_NAME}`,
    ...appData,
    checkoutSession,
  };

  if (checkoutSession) {
    try {
      await time(
        addTenantProductsFromCheckoutSession({
          request,
          tenantId: tenantId,
          user,
          checkoutSession,
          createdUserId: null,
          createdTenantId: null,
          t,
        }),
        "addTenantProductsFromCheckoutSession"
      );
      await Promise.all(
        checkoutSession.products.map(async (product) => {
          await createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
        })
      );
      return json(data, { headers: getServerTimingHeader() });
      // return redirect(`/subscribe/${params.tenant}/${params.product}/success`);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log(e);
      return json({ ...data, error: e.message }, { status: 500, headers: getServerTimingHeader() });
    }
  }
  return json(data);
};

export default function SubscribeTenantSuccessRoute() {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-shrink-0 justify-center">
            <Logo to={`/app/${data.currentTenant.slug}`} />
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                {data.error ? (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("shared.unexpectedError")}</h1>
                    <p className="mt-4 text-lg leading-6 text-red-500">{data.error}</p>
                  </>
                ) : !data.checkoutSession ? (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("shared.error")}</h1>
                    <p className="mt-4 text-lg leading-6 text-red-500">{t("settings.subscription.checkout.invalid")}</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("settings.subscription.checkout.success.title")}</h1>
                    <p className="text-muted-foreground mt-4 text-lg leading-6">
                      {t("settings.subscription.checkout.success.description", { 0: t(data.checkoutSession.products.map((f) => t(f.title)).join(", ")) })}
                    </p>
                  </>
                )}

                <div className="mt-4">
                  <Link
                    className="focus:border-accent-300 inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    to={`${appConfiguration.app.features.tenantHome.replace(":tenant", data.currentTenant.slug)}settings/subscription`}
                  >
                    &larr; {t("settings.subscription.checkout.success.goToSubscription")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
