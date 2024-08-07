import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity, moduleLocation }: { entity: EntityWithDetails; moduleLocation: string }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { MetaFunction, LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { ${capitalized}RoutesTagsApi } from "~/${moduleLocation}/routes/api/${capitalized}Routes.Tags.Api";
import ${capitalized}RoutesTagsView from "~/${moduleLocation}/routes/views/${capitalized}Routes.Tags.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);
export const loader = (args: LoaderFunctionArgs) => ${capitalized}RoutesTagsApi.loader(args);
export const action: ActionFunction = (args) => ${capitalized}RoutesTagsApi.action(args);

export default () => <${capitalized}RoutesTagsView />;

export function ErrorBoundary() {
  return <ServerError />;
}
`;
}

export default {
  generate,
};
