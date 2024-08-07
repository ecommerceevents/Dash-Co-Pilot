import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsIdRunApiApi } from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.api.server";
import WorkflowsIdRunApiApiView from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.api.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsIdRunApiApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsIdRunApiApi.action(args);

export default () => <WorkflowsIdRunApiApiView />;

export function ErrorBoundary() {
  return <ServerError />;
}
