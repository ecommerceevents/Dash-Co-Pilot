import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import CreditsIcon from "~/components/ui/icons/CreditsIcon";
import CreditsIconFilled from "~/components/ui/icons/CreditsIconFilled";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import DocsIcon from "~/components/ui/icons/entities/DocsIcon";
import DocsIconFilled from "~/components/ui/icons/entities/DocsIconFilled";
import KeyIcon from "~/components/ui/icons/entities/KeyIcon";
import KeyIconFilled from "~/components/ui/icons/entities/KeyIconFilled";
import RestApiIcon from "~/components/ui/icons/entities/RestApiIcon";
import RestApiIconFilled from "~/components/ui/icons/entities/RestApiIconFilled";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import { CreditTypes } from "~/modules/usage/dtos/CreditType";

type LoaderData = {
  title: string;
};

export const loader = async (_: LoaderFunctionArgs) => {
  const data: LoaderData = {
    title: `API | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: "/admin/api",
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
          exact: true,
        },
        {
          name: t("models.apiCall.plural"),
          href: "/admin/api/logs",
          icon: <RestApiIcon className="h-5 w-5" />,
          iconSelected: <RestApiIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.apiKey.plural"),
          href: "/admin/api/keys",
          icon: <KeyIcon className="h-5 w-5" />,
          iconSelected: <KeyIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.credit.plural"),
          href: "/admin/api/credits",
          icon: <CreditsIcon className="h-5 w-5" />,
          iconSelected: <CreditsIconFilled className="h-5 w-5" />,
          hidden: CreditTypes.length === 0,
        },
        {
          name: "Docs",
          href: "/admin/api/docs",
          icon: <DocsIcon className="h-5 w-5" />,
          iconSelected: <DocsIconFilled className="h-5 w-5" />,
          bottom: true,
        },
      ]}
    >
      <IndexPageLayout>
        <Outlet />
      </IndexPageLayout>
    </SidebarIconsLayout>
  );
};
