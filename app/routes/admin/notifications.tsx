import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import ServerError from "~/components/ui/errors/ServerError";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import AlarmIcon from "~/components/ui/icons/notifications/AlarmIcon";
import AlarmIconFilled from "~/components/ui/icons/notifications/AlarmIconFilled";
import ChannelIcon from "~/components/ui/icons/notifications/ChannelIcon";
import ChannelIconFilled from "~/components/ui/icons/notifications/ChannelIconFilled";
import EarIcon from "~/components/ui/icons/notifications/EarIcon";
import EarIconFilled from "~/components/ui/icons/notifications/EarIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  if (!process.env.NOTIFICATIONS_NOVU_API_KEY) {
    throw Error("NOTIFICATIONS_NOVU_API_KEY env variable required.");
  } else if (!process.env.NOTIFICATIONS_NOVU_APP_ID) {
    throw Error("NOTIFICATIONS_NOVU_APP_ID env variable required.");
  }
  await verifyUserHasPermission(request, "admin.notifications.view");
  const data: LoaderData = {
    title: `${t("notifications.title")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const params = useParams();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: params.tenant ? `/app/${params.tenant}/notifications` : "/admin/notifications",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Subscribers",
          href: params.tenant ? `/app/${params.tenant}/notifications/subscribers` : "/admin/notifications/subscribers",
          icon: <EarIcon className="h-5 w-5" />,
          iconSelected: <EarIconFilled className="h-5 w-5" />,
        },
        {
          name: "Messages",
          href: params.tenant ? `/app/${params.tenant}/notifications/messages` : "/admin/notifications/messages",
          icon: <AlarmIcon className="h-5 w-5" />,
          iconSelected: <AlarmIconFilled className="h-5 w-5" />,
        },
        {
          name: "Channels",
          href: params.tenant ? `/app/${params.tenant}/notifications/channels` : "/admin/notifications/channels",
          icon: <ChannelIcon className="h-5 w-5" />,
          iconSelected: <ChannelIconFilled className="h-5 w-5" />,
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
