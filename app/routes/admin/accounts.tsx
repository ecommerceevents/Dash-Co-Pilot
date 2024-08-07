import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    title: "",
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
          name: t("admin.tenants.title"),
          href: "/admin/accounts",
          exact: true,
          // permission: "admin.accounts.view",
        },
        {
          name: t("models.user.plural"),
          href: "/admin/accounts/users",
          // permission: "admin.users.view",
        },
        {
          name: t("app.sidebar.rolesAndPermissions"),
          href: "/admin/accounts/roles-and-permissions",
          // permission: "admin.roles.view",
        },
        {
          name: "Relationships",
          href: "/admin/accounts/relationships",
          // permission: "admin.relationships.view",
        },
        {
          name: "Subscriptions",
          href: "/admin/accounts/subscriptions",
          // permission: "admin.relationships.view",
        },
        {
          name: t("models.blacklist.object"),
          href: "/admin/accounts/blacklist",
          // permission: "admin.blacklist.view",
        },
        {
          name: t("models.tenantIpAddress.plural"),
          href: "/admin/accounts/ip-addresses",
          // permission: "admin.tenantIpAddress.view",
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
