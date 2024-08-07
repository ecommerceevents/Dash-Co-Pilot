import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity, moduleLocation }: { entity: EntityWithDetails; moduleLocation: string }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { MetaFunction, LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { ${capitalized}RoutesActivityApi } from "~/${moduleLocation}/routes/api/${capitalized}Routes.Activity.Api";
import ${capitalized}RoutesActivityView from "~/${moduleLocation}/routes/views/${capitalized}Routes.Activity.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);
export const loader = (args: LoaderFunctionArgs) => ${capitalized}RoutesActivityApi.loader(args);
export const action: ActionFunction = (args) => ${capitalized}RoutesActivityApi.action(args);

export default () => <${capitalized}RoutesActivityView />;

export function ErrorBoundary() {
  return <ServerError />;
}
`;
}

export default {
  generate,
};
