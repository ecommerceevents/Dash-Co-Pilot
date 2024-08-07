import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsCredentialsApi } from "~/modules/workflowEngine/routes/workflow-engine/credentials.api.server";
import WorkflowsCredentialsView from "~/modules/workflowEngine/routes/workflow-engine/credentials.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsCredentialsApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsCredentialsApi.action(args);

export default () => <WorkflowsCredentialsView />;

export function ErrorBoundary() {
  return <ServerError />;
}
