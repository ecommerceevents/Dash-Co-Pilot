import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsVariablesNewApi } from "~/modules/workflowEngine/routes/workflow-engine/variables/variables.new.api.server";
import WorkflowsVariablesNewView from "~/modules/workflowEngine/routes/workflow-engine/variables/variables.new.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsVariablesNewApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsVariablesNewApi.action(args);

export default () => <WorkflowsVariablesNewView />;

export function ErrorBoundary() {
  return <ServerError />;
}
