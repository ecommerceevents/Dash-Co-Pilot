import { Rows_Share } from "../routes/Rows_Share.server";
import RowSettingsPermissions from "~/components/entities/rows/RowSettingsPermissions";
import { useTypedLoaderData } from "remix-typedjson";

export default function RowShareRoute() {
  const data = useTypedLoaderData<Rows_Share.LoaderData>();
  return <RowSettingsPermissions item={data.rowData.item} items={data.rowData.item.permissions} tenants={data.tenants} users={data.users} withTitle={true} />;
}
