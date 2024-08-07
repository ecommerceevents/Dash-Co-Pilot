import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import MegaphoneFilled from "~/components/ui/icons/MegaphoneFilled";
import MegaphoneIcon from "~/components/ui/icons/emails/MegaphoneIcon";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("affiliates.title")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Affiliates",
          href: "/admin/affiliates",
          icon: <MegaphoneIcon className="h-5 w-5" />,
          iconSelected: <MegaphoneFilled className="h-5 w-5" />,
          exact: true,
        },
      ]}
    >
      <Outlet />
    </SidebarIconsLayout>
  );
};
