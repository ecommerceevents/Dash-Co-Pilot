import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import ServerError from "~/components/ui/errors/ServerError";
import RowsViewRoute from "~/modules/rows/components/RowsViewRoute";
import { Rows_List } from "~/modules/rows/routes/Rows_List.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
export { serverTimingHeaders as headers };

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => Rows_List.loader(args);
export const action: ActionFunction = (args) => Rows_List.action(args);

export default function () {
  const data = useTypedLoaderData<Rows_List.LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  return (
    <RowsViewRoute
      key={data.rowsData.entity.id}
      rowsData={data.rowsData}
      items={data.rowsData.items}
      routes={data.routes}
      saveCustomViews={true}
      permissions={{
        create: getUserHasPermission(appOrAdminData, getEntityPermission(data.rowsData.entity, "create")),
      }}
      currentSession={{
        user: appOrAdminData.user,
        isSuperAdmin: appOrAdminData.isSuperAdmin,
      }}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
