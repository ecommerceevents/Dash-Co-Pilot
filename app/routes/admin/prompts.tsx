import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import SettingsIcon from "~/components/ui/icons/crm/SettingsIcon";
import SettingsIconFilled from "~/components/ui/icons/crm/SettingsIconFilled";
import WorkflowIcon from "~/modules/workflowEngine/components/icons/WorkflowIcon";
import WorkflowIconFilled from "~/modules/workflowEngine/components/icons/WorkflowIconFilled";
import FolderIcon from "~/components/ui/icons/entities/FolderIcon";
import FolderIconFilled from "~/components/ui/icons/entities/FolderIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.prompts.view");
  const data: LoaderData = {
    title: `${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
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
          name: "Overview",
          href: "/admin/prompts",
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
          exact: true,
        },
        {
          name: "Prompts",
          href: "/admin/prompts/builder",
          icon: <WorkflowIcon className="h-5 w-5" />,
          iconSelected: <WorkflowIconFilled className="h-5 w-5" />,
        },
        {
          name: "Groups",
          href: "/admin/prompts/groups",
          icon: <FolderIcon className="h-5 w-5" />,
          iconSelected: <FolderIconFilled className="h-5 w-5" />,
        },
        {
          name: "Settings",
          href: "/admin/feature-flags/settings",
          icon: <SettingsIcon className="h-5 w-5" />,
          iconSelected: <SettingsIconFilled className="h-5 w-5" />,
          bottom: true,
        },
      ]}
    >
      <Outlet />
    </SidebarIconsLayout>
  );
};
