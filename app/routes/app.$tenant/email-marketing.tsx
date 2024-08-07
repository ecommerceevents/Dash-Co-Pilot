import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import MegaphoneIcon from "~/components/ui/icons/emails/MegaphoneIcon";
import MegaphoneIconFilled from "~/components/ui/icons/emails/MegaphoneIconFilled";
import SentIcon from "~/components/ui/icons/emails/SentIcon";
import SentIconFilled from "~/components/ui/icons/emails/SentIconFilled";
import ActivityHistoryIcon from "~/components/ui/icons/entities/ActivityHistoryIcon";
import ActivityHistoryIconFilled from "~/components/ui/icons/entities/ActivityHistoryIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import CrmService from "~/modules/crm/services/CrmService";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.app.features.tenantEmailMarketing) {
    return redirect(`/app/${params.tenant}`);
  }
  const data: LoaderData = {
    title: `${t("emailMarketing.title")} | ${process.env.APP_NAME}`,
  };
  const tenantId = await getTenantIdOrNull({ request, params });
  await CrmService.validate(tenantId);
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  const params = useParams();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: params.tenant ? `/app/${params.tenant}/email-marketing` : "/admin/email-marketing",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Campaigns",
          href: params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns",
          icon: <MegaphoneIcon className="h-5 w-5" />,
          iconSelected: <MegaphoneIconFilled className="h-5 w-5" />,
        },
        {
          name: "Activity",
          href: params.tenant ? `/app/${params.tenant}/email-marketing/activity` : "/admin/email-marketing/activity",
          icon: <ActivityHistoryIcon className="h-5 w-5" />,
          iconSelected: <ActivityHistoryIconFilled className="h-5 w-5" />,
        },
        {
          name: t("emailMarketing.senders.plural"),
          href: params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders",
          icon: <SentIcon className="h-5 w-5" />,
          iconSelected: <SentIconFilled className="h-5 w-5" />,
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
