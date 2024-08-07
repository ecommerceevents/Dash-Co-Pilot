import { SideBarItem } from "./SidebarItem";
import { PageBlockTypes } from "~/modules/pageBlocks/dtos/PageBlockDto";

export const ComponentsSidebar = (): SideBarItem[] => {
  const pageBlockItems: SideBarItem[] = [];
  PageBlockTypes.forEach((block) => {
    const tabItem: SideBarItem = {
      title: block.title,
      path: `/components/marketing/${block.type}`,
      exact: true,
    };
    pageBlockItems.push(tabItem);
  });
  return [
    {
      title: "",
      path: "/components",
      exact: true,
      items: [
        {
          title: "Introduction",
          path: "/components",
          exact: true,
        },
        {
          title: "Theme",
          path: "/components/theme",
        },
      ],
    },
    {
      title: "Application",
      path: "",
      items: [
        {
          title: "Button",
          path: "/components/button",
        },
        {
          title: "Input",
          path: "/components/input",
        },
        {
          title: "Select",
          path: "/components/select",
        },
        {
          title: "Radio",
          path: "/components/radio",
        },
        {
          title: "Dropdown",
          path: "/components/dropdown",
        },
        {
          title: "Checkbox",
          path: "/components/checkbox",
        },
        {
          title: "Combobox",
          path: "/components/combobox",
        },
        {
          title: "App Layout",
          path: "/components/app-layout",
        },
        {
          title: "Alert",
          path: "/components/alert",
        },
        {
          title: "Toast",
          path: "/components/toast",
        },
      ],
    },
    {
      title: "Pages",
      path: "",
      items: [
        {
          title: "Landing Page",
          path: "/components/pages/landing",
        },
        {
          title: "Pricing",
          path: "/components/pages/pricing",
        },
        {
          title: "Blog",
          path: "/components/pages/blog",
        },
        {
          title: "Contact",
          path: "/components/pages/contact",
        },
        {
          title: "Newsletter",
          path: "/components/pages/newsletter",
        },
        {
          title: "Terms and Conditions",
          path: "/components/pages/terms-and-conditions",
        },
        {
          title: "Privacy Policy",
          path: "/components/pages/privacy-policy",
        },
        {
          title: "Sign In",
          path: "/components/pages/login",
        },
        {
          title: "Sign Up",
          path: "/components/pages/register",
        },
        {
          title: "Forgot Password",
          path: "/components/pages/forgot-password",
        },
        {
          title: "Reset Password",
          path: "/components/pages/reset",
        },
        {
          title: "Verify Email",
          path: "/components/pages/verify",
        },
        {
          title: "404",
          path: "/components/pages/404",
        },
        {
          title: "401",
          path: "/components/pages/401",
        },
      ],
    },
    {
      title: "Page Blocks",
      path: "",
      items: [
        {
          title: "Introduction",
          path: "/components/marketing",
          exact: true,
        },
        ...pageBlockItems,
      ],
    },
  ];
};
