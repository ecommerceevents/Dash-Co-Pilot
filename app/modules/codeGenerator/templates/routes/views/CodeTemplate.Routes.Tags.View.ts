import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { useTypedLoaderData } from "remix-typedjson";
import RowSettingsTags from "~/components/entities/rows/RowSettingsTags";
import { ${capitalized}RoutesTagsApi } from "../api/${capitalized}Routes.Tags.Api";

export default function ${capitalized}RoutesTagsView() {
  const data = useTypedLoaderData<${capitalized}RoutesTagsApi.LoaderData>();
  return <RowSettingsTags item={data.item.row} tags={data.tags} />;
}
`;
}

export default {
  generate,
};
