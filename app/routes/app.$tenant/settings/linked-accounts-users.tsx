import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useTranslation } from "react-i18next";
import { TenantUserWithDetails } from "~/utils/db/tenants.db.server";
import { LinkedAccountsApi } from "~/utils/api/.server/LinkedAccountsApi";
import UserBadge from "~/components/core/users/UserBadge";
import TenantBadge from "~/components/core/tenants/TenantBadge";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  title: string;
  items: TenantUserWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.linkedAccounts.view", tenantId);
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.app.features.linkedAccounts) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings"));
  }

  const items = await LinkedAccountsApi.getAllUsers(tenantId);
  const data: LoaderData = {
    title: `${t("models.user.plural")} | ${t("models.linkedAccount.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function LinkedAccountsRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (i) =>
        i.user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        i.user.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
        i.user.lastName.toLowerCase().includes(searchInput.toLowerCase()) ||
        i.tenant.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-2 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="space-y-2">
        <InputSearch value={searchInput} setValue={setSearchInput} />
        <TableSimple
          items={filteredItems()}
          headers={[
            {
              name: "tenant",
              title: t("models.tenant.object"),
              value: (i) => <TenantBadge item={i.tenant} showCurrent={true} />,
            },
            {
              name: "user",
              title: t("models.user.object"),
              value: (i) => <UserBadge item={i.user} showCurrent={true} />,
              className: "w-full",
            },
          ]}
        />
      </div>
    </div>
  );
}
