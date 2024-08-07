import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import Logo from "~/components/brand/Logo";
import { useTranslation } from "react-i18next";
import { getTranslations } from "~/locale/i18next.server";
import { Registration } from "@prisma/client";
import { getRegistrationByToken } from "~/utils/db/registration.db.server";
import { RegisterForm } from "~/modules/users/components/RegisterForm";
import AuthService from "~/modules/users/services/AuthService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  registration: Registration | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const registration = await getRegistrationByToken(params.id ?? "");
  const data: LoaderData = {
    title: `${t("account.verify.title")} | ${process.env.APP_NAME}`,
    registration,
  };
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
    slug: string | undefined;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  return await AuthService.verifyFromRequest({ request, params });
};

export default function RegisterRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

  return (
    <div className="bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Logo className="mx-auto h-12 w-auto" />

          {data.registration && !data.registration.createdTenantId ? (
            <>
              <div>
                <h1 className="mt-6 text-center text-lg font-bold leading-9 text-gray-800 dark:text-slate-200">{t("account.verify.title")}</h1>
                <p className="max-w mt-2 text-center text-sm leading-5 text-gray-800 dark:text-slate-200">
                  {t("account.register.alreadyRegistered")}{" "}
                  <span className="text-primary font-medium hover:underline">
                    <Link to="/login">{t("account.register.clickHereToLogin")}</Link>
                  </span>
                </p>
              </div>
              <RegisterForm
                isVerifyingEmail
                data={{
                  company: actionData?.fields?.company ?? data.registration?.company ?? "",
                  firstName: actionData?.fields?.firstName ?? data.registration?.firstName,
                  lastName: actionData?.fields?.lastName ?? data.registration?.lastName,
                  email: actionData?.fields?.email ?? data.registration?.email,
                  slug: actionData?.fields?.slug ?? data.registration?.slug ?? "",
                }}
                error={actionData?.error}
              />
            </>
          ) : (
            <div>
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
                  <div className="text-xl font-black">
                    <h1 className="mt-6 text-center text-lg font-extrabold">{t("account.verify.title")}</h1>
                  </div>
                  <div className="my-4 leading-tight">
                    <p className="max-w mt-2 text-center text-sm leading-5">{t("account.verify.invalidLink")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
