import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowEngineIndexApi } from "~/modules/workflowEngine/routes/workflow-engine/index.api.server";
import WorkflowEngineIndexView from "~/modules/workflowEngine/routes/workflow-engine/index.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowEngineIndexApi.loader(args);
// export const action = (args: ActionFunctionArgs) => WorkflowEngineIndexApi.action(args);

export default () => <WorkflowEngineIndexView />;

export function ErrorBoundary() {
  return <ServerError />;
}
