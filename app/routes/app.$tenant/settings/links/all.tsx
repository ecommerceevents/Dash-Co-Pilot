import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { getLinkedAccounts, LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { useState } from "react";
import { getTranslations } from "~/locale/i18next.server";
import LinkedAccountsTable from "~/components/app/linkedAccounts/LinkedAccountsTable";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import UrlUtils from "~/utils/app/UrlUtils";
import InputSearch from "~/components/ui/input/InputSearch";
import { useTypedLoaderData } from "remix-typedjson";

type LoaderData = {
  title: string;
  items: LinkedAccountWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);

  const items = await getLinkedAccounts(tenantId, LinkedAccountStatus.LINKED);
  const data: LoaderData = {
    title: `${t("models.linkedAccount.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AllLinksRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        f.clientTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.providerTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  return (
    <div>
      <div>
        <div className="space-y-2">
          <InputSearch
            value={searchInput}
            setValue={setSearchInput}
            onNew={() => navigate(UrlUtils.currentTenantUrl(params, "settings/linked-accounts/new"))}
          />
          <LinkedAccountsTable items={filteredItems()} canDelete={true} />
        </div>
      </div>
    </div>
  );
}
