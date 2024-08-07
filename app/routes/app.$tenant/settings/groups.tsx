import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { getUserPermission } from "~/utils/helpers/.server/PermissionsService";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getAllGroups, getMyGroups, GroupWithDetails } from "~/utils/db/permissions/groups.db.server";
import { getUserInfo } from "~/utils/session.server";
import { useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import GroupsTable from "~/components/core/roles/GroupsTable";
import { useRootData } from "~/utils/data/useRootData";
import InfoBanner from "~/components/ui/banners/InfoBanner";

type LoaderData = {
  title: string;
  items: GroupWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);

  const { permission, userPermission } = await getUserPermission({
    userId: userInfo.userId,
    permissionName: "app.settings.groups.full",
    tenantId: tenantId,
  });
  let items: GroupWithDetails[];
  if (!permission || userPermission) {
    items = await getAllGroups(tenantId);
  } else {
    items = await getMyGroups(userInfo.userId, tenantId);
  }

  const data: LoaderData = {
    title: `${t("models.group.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function RolesRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const rootData = useRootData();

  return (
    <EditPageLayout>
      {rootData.featureFlags?.includes("row-groups") ? (
        <GroupsTable items={data.items} onNewRoute="new" />
      ) : (
        <InfoBanner title={"Feature not enabled"} text={"This feature is not enabled for your tenant. Please contact your administrator."} />
      )}
      <Outlet />
    </EditPageLayout>
  );
}
