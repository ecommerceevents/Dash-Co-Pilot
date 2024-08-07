import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsDangerApi } from "~/modules/workflowEngine/routes/workflow-engine/danger.api.server";
import WorkflowsDangerView from "~/modules/workflowEngine/routes/workflow-engine/danger.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsDangerApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsDangerApi.action(args);

export default () => <WorkflowsDangerView />;

export function ErrorBoundary() {
  return <ServerError />;
}
