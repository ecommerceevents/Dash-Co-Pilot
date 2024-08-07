import PageBlockUtils from "~/modules/pageBlocks/components/blocks/PageBlockUtils";
import { SideBarItem } from "./SidebarItem";
export const DocsSidebar = (): SideBarItem[] => {
  const pageBlockItems: SideBarItem[] = [];
  Object.keys(PageBlockUtils.defaultBlocks).forEach((block) => {
    const tabItem: SideBarItem = {
      title: block.length > 0 ? block[0].toUpperCase() + block.slice(1) : block,
      path: `/docs/page-blocks/${block}`,
      exact: true,
    };
    pageBlockItems.push(tabItem);
  });
  return [
    {
      title: "",
      path: "/docs",
      exact: true,
      items: [
        {
          title: "Introduction",
          path: "/docs",

          exact: true,
        },
      ],
    },
    {
      title: "Getting Started",
      path: "",

      items: [
        {
          title: "Stack",
          path: "/docs/stack",
        },
        // {
        //   title: "Code structure",
        //   path: "/docs/code-structure",
        //
        // },
        {
          title: "Roadmap",
          path: "/docs/roadmap",
        },
        {
          title: "Changelog",
          path: "/changelog",
        },
        {
          title: "License",
          path: "/docs/license",
        },
        {
          title: "Contributing",
          path: "/docs/contributing",
        },
        {
          title: "Community",
          path: "/docs/community",
        },
      ],
    },
    {
      title: "Product",
      path: "",
      items: [
        {
          title: "Features",
          path: "/docs/features",

          items: [
            {
              title: "All features",
              path: "/docs/features",
              exact: true,
            },
            {
              title: "Admin Portal",
              path: "/docs/features/admin-portal",
            },
            {
              title: "App Portal",
              path: "/docs/features/app-portal",
            },
            {
              title: "Marketing",
              path: "/docs/features/marketing",
            },
            {
              title: "Authentication",
              path: "/docs/features/authentication",
            },
            {
              title: "Subscriptions",
              path: "/docs/features/subscriptions",
            },
            {
              title: "Blogging",
              path: "/docs/features/blogging",
            },
            {
              title: "Entity Builder",
              path: "/docs/features/entity-builder",
            },
            {
              title: "API",
              path: "/docs/features/api",
            },
            {
              title: "Webhooks",
              path: "/docs/features/webhooks",
            },
            {
              title: "Audit Trails",
              path: "/docs/features/audit-trails",
            },
            {
              title: "Roles & Permissions",
              path: "/docs/features/roles-and-permissions",
            },
            {
              title: "Events and Webhooks",
              path: "/docs/features/events-and-webhooks",
            },
            {
              title: "Analytics 🚀",
              path: "/docs/features/analytics",
            },
            {
              title: "Email Marketing 🚀",
              path: "/docs/features/email-marketing",
            },
            {
              title: "Notifications",
              path: "/docs/features/notifications",
            },
            {
              title: "Onboarding 🚀",
              path: "/docs/features/onboarding",
            },
            {
              title: "Help Desk 🚀 🚧",
              path: "/docs/features/help-desk",
            },
            {
              title: "Enterprise SSO 🚀 🚧",
              path: "/docs/features/enterprise-sso",
            },
            {
              title: "Knowledge Base 🚀 🚧",
              path: "/docs/features/knowledge-base",
            },
          ],
        },
        {
          title: "Page Blocks",
          path: "",
          items: [
            {
              title: "Introduction",
              path: "/docs/page-blocks",
              exact: true,
            },
            {
              title: "Editor",
              path: "/docs/page-blocks/editor",
              exact: true,
            },
            ...pageBlockItems,
          ],
        },
        {
          title: "Components",
          path: "/docs/components",

          items: [
            {
              title: "Buttons",
              path: "/docs/components/buttons",
            },
            {
              title: "Badges",
              path: "/docs/components/badges",
            },
            {
              title: "Banners",
              path: "/docs/components/banners",
            },
            {
              title: "Breadcrumbs",
              path: "/docs/components/breadcrumbs",
            },
            {
              title: "Command Palette",
              path: "/docs/components/command-palette",
            },
            {
              title: "Dropdowns",
              path: "/docs/components/dropdowns",
            },
            {
              title: "Empty States",
              path: "/docs/components/empty-states",
            },
            {
              title: "Forms",
              path: "/docs/components/forms",
            },
            // {
            //   title: "Layouts",
            //   path: "/docs/components/layouts",
            //
            // },
            {
              title: "Loaders",
              path: "/docs/components/loaders",
            },
            {
              title: "Modals",
              path: "/docs/components/modals",
            },
            {
              title: "PDF Viewer",
              path: "/docs/components/pdf-viewer",
            },
            {
              title: "Tables",
              path: "/docs/components/tables",
            },
            {
              title: "Tabs",
              path: "/docs/components/tabs",
            },
            {
              title: "Tooltips",
              path: "/docs/components/tooltips",
            },
            {
              title: "Uploaders",
              path: "/docs/components/uploaders",
            },
            {
              title: "Logo and Icon",
              path: "/docs/components/logo-and-icon",
            },
            // {
            //   title: "Inputs",
            //   path: "/docs/components/inputs",
            //
            //   items: [
            {
              title: "Input - Text",
              path: "/docs/components/inputs/text",
            },
            {
              title: "Input - Number",
              path: "/docs/components/inputs/number",
            },
            {
              title: "Input - Date",
              path: "/docs/components/inputs/date",
            },
            {
              title: "Input - Selector",
              path: "/docs/components/inputs/selector",
            },
            {
              title: "Input - Checkbox",
              path: "/docs/components/inputs/checkbox",
            },
            {
              title: "Input - RadioGroup",
              path: "/docs/components/inputs/radio-group",
            },
            // ],
            // },
          ],
        },
      ],
    },
    {
      title: "Learning Center",
      path: "/docs/learning-center",
      items: [
        { title: "Learning Center", path: "/docs/learning-center", exact: true },
        {
          title: "Quick Start",
          path: "/docs/learning-center/tutorials/quick-start",
          exact: true,
        },
        {
          title: "Quick Guides",
          path: "",
          items: [
            {
              title: "SaasRock releases",
              path: "/docs/learning-center/guides/upgrade/saasrock-releases",
            },
            {
              title: "Customize Theme",
              path: "/docs/learning-center/guides/branding/theme",
            },
            {
              title: "Customize Logo & Icon",
              path: "/docs/learning-center/guides/branding/logo-and-icon",
            },
            {
              title: "Generate Favicon",
              path: "/docs/learning-center/guides/branding/favicon",
            },
            {
              title: "Customize Landing page",
              path: "/docs/learning-center/guides/branding/landing",
            },
            {
              title: "Support a Language (i18n)",
              path: "/docs/learning-center/guides/localization/support-a-language",
            },
            {
              title: "Create a Blog Post",
              path: "/docs/learning-center/guides/blogging/publish-a-blog-post",
            },
            {
              title: "Create a Custom Entity",
              path: "/docs/learning-center/guides/entities/create-a-custom-entity",
            },
            {
              title: "Use the Custom Entity API",
              path: "/docs/learning-center/guides/entities/use-the-custom-entity-api",
            },
            {
              title: "Shared Entity Rows",
              path: "/docs/learning-center/guides/entities/shared-entity-rows",
            },
            {
              title: "Plan Entity Limits",
              path: "/docs/learning-center/guides/entities/plan-entity-limits",
            },
            {
              title: "Extend Existing Models",
              path: "/docs/learning-center/guides/entities/extend-existing-models",
            },
            {
              title: "Single Sign On",
              path: "/docs/learning-center/guides/sso/",
            },
            {
              title: "Vercel",
              path: "/docs/learning-center/guides/hosting/vercel",
            },
            {
              title: "Supabase",
              path: "/docs/learning-center/guides/database/supabase",
            },
          ],
        },
      ],
    },
    {
      title: "Core Models",
      path: "",
      items: [
        {
          title: "Prisma Schema",
          path: "/docs/core-models",
          exact: true,
        },
        {
          title: "Account",
          path: "/docs/core-models/account",
          items: [
            // {
            //   title: "Diagram",
            //   path: "/docs/core-models/account/diagram",
            //
            // },
            {
              title: "User",
              path: "/docs/core-models/account/user",
            },
            {
              title: "Tenant",
              path: "/docs/core-models/account/tenant",

              exact: true,
            },
            {
              title: "Tenant User",
              path: "/docs/core-models/account/tenant-user",
            },
            {
              title: "Linked Account",
              path: "/docs/core-models/account/linked-account",
            },
            {
              title: "API Key",
              path: "/docs/core-models/account/api-key",
            },
          ],
        },
        {
          title: "Subscription",
          path: "/docs/core-models/subscription",

          items: [
            {
              title: "Product",
              path: "/docs/core-models/subscription/product",
            },
            {
              title: "Price",
              path: "/docs/core-models/subscription/price",
            },
            {
              title: "Feature",
              path: "/docs/core-models/subscription/feature",
            },
            {
              title: "Tenant Subscription",
              path: "/docs/core-models/subscription/tenant-subscription",
            },
          ],
        },
        // {
        //   title: "Blog",
        //   path: "/docs/core-models/blog",
        //
        //   items: [
        //     {
        //       title: "Author",
        //       path: "/docs/core-models/blog/author",
        //
        //     },
        //     {
        //       title: "Category",
        //       path: "/docs/core-models/blog/category",
        //
        //     },
        //     {
        //       title: "Tag",
        //       path: "/docs/core-models/blog/tag",
        //
        //     },
        //     {
        //       title: "Post",
        //       path: "/docs/core-models/blog/post",
        //
        //     },
        //   ],
        // },
        {
          title: "Custom Entity",
          path: "/docs/core-models/custom-entity",

          items: [
            {
              title: "Entity",
              path: "/docs/core-models/custom-entity/entity",
            },
            {
              title: "Property",
              path: "/docs/core-models/custom-entity/property",
            },
            {
              title: "Row",
              path: "/docs/core-models/custom-entity/row",

              exact: true,
            },
            {
              title: "Row Value",
              path: "/docs/core-models/custom-entity/row-value",
            },
            {
              title: "Webhook",
              path: "/docs/core-models/custom-entity/webhook",
            },
          ],
        },
      ],
    },
  ];
};
