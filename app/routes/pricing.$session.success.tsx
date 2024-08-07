import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import Logo from "~/components/brand/Logo";
import { getTranslations } from "~/locale/i18next.server";
import { useEffect } from "react";
import { addTenantProductsFromCheckoutSession, CheckoutSessionResponse, getAcquiredItemsFromCheckoutSession } from "~/utils/services/.server/pricingService";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { createLog } from "~/utils/db/logs.db.server";
import { persistCheckoutSessionStatus } from "~/utils/services/.server/subscriptionService";
import { RegisterForm } from "~/modules/users/components/RegisterForm";
import { getRegistrationFormData, validateRegistration } from "~/utils/services/authService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  await persistCheckoutSessionStatus({
    request,
    id: params.session ?? "",
    fromUrl: new URL(request.url).pathname,
  });
  const checkoutSession = await getAcquiredItemsFromCheckoutSession(params.session ?? "");
  const data: LoaderData = {
    title: `${t("account.register.setup")} | ${process.env.APP_NAME}`,
    checkoutSession,
  };

  if (!checkoutSession) {
    return json({ ...data, error: t("settings.subscription.checkout.invalid") }, { status: 400 });
  } else if (!checkoutSession.status?.pending) {
    return json({ ...data, error: t("settings.subscription.checkout.alreadyProcessed") }, { status: 400 });
  }

  return json(data);
};

type ActionData = {
  error?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
  fields?: {
    email: string;
    password: string;
    company: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);

  const checkoutSession = await getAcquiredItemsFromCheckoutSession(params.session ?? "");
  if (!checkoutSession) {
    return badRequest({ error: t("settings.subscription.checkout.invalid") });
  } else if (!checkoutSession.status?.pending) {
    return badRequest({ error: t("settings.subscription.checkout.alreadyProcessed") });
  } else if (!checkoutSession.customer?.id) {
    return badRequest({ error: t("settings.subscription.checkout.invalidCustomer") });
  }

  try {
    const registrationData = await getRegistrationFormData(request);
    const result = await validateRegistration({
      request,
      registrationData,
      addToTrialOrFreePlan: false,
      checkEmailVerification: false,
      stripeCustomerId: checkoutSession.customer.id,
    });
    if (!result.registered) {
      return badRequest({ error: t("shared.unknownError") });
    }
    const tenantId = result.registered.tenant.id;
    await addTenantProductsFromCheckoutSession({
      request,
      tenantId,
      user: result.registered.user,
      checkoutSession,
      createdUserId: result.registered.user.id,
      createdTenantId: result.registered.tenant.id,
      t,
    });
    await Promise.all(
      checkoutSession.products.map(async (product) => {
        await createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
      })
    );
    const userSession = await setLoggedUser(result.registered.user);
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      `/app/${result.registered.tenant.slug}/dashboard`
    );
  } catch (e: any) {
    return badRequest({ error: e.message });
  }
};

export default function PricingSubscribedSuccessRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:hide"]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div>
      <div className="">
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm space-y-5">
            <Logo className="mx-auto h-12 w-auto" />

            <div className="flex flex-col items-center">
              {data.error ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Unexpected Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">{data.error}</p>
                </>
              ) : !data.checkoutSession ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">Invalid checkout session</p>
                </>
              ) : (
                <>
                  <h1 className="text-left text-2xl font-extrabold">{t("account.register.setup")}</h1>
                  <p className="mt-1 text-center text-sm">Thank you for subscribing to {t(data.checkoutSession.products.map((f) => t(f.title)).join(", "))}</p>
                </>
              )}
            </div>

            {data.checkoutSession && !data.error && (
              <RegisterForm
                data={{
                  company: actionData?.fields?.company,
                  firstName: actionData?.fields?.firstName,
                  lastName: actionData?.fields?.lastName,
                  email: data.checkoutSession.customer.email,
                }}
                error={actionData?.error}
                isSettingUpAccount={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
