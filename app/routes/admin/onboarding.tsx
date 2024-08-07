import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import ServerError from "~/components/ui/errors/ServerError";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import GoalIcon from "~/components/ui/icons/onboardings/GoalIcon";
import GoalIconFilled from "~/components/ui/icons/onboardings/GoalIconFilled";
import JourneyIcon from "~/components/ui/icons/onboardings/JourneyIcon";
import JourneyIconFilled from "~/components/ui/icons/onboardings/JourneyIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.onboarding.view");
  const data: LoaderData = {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
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
          href: "/admin/onboarding",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Onboardings",
          href: "/admin/onboarding/onboardings",
          icon: <GoalIcon className="h-5 w-5" />,
          iconSelected: <GoalIconFilled className="h-5 w-5" />,
        },
        {
          name: "Sessions",
          href: "/admin/onboarding/sessions",
          icon: <JourneyIcon className="h-5 w-5" />,
          iconSelected: <JourneyIconFilled className="h-5 w-5" />,
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
