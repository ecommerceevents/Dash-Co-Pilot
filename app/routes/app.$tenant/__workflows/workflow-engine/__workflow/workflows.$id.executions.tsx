import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsIdExecutionsApi } from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.api.server";
import WorkflowsIdExecutionsView from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.view";
import "reactflow/dist/style.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsIdExecutionsApi.loader(args);
// export const action = (args: ActionFunctionArgs) => WorkflowsIdExecutionsApi.action(args);

export default () => <WorkflowsIdExecutionsView />;

export function ErrorBoundary() {
  return <ServerError />;
}
