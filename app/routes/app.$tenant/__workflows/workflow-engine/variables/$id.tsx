import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsVariablesIdApi } from "~/modules/workflowEngine/routes/workflow-engine/variables/variables.$id.api.server";
import WorkflowsVariablesIdView from "~/modules/workflowEngine/routes/workflow-engine/variables/variables.$id.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsVariablesIdApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsVariablesIdApi.action(args);

export default () => <WorkflowsVariablesIdView />;

export function ErrorBoundary() {
  return <ServerError />;
}
