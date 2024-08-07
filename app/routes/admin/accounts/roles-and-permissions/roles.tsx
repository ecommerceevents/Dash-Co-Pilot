import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import RolesTable from "~/components/core/roles/RolesTable";
import { getAllRolesWithUsers, RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import { getAllPermissionsIdsAndNames } from "~/utils/db/permissions/permissions.db.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTypedLoaderData } from "remix-typedjson";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsers[];
  filterableProperties: FilterablePropertyDto[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.roles-and-permissions.roles");
  let { t } = await time(getTranslations(request), "getTranslations");

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "permissionId",
      title: "models.permission.object",
      manual: true,
      options: (await time(getAllPermissionsIdsAndNames(), "getAllPermissionsIdsAndNames")).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await time(getAllRolesWithUsers(undefined, filters), "getAllRolesWithUsers");

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
  };
  return json(data, { headers: getServerTimingHeader() });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminRolesRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const adminData = useAdminData();

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="flex-grow">
          <InputSearchWithURL />
        </div>
        <InputFilters filters={data.filterableProperties} />
        <ButtonPrimary to="new">
          <div className="sm:text-sm">+</div>
        </ButtonPrimary>
      </div>
      {/* <InputSearchWithURL onNewRoute={getUserHasPermission(adminData, "admin.roles.create") ? "new" : undefined} /> */}
      <RolesTable items={data.items} canUpdate={getUserHasPermission(adminData, "admin.roles.update")} />
      <Outlet />
    </div>
  );
}
