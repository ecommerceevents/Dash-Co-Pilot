import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { getUserInfo } from "~/utils/session.server";
import Logo from "~/components/brand/Logo";
import { getTranslations } from "~/locale/i18next.server";
import { getUser } from "~/utils/db/users.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import LoginForm, { LoginActionData } from "~/modules/users/components/LoginForm";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import AuthService from "~/modules/users/services/AuthService";
import { useRootData } from "~/utils/data/useRootData";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
  demoCredentials?: { email: string; password: string };
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  const userInfo = await getUserInfo(request);
  if (userInfo.userId !== undefined && userInfo.userId !== "") {
    const user = await getUser(userInfo.userId);
    if (user) {
      if (!user?.defaultTenantId) {
        return redirect("/app");
      } else {
        const tenant = await getTenant(user.defaultTenantId);
        if (tenant) {
          return redirect(`/app/${tenant?.slug ?? tenant.id}`);
        }
      }
    }
  }

  const demoUser = process.env.DEMO_USER?.split(":");
  const data: LoaderData = {
    metatags: [{ title: `${t("account.login.title")} | ${process.env.APP_NAME}` }, ...getLinkTags(request)],
    demoCredentials: demoUser && demoUser.length > 1 ? { email: demoUser[0], password: demoUser[1] } : undefined,
  };
  return json(data);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  return await AuthService.loginFromRequest(request, form);
};

export default function LoginRoute() {
  const { appConfiguration } = useRootData();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<LoginActionData>();

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />

          <LoginForm actionData={actionData} redirectTo={appConfiguration.app.features.tenantHome === "/" ? "/" : undefined} />

          {data.demoCredentials && (
            <InfoBanner title="Guest Demo Account" text="">
              <b>email:</b>
              <span className="select-all">{data.demoCredentials.email}</span>, <b>password:</b>
              <span className="select-all">{data.demoCredentials.password}</span>.
            </InfoBanner>
          )}
        </div>
      </div>
    </div>
  );
}
