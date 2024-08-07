import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsTemplatesApi } from "~/modules/workflowEngine/routes/workflow-engine/templates.api.server";
import WorkflowsTemplatesView from "~/modules/workflowEngine/routes/workflow-engine/templates.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsTemplatesApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsTemplatesApi.action(args);

export default () => <WorkflowsTemplatesView />;

export function ErrorBoundary() {
  return <ServerError />;
}
