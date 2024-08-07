import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { adminGetAllTenants, TenantWithDetails } from "~/utils/db/tenants.db.server";
import { useTranslation } from "react-i18next";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  title: string;
  tenants: TenantWithDetails[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  const tenants = await adminGetAllTenants();

  const data: LoaderData = {
    title: `${t("models.permission.userRoles")} | ${process.env.APP_NAME}`,
    tenants,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminRolesAndPermissionsAccountUsersRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.tenants) {
      return [];
    }
    return data.tenants.filter(
      (f) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.users.find(
          (x) =>
            x.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <TableSimple
        items={filteredItems()}
        headers={[
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => (
              <div className="max-w-sm truncate">
                <div className="flex items-center space-x-1 truncate font-medium text-gray-800">{i.name}</div>

                <div className="text-xs text-gray-500">
                  <span>/{i.slug}</span>
                </div>
              </div>
            ),
          },
          {
            name: "types",
            title: t("shared.types"),
            value: (i) => (i.types.length === 0 ? <span className="text-gray-600">{t("shared.default")}</span> : i.types.map((f) => f.title).join(", ")),
          },
          {
            name: "users",
            title: t("models.user.plural"),
            className: "max-w-xs truncate",
            value: (i) => i.users.map((f) => f.user.email).join(", "),
            href: (i) => `/admin/accounts/users?tenantId=${i.id}`,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => i.createdAt,
            formattedValue: (item) => (
              <div className="flex flex-col">
                <div>{DateUtils.dateYMD(item.createdAt)}</div>
                <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
              </div>
            ),
          },
        ]}
        actions={[
          {
            title: t("shared.setUserRoles"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
      />
    </div>
  );
}
