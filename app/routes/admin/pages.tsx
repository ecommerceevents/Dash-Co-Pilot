import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import TagsIcon from "~/components/ui/icons/crud/TagsIcon";
import TagsIconFilled from "~/components/ui/icons/crud/TagsIconFilled";
import BlockIcon from "~/components/ui/icons/pages/BlockIcon";
import BlockIconFilled from "~/components/ui/icons/pages/BlockIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.pages.view");
  const data: LoaderData = {
    title: `${t("pages.title")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("pages.title"),
          href: `/admin/pages`,
          exact: true,
          icon: <BlockIcon className="h-5 w-5" />,
          iconSelected: <BlockIconFilled className="h-5 w-5" />,
        },
        {
          name: "SEO",
          href: `/admin/pages/seo`,
          exact: true,
          icon: <TagsIcon className="h-5 w-5" />,
          iconSelected: <TagsIconFilled className="h-5 w-5" />,
        },
        {
          name: "AB Testing",
          href: `/admin/pages/ab`,
          exact: true,
          icon: "🚧",
          iconSelected: "🚧",
        },
      ]}
    >
      <Outlet />
    </SidebarIconsLayout>
  );
};

export function ErrorBoundary() {
  return <ServerError />;
}
