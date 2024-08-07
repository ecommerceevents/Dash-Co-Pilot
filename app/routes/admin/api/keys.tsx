import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyWithDetails, getAllApiKeys } from "~/utils/db/apiKeys.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
};
export const loader = async () => {
  const apiKeys = await getAllApiKeys();
  const data: LoaderData = {
    apiKeys,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const adminData = useAdminData();
  return (
    <>
      <EditPageLayout title={t("models.apiKey.plural")}>
        <ApiKeysTable
          canCreate={getUserHasPermission(adminData, "admin.apiKeys.create")}
          entities={adminData.entities}
          items={data.apiKeys}
          withTenant={true}
        />
        <Outlet />
      </EditPageLayout>
    </>
  );
}
