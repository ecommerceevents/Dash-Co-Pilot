import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { useTypedLoaderData } from "remix-typedjson";
import RowActivity from "~/components/entities/rows/RowActivity";
import { ${capitalized}RoutesActivityApi } from "../api/${capitalized}Routes.Activity.Api";

export default function ${capitalized}RoutesActivityView() {
  const data = useTypedLoaderData<${capitalized}RoutesActivityApi.LoaderData>();
  return <RowActivity items={data.logs} withTitle={false} hasActivity={true} hasComments={data.permissions.canComment} />;
}
`;
}

export default {
  generate,
};
