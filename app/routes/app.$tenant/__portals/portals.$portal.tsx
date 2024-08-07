import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import type { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import ServerError from "~/components/ui/errors/ServerError";
import CurrencyIcon from "~/components/ui/icons/CurrencyIcon";
import SettingsIcon from "~/components/ui/icons/crm/SettingsIcon";
import SettingsIconFilled from "~/components/ui/icons/crm/SettingsIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import IconAnalytics from "~/components/layouts/icons/IconAnalytics";
import WebsiteIcon from "~/components/ui/icons/WebsiteIcon";
import WebsiteIconFilled from "~/components/ui/icons/WebsiteIconFilled";
import { useTranslation } from "react-i18next";
import IconPages from "~/components/layouts/icons/IconPages";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import UserGroupIconFilled from "~/components/ui/icons/UserGroupIconFilled";
import UserGroupIcon from "~/components/ui/icons/UserGroupIcon";
import { useRootData } from "~/utils/data/useRootData";

type LoaderData = {
  metatags: MetaTagsDto;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  const config = appConfiguration.portals;
  if (!config?.enabled) {
    throw json({ error: "Portals are not enabled" }, { status: 400 });
  }
  if (!config?.forTenants) {
    throw json({ error: "You don't have access to this feature" }, { status: 403 });
  }
  const data: LoaderData = {
    metatags: [{ title: t("models.portal.plural") }],
  };
  return json(data);
};

export default () => {
  const { t } = useTranslation();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("shared.overview"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}`),
          exact: true,
          icon: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" fill="currentColor">
              <path d="M 39 0 L 39 2 L 46.5625 2 L 34 14.5625 L 30.71875 11.28125 L 30 10.59375 L 29.28125 11.28125 L 18 22.5625 L 14.71875 19.28125 L 14 18.59375 L 13.28125 19.28125 L 0.28125 32.28125 L 1.71875 33.71875 L 14 21.4375 L 17.28125 24.71875 L 18 25.40625 L 18.71875 24.71875 L 30 13.4375 L 33.28125 16.71875 L 34 17.40625 L 34.71875 16.71875 L 48 3.4375 L 48 11 L 50 11 L 50 0 Z M 42 14 L 42 50 L 44 50 L 44 14 Z M 48 15 L 48 50 L 50 50 L 50 15 Z M 30 20 L 30 50 L 32 50 L 32 20 Z M 36 20 L 36 50 L 38 50 L 38 20 Z M 24 24 L 24 50 L 26 50 L 26 24 Z M 12 28 L 12 50 L 14 50 L 14 28 Z M 18 30 L 18 50 L 20 50 L 20 30 Z M 6 34 L 6 50 L 8 50 L 8 34 Z M 0 38 L 0 50 L 2 50 L 2 38 Z"></path>
            </svg>
          ),
          iconSelected: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" fill="currentColor">
              <path d="M 38 0 L 38 4 L 43.1875 4 L 34 13.1875 L 31.40625 10.59375 L 30 9.15625 L 28.59375 10.59375 L 18 21.1875 L 15.40625 18.59375 L 14 17.15625 L 12.59375 18.59375 L 0.59375 30.59375 L 3.40625 33.40625 L 14 22.8125 L 16.59375 25.40625 L 18 26.84375 L 19.40625 25.40625 L 30 14.8125 L 32.59375 17.40625 L 34 18.84375 L 35.40625 17.40625 L 46 6.8125 L 46 12 L 50 12 L 50 0 Z M 44 15 L 44 50 L 48 50 L 48 15 Z M 30 20 L 30 50 L 34 50 L 34 20 Z M 37 20 L 37 50 L 41 50 L 41 20 Z M 23 24 L 23 50 L 27 50 L 27 24 Z M 16 30 L 16 50 L 20 50 L 20 30 Z M 9 31 L 9 50 L 13 50 L 13 31 Z M 2 38 L 2 50 L 6 50 L 6 38 Z"></path>
            </svg>
          ),
        },
        {
          name: t("models.portal.pages.plural"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/pages`),
          icon: <IconPages className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <IconPages className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("models.portal.users"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/users`),
          icon: <UserGroupIcon className="h-5 w-5" />,
          iconSelected: <UserGroupIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.portal.analytics"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/analytics`),
          icon: <IconAnalytics className="h-5 w-5" />,
          iconSelected: <IconAnalytics className="h-5 w-5" />,
          hidden: !portalsConfig?.analytics,
        },
        {
          name: t("models.portal.pricing"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/pricing`),
          icon: <CurrencyIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <CurrencyIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
          hidden: !portalsConfig?.pricing,
        },
        {
          name: t("models.domain.object"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/domains`),
          icon: <WebsiteIcon className="h-5 w-5" />,
          iconSelected: <WebsiteIconFilled className="h-5 w-5" />,
          hidden: !portalsConfig?.domains?.enabled,
        },
        {
          name: t("shared.settings"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/settings`),
          icon: <SettingsIcon className="h-5 w-5" />,
          iconSelected: <SettingsIconFilled className="h-5 w-5" />,
        },
        {
          name: t("shared.danger"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/danger`),
          icon: <ExclamationTriangleIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <ExclamationTriangleIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
          bottom: true,
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
