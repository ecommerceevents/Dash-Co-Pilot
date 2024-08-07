import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import AddressBookIcon from "~/components/ui/icons/crm/AddressBookIcon";
import AddressBookIconFilled from "~/components/ui/icons/crm/AddressBookIconFilled";
import CompanyIcon from "~/components/ui/icons/crm/CompanyIcon";
import CompanyIconFilled from "~/components/ui/icons/crm/CompanyIconFilled";
import FormIcon from "~/components/ui/icons/crm/FormIcon";
import FormIconFilled from "~/components/ui/icons/crm/FormIconFilled";
import IncreaseIcon from "~/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "~/components/ui/icons/crm/IncreaseIconFilled";
import UsDollarCircled from "~/components/ui/icons/crm/UsDollarCircled";
import UsDollarCircledFilled from "~/components/ui/icons/crm/UsDollarCircledFilled";
import SidebarIconsLayout, { IconDto } from "~/components/ui/layouts/SidebarIconsLayout";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import CrmService from "~/modules/crm/services/CrmService";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    title: `CRM | ${process.env.APP_NAME}`,
  };
  const tenantId = await getTenantIdOrNull({ request, params });
  await CrmService.validate(tenantId);
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const [items, setItems] = useState<IconDto[]>([]);
  useEffect(() => {
    const items: IconDto[] = [
      {
        name: "Overview",
        href: params.tenant ? `/app/${params.tenant}/crm` : `/admin/crm`,
        exact: true,
        icon: <IncreaseIcon className="h-5 w-5" />,
        iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
      },
    ];
    ["opportunities", "companies", "contacts", "submissions"].forEach((slug) => {
      const entity = appOrAdminData.entities.find((x) => x.slug === slug);
      if (entity) {
        items.push({
          name: t(entity.titlePlural),
          href: params.tenant ? `/app/${params.tenant}/crm/${slug}` : `/admin/crm/${slug}`,
          icon: getIcons(entity.slug)?.icon,
          iconSelected: getIcons(entity.slug)?.iconSelected,
        });
      }
    });
    setItems(items);
  }, [appOrAdminData.entities, params.tenant, t]);

  function getIcons(entitySlug: string) {
    if (entitySlug === "opportunities") {
      return {
        icon: <UsDollarCircled className="h-5 w-5" />,
        iconSelected: <UsDollarCircledFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "companies") {
      return {
        icon: <CompanyIcon className="h-5 w-5" />,
        iconSelected: <CompanyIconFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "contacts") {
      return {
        icon: <AddressBookIcon className="h-5 w-5" />,
        iconSelected: <AddressBookIconFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "submissions") {
      return {
        icon: <FormIcon className="h-5 w-5" />,
        iconSelected: <FormIconFilled className="h-5 w-5" />,
      };
    }
  }
  return (
    <SidebarIconsLayout label={{ align: "right" }} items={items}>
      <Outlet />
    </SidebarIconsLayout>
  );
};

export function ErrorBoundary() {
  return <ServerError />;
}
