import Logo from "~/components/brand/Logo";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import UserUtils from "~/utils/app/UserUtils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useSearchParams, Form, useActionData, useNavigation } from "@remix-run/react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getUserByEmail, updateUserPassword } from "~/utils/db/users.db.server";
import bcrypt from "bcryptjs";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import EventsService from "~/modules/events/services/.server/EventsService";
import { UserPasswordUpdatedDto } from "~/modules/events/dtos/UserPasswordUpdatedDto";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";
import InputText from "~/components/ui/input/InputText";
import { useTypedLoaderData } from "remix-typedjson";
import { createUserSession, getUserInfo } from "~/utils/session.server";

type LoaderData = {
  email: string;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const url = new URL(request.url);
  let email = url.searchParams.get("e") ?? "";
  if (email) {
    email = decodeURIComponent(email);
  }
  return json({
    title: `${t("account.reset.title")} | ${process.env.APP_NAME}`,
    email,
  });
};

type ActionData = {
  success?: string;
  error?: string;
  fields?: {
    email: string;
    verifyToken: string;
  };
};
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const verifyToken = form.get("verify-token")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";
  const passwordConfirm = form.get("password-confirm")?.toString() ?? "";

  const ipError = await IpAddressServiceServer.log(request, { action: "reset", description: email }).catch((e) => e.message);
  if (ipError) {
    return json({ error: ipError }, { status: 400 });
  }

  const fields = {
    email,
    verifyToken,
  };
  if (!email) {
    return json({ error: "Email required", fields }, { status: 400 });
  }
  const passwordError = UserUtils.validatePasswords({ t, password, passwordConfirm });
  if (passwordError) {
    return json({ error: passwordError, fields }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return json({ error: t("api.errors.userNotRegistered"), fields }, { status: 400 });
  }

  if (!user.verifyToken || !verifyToken || user.verifyToken !== verifyToken) {
    return json({ error: "Invalid token, reset your password first", fields }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updateUserPassword({ passwordHash }, user.id);
  await EventsService.create({
    request,
    event: "user.password.updated",
    tenantId: null,
    userId: user.id,
    data: {
      user: { id: user.id, email: user.email },
    } satisfies UserPasswordUpdatedDto,
  });

  const userInfo = await getUserInfo(request);
  return createUserSession(
    {
      ...userInfo,
      userId: user.id,
      lng: user.locale ?? userInfo.lng,
    },
    "/app"
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function ResetRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const search = useLocation().search;
  const [verifyToken] = useState(actionData?.fields?.email || new URLSearchParams(search).get("t") || "");

  const [, setSearchParams] = useSearchParams();
  const [actionResult, setActionResult] = useState<{ error?: string; success?: string }>();
  useEffect(() => {
    if (actionData) {
      setActionResult(actionData);
    }
    if (actionData?.error && actionData.fields) {
      setSearchParams({ e: actionData.fields.email, t: actionData.fields.verifyToken });
    }
  }, [actionData, setSearchParams]);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">{t("account.newPassword.title")}</div>
            <div className="mt-1 text-left">
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </div>
          </div>

          <div className="border-border mx-auto flex flex-col items-center space-y-6 rounded-lg border p-6">
            <Form method="post" className="w-full space-y-3">
              <input type="hidden" name="verify-token" defaultValue={verifyToken} required hidden readOnly />
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="email">
                  {t("account.shared.email")}
                </label> */}
                <InputText
                  title={t("account.shared.email")}
                  id="email"
                  name="email"
                  type="email"
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full cursor-not-allowed appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                  placeholder="email@address.com"
                  readOnly
                  defaultValue={data.email}
                />
              </div>
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="password">
                  {t("account.shared.password")}
                </label> */}
                <InputText
                  title={t("account.shared.password")}
                  autoFocus
                  id="password"
                  name="password"
                  type="password"
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                  placeholder="************"
                  readOnly={!data.email}
                  defaultValue=""
                  required
                />
              </div>
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="password">
                  {t("account.register.confirmPassword")}
                </label> */}
                <InputText
                  title={t("account.register.confirmPassword")}
                  name="password-confirm"
                  type="password"
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                  placeholder="************"
                  readOnly={!data.email}
                  defaultValue=""
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <LoadingButton disabled={!data.email} className="w-full" type="submit">
                  {t("account.newPassword.button")}
                </LoadingButton>
              </div>
              <div id="form-error-message">
                {actionResult?.error && navigation.state === "idle" ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div>{actionResult.error}</div>
                  </div>
                ) : null}
              </div>
            </Form>
          </div>

          {actionResult?.success && (
            <InfoBanner title={t("account.reset.resetSuccess")} text={""}>
              <Link to="/login" className="text-primary font-medium hover:underline">
                {actionResult.success}
              </Link>
            </InfoBanner>
          )}
        </div>
      </div>
    </div>
  );
}
