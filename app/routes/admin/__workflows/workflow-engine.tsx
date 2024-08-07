import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowEngineApi } from "~/modules/workflowEngine/routes/workflow-engine.api.server";
import WorkflowEngineView from "~/modules/workflowEngine/routes/workflow-engine.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowEngineApi.loader(args);
// export const action = (args: ActionFunctionArgs) => WorkflowEngineApi.action(args);

export default () => <WorkflowEngineView />;

export function ErrorBoundary() {
  return <ServerError />;
}
