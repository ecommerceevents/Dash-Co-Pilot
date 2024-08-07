import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import Logo from "~/components/brand/Logo";
import { getTranslations } from "~/locale/i18next.server";
import { TenantWithDetails, getTenant } from "~/utils/db/tenants.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

type LoaderData = {
  metatags: MetaTagsDto;
  currentTenant: TenantWithDetails;
};
export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const currentTenant = await getTenant(tenantId);
  if (!currentTenant) {
    throw redirect(`/app`);
  }
  if (!currentTenant.deactivatedReason) {
    return redirect(`/app/${currentTenant.slug}/dashboard`);
  }
  const data: LoaderData = {
    metatags: [
      {
        title: `${t("shared.deactivated")} | ${process.env.APP_NAME}`,
      },
    ],
    currentTenant,
  };
  return json(data);
};

export default function TenantDeactivatedRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <div className="">
        <div className="flex min-h-full flex-col pb-12 pt-16">
          <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex flex-shrink-0 justify-center">
              <Logo />
            </div>
            <div className="py-16">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{data.currentTenant.name}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-5xl">{t("shared.deactivated")}</h1>
                <p className="mt-2 text-lg text-gray-600">{data.currentTenant.deactivatedReason}</p>
                <div className="mt-4 flex">
                  <Link to="." className="text-primary hover:text-primary/90 w-full text-center text-sm font-medium hover:underline">
                    Reload
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
