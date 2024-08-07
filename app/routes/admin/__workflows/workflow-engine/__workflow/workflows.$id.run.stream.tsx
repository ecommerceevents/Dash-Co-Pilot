import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsIdRunStreamApi } from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.api.server";
import WorkflowsIdRunStreamView from "~/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsIdRunStreamApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsIdRunStreamApi.action(args);

export default () => <WorkflowsIdRunStreamView />;

export function ErrorBoundary() {
  return <ServerError />;
}
