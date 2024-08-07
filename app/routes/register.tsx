import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Logo from "~/components/brand/Logo";
import { useTranslation } from "react-i18next";
import { getTranslations } from "~/locale/i18next.server";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { RegisterForm } from "~/modules/users/components/RegisterForm";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";
import AuthService from "~/modules/users/services/AuthService";
import { useTypedActionData } from "remix-typedjson";
import SuccessBanner from "~/components/ui/banners/SuccessBanner";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.subscription.allowSignUpBeforeSubscribe) {
    return redirect("/pricing");
  }
  return json({
    metatags: [{ title: `${t("account.register.title")} | ${process.env.APP_NAME}` }, ...getLinkTags(request)],
  });
};

type ActionData = {
  error?: string;
  verificationEmailSent?: boolean;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await AuthService.registerFromRequest(request);
};

export default function RegisterRoute() {
  const actionData = useTypedActionData<ActionData>();
  const { t } = useTranslation();

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            {!actionData?.verificationEmailSent ? (
              <>
                <h1 className="text-left text-2xl font-extrabold">{t("account.register.title")}</h1>
                <p className="mt-1 text-center">
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t("account.register.clickHereToLogin")}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-left text-2xl font-extrabold">{t("account.verify.title")}</h1>
                <div className="mt-8">
                  <SuccessBanner title={t("shared.success")} text={t("account.verify.emailSent")} />
                </div>
              </>
            )}
          </div>

          {!actionData?.verificationEmailSent && <RegisterForm requireRecaptcha error={actionData?.error} />}
        </div>
      </div>
    </div>
  );
}
