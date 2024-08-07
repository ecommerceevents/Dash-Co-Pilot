import { SideBarItem } from "./SidebarItem";
import { SvgIcon } from "../enums/shared/SvgIcon";
import { TFunction } from "i18next";
import ExperimentIconFilled from "~/components/ui/icons/tests/ExperimentIconFilled";

export const AdminSidebar = (t: TFunction): SideBarItem[] => [
  {
    title: t(""),
    path: "",
    items: [
      {
        title: t("app.sidebar.dashboard"),
        path: `/admin/dashboard`,
        icon: SvgIcon.DASHBOARD,
      },
    ],
  },
  {
    title: t("segments.manage"),
    icon: SvgIcon.DASHBOARD,
    path: "",
    items: [
      {
        title: t("app.sidebar.accountsAndUsers"),
        path: "/admin/accounts",
        icon: SvgIcon.TENANTS,
        isCollapsible: false,
        items: [
          {
            title: t("admin.tenants.title"),
            path: "/admin/accounts",
            // icon: SvgIcon.TENANTS,
            items: [],
            permission: "admin.accounts.view",
          },
          {
            title: t("models.user.plural"),
            path: "/admin/accounts/users",
            items: [],
            permission: "admin.users.view",
          },
          {
            title: t("app.sidebar.rolesAndPermissions"),
            path: "/admin/accounts/roles-and-permissions",
            items: [],
            permission: "admin.roles.view",
          },
          {
            title: t("models.blacklist.object"),
            path: "/admin/accounts/blacklist",
            items: [],
            permission: "admin.blacklist.view",
          },
          {
            title: t("models.tenantIpAddress.plural"),
            path: "/admin/accounts/ip-addresses",
            items: [],
            permission: "admin.tenantIpAddress.view",
          },
        ],
        permission: "admin.accounts.view",
      },
      {
        title: t("analytics.title"),
        path: `/admin/analytics`,
        icon: SvgIcon.ANALYTICS,
      },
      {
        title: t("helpDesk.title"),
        path: `/admin/help-desk`,
        icon: SvgIcon.HELP_DESK,
      },
      {
        title: t("notifications.title"),
        path: "/admin/notifications",
        entityIcon: `<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50"> <path d="M 25 6 C 23.355469 6 22 7.355469 22 9 L 22 10.363281 C 17.171875 11.550781 14 15.613281 14 21.0625 L 14 28.863281 C 14 31.035156 12.71875 33.496094 11.980469 34.726563 L 10.167969 37.445313 C 9.964844 37.75 9.941406 38.148438 10.117188 38.472656 C 10.292969 38.796875 10.632813 39 11 39 L 39 39 C 39.367188 39 39.707031 38.796875 39.882813 38.472656 C 40.058594 38.148438 40.035156 37.753906 39.832031 37.445313 L 38.046875 34.765625 C 36.667969 32.472656 36 30.585938 36 29 L 36 21.199219 C 36 15.683594 32.828125 11.570313 28 10.371094 L 28 9 C 28 7.355469 26.644531 6 25 6 Z M 25 8 C 25.554688 8 26 8.445313 26 9 L 26 10.046875 C 25.671875 10.019531 25.339844 10 25 10 C 24.660156 10 24.328125 10.019531 24 10.046875 L 24 9 C 24 8.445313 24.445313 8 25 8 Z M 3.480469 9.476563 C 1.25 13.101563 0 17.417969 0 22 C 0 26.582031 1.25 30.898438 3.480469 34.523438 L 5.1875 33.476563 C 3.152344 30.167969 2 26.21875 2 22 C 2 17.78125 3.152344 13.832031 5.1875 10.523438 Z M 46.519531 9.476563 L 44.8125 10.523438 C 46.847656 13.832031 48 17.78125 48 22 C 48 26.21875 46.847656 30.167969 44.8125 33.476563 L 46.519531 34.523438 C 48.75 30.898438 50 26.582031 50 22 C 50 17.417969 48.75 13.101563 46.519531 9.476563 Z M 7.816406 12.140625 C 5.996094 15.082031 5 18.355469 5 22 C 5 25.671875 6.128906 29.046875 7.808594 31.847656 L 9.523438 30.816406 C 8.007813 28.285156 7 25.261719 7 22 C 7 18.710938 7.871094 15.851563 9.515625 13.191406 Z M 42.183594 12.140625 L 40.484375 13.191406 C 42.128906 15.851563 43 18.710938 43 22 C 43 25.261719 41.992188 28.285156 40.472656 30.816406 L 42.191406 31.847656 C 43.871094 29.046875 45 25.671875 45 22 C 45 18.355469 44.003906 15.082031 42.183594 12.140625 Z M 20.421875 41 C 21.199219 42.761719 22.953125 44 25 44 C 27.046875 44 28.800781 42.761719 29.578125 41 Z"></path> </svg>`,
        items: [],
      },
      {
        title: t("onboarding.title"),
        path: `/admin/onboarding`,
        icon: SvgIcon.ONBOARDING,
      },
      {
        title: t("featureFlags.title"),
        path: `/admin/feature-flags`,
        icon: SvgIcon.FEATURE_FLAGS,
      },
      {
        title: t("models.portal.plural"),
        path: `/admin/portals`,
        icon: SvgIcon.PORTALS,
      },
    ],
  },
  {
    title: t("segments.market"),
    path: "",
    items: [
      {
        title: t("pages.title"),
        path: `/admin/pages`,
        icon: SvgIcon.PAGES,
      },
      {
        title: t("blog.title"),
        path: `/admin/blog`,
        icon: SvgIcon.BLOG,
      },
      {
        title: t("crm.title"),
        path: `/admin/crm`,
        icon: SvgIcon.CLIENTS,
      },
      {
        title: t("emailMarketing.title"),
        path: `/admin/email-marketing`,
        icon: SvgIcon.EMAILS,
      },
      {
        title: t("affiliates.title"),
        path: `/admin/affiliates`,
        icon: SvgIcon.AFFILIATES_AND_REFERRALS,
      },
      {
        title: t("knowledgeBase.title"),
        path: `/admin/knowledge-base`,
        icon: SvgIcon.KNOWLEDGE_BASE,
      },
    ],
  },
  {
    title: t("segments.build"),
    path: "",
    items: [
      {
        title: t("models.entity.plural"),
        path: `/admin/entities`,
        icon: SvgIcon.ENTITIES,
        permission: "admin.entities.view",
      },
      {
        title: t("workflows.title"),
        path: `/admin/workflow-engine`,
        icon: SvgIcon.WORKFLOWS,
        // permission: "admin.workflows.view",
      },
      {
        title: t("prompts.builder.title"),
        path: `/admin/prompts`,
        icon: SvgIcon.PROMPT_BUILDER,
        // permission: "admin.prompts.view",
      },
      {
        title: "API",
        path: "/admin/api",
        icon: SvgIcon.KEYS,
        permission: "admin.apiKeys.view",
      },
      {
        title: t("models.event.plural"),
        path: "/admin/events",
        permission: "admin.events.view",
        icon: SvgIcon.EVENTS,
      },
      {
        title: "Metrics",
        path: "/admin/metrics",
        icon: SvgIcon.METRICS,
      },
      {
        title: "Playground",
        path: "/admin/playground",
        icon: <ExperimentIconFilled className="h-5 w-5 text-white" />,
        permission: "admin.events.view",
      },
    ],
  },
  {
    title: t(""),
    path: "",
    items: [
      {
        title: t("app.sidebar.settings"),
        icon: SvgIcon.SETTINGS,
        path: `/admin/settings`,
        isCollapsible: false,
        items: [
          { title: t("settings.admin.profile.title"), path: `/admin/settings/profile` },
          { title: t("settings.admin.general.title"), path: `/admin/settings/general` },
          { title: t("settings.admin.seo.title"), path: `/admin/settings/seo` },
          { title: t("settings.admin.authentication.title"), path: `/admin/settings/authentication` },
          { title: t("settings.admin.analytics.title"), path: `/admin/settings/analytics` },
          { title: t("settings.admin.pricing.title"), path: `/admin/settings/pricing` },
          { title: t("settings.admin.transactionalEmails.title"), path: `/admin/settings/transactional-emails` },
          { title: t("settings.admin.internationalization.title"), path: `/admin/settings/internationalization` },
          { title: t("settings.admin.cookies.title"), path: `/admin/settings/cookies` },
          { title: t("settings.admin.cache.title"), path: `/admin/settings/cache` },
        ],
      },
      {
        title: t("admin.switchToApp"),
        path: "/app",
        icon: SvgIcon.APP,
        exact: true,
      },
    ],
  },
];
