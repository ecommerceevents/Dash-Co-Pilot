import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import RolesTable from "~/components/core/roles/RolesTable";
import { getAllRolesWithUsers, RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import { useAppData } from "~/utils/data/useAppData";
import { useTypedLoaderData } from "remix-typedjson";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsers[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  const items = await getAllRolesWithUsers("app");

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function RolesRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const appData = useAppData();

  return (
    <div>
      <RolesTable items={data.items} canUpdate={false} tenantId={appData.currentTenant.id} />
    </div>
  );
}
