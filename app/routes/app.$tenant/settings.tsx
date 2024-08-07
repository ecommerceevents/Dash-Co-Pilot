import { Outlet, useLocation, useNavigate, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEffect } from "react";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import SidebarIconsLayout, { IconDto } from "~/components/ui/layouts/SidebarIconsLayout";
import CustomerIcon from "~/components/ui/icons/settings/CustomerIcon";
import CustomerIconFilled from "~/components/ui/icons/settings/CustomerIconFilled";
import PeopleIcon from "~/components/ui/icons/settings/PeopleIcon";
import PeopleIconFilled from "~/components/ui/icons/settings/PeopleIconFilled";
import MembershipCardIcon from "~/components/ui/icons/settings/MembershipCardIcon";
import MembershipCardIconFilled from "~/components/ui/icons/settings/MembershipCardIconFilled";
import CompanyIcon from "~/components/ui/icons/crm/CompanyIcon";
import CompanyIconFilled from "~/components/ui/icons/crm/CompanyIconFilled";
import LinkIcon from "~/components/ui/icons/crud/LinkIcon";
import LinkIconFilled from "~/components/ui/icons/crud/LinkIconFilled";
import RestApiIcon from "~/components/ui/icons/entities/RestApiIcon";
import RestApiIconFilled from "~/components/ui/icons/entities/RestApiIconFilled";
import ActivityHistoryIcon from "~/components/ui/icons/entities/ActivityHistoryIcon";
import ActivityHistoryIconFilled from "~/components/ui/icons/entities/ActivityHistoryIconFilled";
import { useTypedLoaderData } from "remix-typedjson";
import ExperimentIcon from "~/components/ui/icons/tests/ExperimentIcon";
import ExperimentIconFilled from "~/components/ui/icons/tests/ExperimentIconFilled";
import ModulesIcon from "~/components/ui/icons/entities/ModulesIcon";
import ModulesIconFilled from "~/components/ui/icons/entities/ModulesIconFilled";
import { useRootData } from "~/utils/data/useRootData";
import CreditsIcon from "~/components/ui/icons/CreditsIcon";
import CreditsIconFilled from "~/components/ui/icons/CreditsIconFilled";
import { CreditTypes } from "~/modules/usage/dtos/CreditType";

type LoaderData = {
  title: string;
  isProduction?: boolean;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("app.navbar.settings")} | ${process.env.APP_NAME}`,
    isProduction: process.env.NODE_ENV === "production",
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function SettingsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();
  const rootData = useRootData();

  const getTabs = () => {
    const tabs: IconDto[] = [];
    tabs.push({
      name: t("settings.profile.profileTitle"),
      href: UrlUtils.currentTenantUrl(params, "settings/profile"),
      icon: <CustomerIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
      iconSelected: <CustomerIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
    });
    if (getUserHasPermission(appOrAdminData, "app.settings.members.view")) {
      tabs.push({
        name: t("settings.members.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/members"),
        icon: <PeopleIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <PeopleIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.subscription.view")) {
      tabs.push({
        name: t("settings.subscription.title"),
        href: UrlUtils.currentTenantUrl(params, `settings/subscription`),
        icon: <MembershipCardIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <MembershipCardIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
      if (CreditTypes.length > 0) {
        tabs.push({
          name: t("models.credit.plural"),
          href: UrlUtils.currentTenantUrl(params, "settings/credits"),
          icon: <CreditsIcon className="h-5 w-5" />,
          iconSelected: <CreditsIconFilled className="h-5 w-5" />,
        });
      }
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.account.view")) {
      tabs.push({
        name: t("settings.tenant.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/account"),
        exact: true,
        icon: <CompanyIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <CompanyIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (rootData.appConfiguration.app.features.tenantTypes && getUserHasPermission(appOrAdminData, "app.settings.accounts.view")) {
      tabs.push({
        name: t("models.tenant.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/accounts"),
        icon: <LinkIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <LinkIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    // if (getUserHasPermission(appOrAdminData, "app.settings.roles.view")) {
    //   tabs.push({
    //     name: t("models.role.plural"),
    //     href: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions"),
    //     icon: <AccessDeniedIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
    //     iconSelected: <AccessDeniedIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
    //   });
    // }
    // tabs.push({
    //   name: t("models.group.plural"),
    //   href: UrlUtils.currentTenantUrl(params, "settings/groups"),
    //   icon: <GroupIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
    //   iconSelected: <GroupIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
    // });
    if (rootData.appConfiguration.app.features.linkedAccounts && getUserHasPermission(appOrAdminData, "app.settings.linkedAccounts.view")) {
      tabs.push({
        name: t("models.linkedAccount.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/linked-accounts"),
        icon: <LinkIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <LinkIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (rootData.appConfiguration.app.features.tenantApiKeys && getUserHasPermission(appOrAdminData, "app.settings.apiKeys.view")) {
      tabs.push({
        name: "API",
        href: UrlUtils.currentTenantUrl(params, "settings/api"),
        icon: <RestApiIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <RestApiIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.auditTrails.view")) {
      tabs.push({
        name: t("models.log.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/logs"),
        icon: <ActivityHistoryIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <ActivityHistoryIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (rootData.appConfiguration.app.features.tenantEntityCustomization) {
      tabs.push({
        name: t("models.entity.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/entities"),
        icon: <ModulesIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <ModulesIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    if (!data.isProduction && appOrAdminData.isSuperAdmin) {
      tabs.push({
        name: "Debug",
        href: UrlUtils.currentTenantUrl(params, "settings/debug"),
        icon: <ExperimentIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
        iconSelected: <ExperimentIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
      });
    }
    // setTabs(tabs);

    // eslint-disable-next-line react-hooks/exhaustive-deps

    return tabs;
  };

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.currentTenantUrl(params, "settings")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/profile"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <SidebarIconsLayout label={{ align: "right" }} items={getTabs()}>
      <Outlet />
    </SidebarIconsLayout>
  );
}
