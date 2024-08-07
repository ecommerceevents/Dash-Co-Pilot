import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useRootData } from "~/utils/data/useRootData";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import GitHubIcon from "~/components/ui/icons/GitHubIcon";
import GoogleIcon from "~/components/ui/icons/GoogleIcon";
import RecaptchaWrapper from "~/components/recaptcha/RecaptchaWrapper";
import InputText from "~/components/ui/input/InputText";

interface Props {
  requireRecaptcha?: boolean;
  isVerifyingEmail?: boolean;
  isSettingUpAccount?: boolean;
  data?: { company?: string; firstName?: string; lastName?: string; email?: string; slug?: string };
  error: string | undefined;
}

export const RegisterForm = ({ requireRecaptcha = false, isVerifyingEmail = false, isSettingUpAccount = false, data = {}, error }: Props) => {
  const { t } = useTranslation();
  const { appConfiguration, csrf } = useRootData();
  const navigation = useNavigation();

  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  const showPasswordInput = !appConfiguration.auth.requireEmailVerification || isVerifyingEmail || isSettingUpAccount;

  return (
    <div className="border-border mx-auto flex flex-col items-center space-y-6 rounded-lg border p-6">
      <RecaptchaWrapper enabled={requireRecaptcha}>
        <input type="hidden" name="redirectTo" value={redirect} hidden readOnly />

        {/* <!-- SSO: START --> */}
        {!isVerifyingEmail && !isSettingUpAccount && (
          <>
            <div className="w-full space-y-3 text-center">
              {/* GitHub */}
              {appConfiguration.auth.authMethods.github.enabled && (
                <div>
                  <a
                    className="focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                    href={appConfiguration.auth.authMethods.github.authorizationURL}
                  >
                    <GitHubIcon className="mr-2 h-4 w-4 text-white" /> {t("auth.github.button")}
                  </a>
                </div>
              )}
              {/* GitHub: End */}
              {/* Google */}
              {appConfiguration.auth.authMethods.google.enabled && (
                <Form action="/oauth/google" method="post">
                  <button
                    type="submit"
                    className="focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2e70d9] focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-blue-700"
                  >
                    <GoogleIcon className="mr-2 h-4 w-4 text-white" /> {t("auth.google.button")}
                  </button>
                </Form>
              )}
              {/* Google: End */}
            </div>

            {appConfiguration.auth.authMethods.emailPassword.enabled && appConfiguration.auth.authMethods.github.enabled && (
              <div className="w-full border-t-2 border-dotted border-gray-200 dark:border-gray-900"></div>
            )}
          </>
        )}
        {/* <!-- SSO: END --> */}

        {appConfiguration.auth.authMethods.emailPassword.enabled && (
          <Form method="post" className="w-full space-y-3">
            <input type="hidden" name="csrf" value={csrf} hidden readOnly />
            {/* Tenant */}
            {appConfiguration.auth.requireOrganization && (
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="company">
                  {t("models.tenant.object")}
                </label> */}
                <InputText
                  title={t("models.tenant.object")}
                  disabled={navigation.state !== "idle"}
                  autoFocus
                  type="text"
                  name="company"
                  id="company"
                  placeholder={t("account.shared.companyPlaceholder")}
                  required
                  defaultValue={data.company}
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                />
              </div>
            )}
            {/* Tenant: End  */}

            {/* Personal Info */}
            {appConfiguration.auth.requireName && (
              <div className="flex -space-x-px space-y-4">
                <div className="w-1/2">
                  {/* <label htmlFor="first-name" className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400">
                    {t("account.shared.name")}
                  </label> */}
                  <InputText
                    title={t("account.shared.name")}
                    type="text"
                    name="first-name"
                    id="first-name"
                    required
                    defaultValue={data.firstName}
                    className="appearance-none rounded-md rounded-r-none"
                    placeholder={t("account.shared.firstNamePlaceholder")}
                    disabled={navigation.state !== "idle"}
                  />
                </div>
                <div className="w-1/2">
                  {/* <label htmlFor="last-name" className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400">
                    <span className="sr-only">{t("models.user.lastName")}</span>
                  </label> */}
                  <InputText
                    title=""
                    type="text"
                    name="last-name"
                    id="last-name"
                    defaultValue={data.lastName}
                    required
                    className="appearance-none rounded-md rounded-l-none"
                    placeholder={t("account.shared.lastNamePlaceholder")}
                    disabled={navigation.state !== "idle"}
                  />
                </div>
              </div>
            )}

            <div>
              {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="email">
                {t("account.shared.email")}
              </label> */}
              <InputText
                type="text"
                title={t("account.shared.email")}
                id="email"
                name="email"
                autoComplete="email"
                required
                readOnly={isVerifyingEmail}
                defaultValue={data.email}
                // className={clsx(
                //   "focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm",
                //   isVerifyingEmail && "cursor-not-allowed bg-gray-100 dark:bg-slate-800"
                // )}
                placeholder="email@address.com"
                disabled={navigation.state !== "idle"}
              />
            </div>

            {showPasswordInput && (
              <div>
                {/* <label className="flex justify-between space-x-2 text-xs font-medium text-gray-700 dark:text-gray-400" htmlFor="password">
                  {t("account.shared.password")}
                </label> */}
                <InputText
                  title={t("account.shared.password")}
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="************"
                  // className="focus:border-theme-500 focus:ring-theme-500 relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                  disabled={navigation.state !== "idle"}
                  defaultValue=""
                />
              </div>
            )}
            {/* Personal Info: End */}

            <div>
              <LoadingButton disabled={navigation.state !== "idle"} className="w-full" type="submit">
                {t("account.register.prompts.register.title")}
              </LoadingButton>
            </div>

            <div id="form-error-message">
              {error && navigation.state === "idle" ? (
                <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <div>{error}</div>
                </div>
              ) : null}
            </div>
          </Form>
        )}

        <p className="border-border mt-3 border-t py-2 text-center text-sm">
          {t("account.register.bySigningUp")}{" "}
          <a target="_blank" href="/terms-and-conditions" className="text-primary underline">
            {t("account.register.termsAndConditions")}
          </a>{" "}
          {t("account.register.andOur")}{" "}
          <a target="_blank" href="/privacy-policy" className="text-primary underline">
            {t("account.register.privacyPolicy")}
          </a>
          .
        </p>
      </RecaptchaWrapper>
    </div>
  );
};
