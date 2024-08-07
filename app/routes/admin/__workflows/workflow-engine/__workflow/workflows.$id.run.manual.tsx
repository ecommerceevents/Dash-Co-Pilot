import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsIdRunManualApi } from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.manual.api.server";
import WorkflowsIdRunManualView from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.manual.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsIdRunManualApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsIdRunManualApi.action(args);

export default () => <WorkflowsIdRunManualView />;

export function ErrorBoundary() {
  return <ServerError />;
}
