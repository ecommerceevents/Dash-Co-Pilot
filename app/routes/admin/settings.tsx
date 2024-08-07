import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import IconAnalytics from "~/components/layouts/icons/IconAnalytics";
import IconKeys from "~/components/layouts/icons/IconKeys";
import CacheIcon from "~/components/ui/icons/CacheIcon";
import CookieIcon from "~/components/ui/icons/CookieIcon";
import CurrencyIcon from "~/components/ui/icons/CurrencyIcon";
import EmailIcon from "~/components/ui/icons/EmailIcon";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import GearIcon from "~/components/ui/icons/GearIcon";
import GearIconFilled from "~/components/ui/icons/GearIconFilled";
import LanguageIcon from "~/components/ui/icons/LanguageIcon";
import MagnifyingGlassIcon from "~/components/ui/icons/MagnifyingGlassIcon";
import UserIcon from "~/components/ui/icons/UserIcon";
import MembershipCardIcon from "~/components/ui/icons/settings/MembershipCardIcon";
import MembershipCardIconFilled from "~/components/ui/icons/settings/MembershipCardIconFilled";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import UrlUtils from "~/utils/app/UrlUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/settings") {
    return redirect("/admin/settings/general");
  }
  return json({});
};

export default function AdminSettings() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/settings") {
      navigate("/admin/settings/general");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("settings.admin.profile.title"),
          // description: t("settings.admin.profile.description"),
          href: "/admin/settings/profile",
          icon: <UserIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <UserIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.general.title"),
          // description: t("settings.admin.general.description"),
          href: "/admin/settings/general",
          icon: <GearIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <GearIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.pricing.title"),
          // description: t("settings.admin.pricing.description"),
          href: "/admin/settings/pricing",
          icon: <CurrencyIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <CurrencyIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.authentication.title"),
          // description: t("settings.admin.authentication.description"),
          href: "/admin/settings/authentication",
          icon: <IconKeys className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <IconKeys className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.analytics.title"),
          // description: t("settings.admin.analytics.description"),
          href: "/admin/settings/analytics",
          icon: <IconAnalytics className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <IconAnalytics className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.seo.title"),
          // description: t("settings.admin.seo.description"),
          href: "/admin/settings/seo",
          icon: <MagnifyingGlassIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <MagnifyingGlassIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.internationalization.title"),
          // description: t("settings.admin.internationalization.description"),
          href: "/admin/settings/internationalization",
          icon: <LanguageIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <LanguageIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.transactionalEmails.title"),
          // description: t("settings.admin.transactionalEmails.description"),
          href: "/admin/settings/transactional-emails",
          icon: <EmailIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <EmailIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.tenants.types.title"),
          // description: t("settings.admin.tenants.types.description"),
          href: "/admin/settings/accounts/types",
          icon: <MembershipCardIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <MembershipCardIconFilled className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.cookies.title"),
          // description: t("settings.admin.cookies.description"),
          href: "/admin/settings/cookies",
          icon: <CookieIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <CookieIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.cache.title"),
          // description: t("settings.admin.cache.description"),
          href: "/admin/settings/cache",
          icon: <CacheIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <CacheIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.danger.title"),
          // description: t("settings.admin.danger.description"),
          href: "/admin/settings/danger",
          icon: <ExclamationTriangleIcon className=" h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />,
          iconSelected: <ExclamationTriangleIcon className=" h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />,
          bottom: true,
        },
      ]}
    >
      <Outlet />
    </SidebarIconsLayout>
  );
}
