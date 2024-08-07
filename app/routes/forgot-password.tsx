import Logo from "~/components/brand/Logo";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Form, useActionData, useNavigation } from "@remix-run/react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import crypto from "crypto";
import { getUserByEmail, updateUserVerifyToken } from "~/utils/db/users.db.server";
import { getTranslations } from "~/locale/i18next.server";
import { sendEmail } from "~/utils/email.server";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { getBaseURL } from "~/utils/url.server";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import SuccessBanner from "~/components/ui/banners/SuccessBanner";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";
import { getDefaultSiteTags } from "~/modules/pageBlocks/utils/defaultSeoMetaTags";
import InputText from "~/components/ui/input/InputText";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  return json({
    metatags: [{ title: `${t("account.forgot.title")} | ${getDefaultSiteTags().title}` }, ...getLinkTags(request)],
  });
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();

  if (!email) {
    return badRequest({
      error: "Email required",
    });
  }

  const user = await getUserByEmail(email);
  // const ipError = await IpAddressServiceServer.log(request, {
  //   action: "forgot-password",
  //   description: email,
  //   block: user === null ? "User not found" : undefined,
  // }).catch((e) => e.message);
  // if (ipError) {
  //   return json({ error: ipError }, { status: 400 });
  // }
  if (!user) {
    // Do not show that the email was not found, fake wait
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return json({ success: "Email sent" });
  }

  var verifyToken = crypto.randomBytes(20).toString("hex");
  await updateUserVerifyToken({ verifyToken }, user.id);
  await sendEmail({
    request,
    to: email,
    alias: "password-reset",
    data: {
      action_url: new URL(getBaseURL(request) + `/reset?e=${encodeURIComponent(email)}&t=${verifyToken}`),
      name: user.firstName,
    },
  });

  return json({
    success: "Email sent",
  });
};

export default function ForgotPasswordRoute() {
  const { t } = useTranslation();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      setEmailSent(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">{t("account.forgot.title")}</div>
            <div className="mt-1 text-center">
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </div>
          </div>

          <div className="border-border mx-auto flex flex-col items-center space-y-6 rounded-lg border p-6">
            <Form method="post" className="w-full space-y-3">
              {/* <div className="text-left font-medium">{t("account.reset.headline")}</div> */}
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="email">
                  {t("account.shared.email")}
                </label> */}
                <InputText
                  title={t("account.shared.email")}
                  id="email"
                  name="email"
                  type="email"
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                  placeholder="email@address.com"
                  required
                  defaultValue=""
                />
              </div>
              <div className="flex items-center justify-end">
                <LoadingButton type="submit" className="w-full">
                  {t("account.reset.button")}
                </LoadingButton>
              </div>
              <div id="form-error-message">
                {actionData?.error && navigation.state === "idle" ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div>{actionData.error}</div>
                  </div>
                ) : null}
              </div>
            </Form>
          </div>

          {emailSent && (
            <div className="mt-8">
              <SuccessBanner title={t("account.reset.resetSuccess")} text={t("account.reset.emailSent")} />
            </div>
          )}
        </div>
      </div>

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
