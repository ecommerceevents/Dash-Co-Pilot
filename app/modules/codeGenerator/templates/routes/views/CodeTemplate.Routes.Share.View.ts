import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { useTypedLoaderData } from "remix-typedjson";
import RowSettingsPermissions from "~/components/entities/rows/RowSettingsPermissions";
import { ${capitalized}RoutesShareApi } from "../api/${capitalized}Routes.Share.Api";

export default function ${capitalized}RoutesShareView() {
  const data = useTypedLoaderData<${capitalized}RoutesShareApi.LoaderData>();
  return <RowSettingsPermissions item={data.item.row} items={data.item.row.permissions} tenants={data.tenants} users={data.users} />;
}
`;
}

export default {
  generate,
};
