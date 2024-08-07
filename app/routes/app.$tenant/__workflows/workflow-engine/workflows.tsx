import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsIndexApi } from "~/modules/workflowEngine/routes/workflow-engine/workflows.index.api.server";
import WorkflowsIndexView from "~/modules/workflowEngine/routes/workflow-engine/workflows.index.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsIndexApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsIndexApi.action(args);

export default () => <WorkflowsIndexView />;

export function ErrorBoundary() {
  return <ServerError />;
}
