import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { getPage } from "~/modules/pageBlocks/db/pages.db.server";
import { useEffect } from "react";
import UrlUtils from "~/utils/app/UrlUtils";
import { getPageConfiguration } from "~/modules/pageBlocks/services/.server/pagesService";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { PageConfiguration } from "~/modules/pageBlocks/dtos/PageConfiguration";

type LoaderData = {
  page: PageConfiguration;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getPage(params.id!);
  if (!item) {
    return redirect("/admin/pages");
  }
  const page = await getPageConfiguration({ request, page: item, slug: item.slug });

  if (new URL(request.url).pathname === "/admin/pages/edit/" + params.id) {
    return redirect("/admin/pages/edit/" + params.id + "/blocks");
  }
  const data: LoaderData = {
    page,
  };
  return json(data);
};

export default function PageEditRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === `/admin/pages/edit/${params.id}`) {
      navigate(`/admin/pages/edit/${params.id}/blocks`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("pages.blocks"),
            routePath: `/admin/pages/edit/${params.id}/blocks`,
          },
          {
            name: t("pages.seo"),
            routePath: `/admin/pages/edit/${params.id}/seo`,
          },
          {
            name: t("pages.settings"),
            routePath: `/admin/pages/edit/${params.id}/settings`,
          },
        ]}
        breadcrumb={[
          {
            title: "Pages",
            routePath: "/admin/pages",
          },
          {
            title: data.page.name,
          },
        ]}
      >
        <Outlet />
      </IndexPageLayout>
    </div>
  );
}
