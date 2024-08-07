import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { WorkflowsCredentialsNewApi } from "~/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.api.server";
import WorkflowsCredentialsNewView from "~/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.view";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => WorkflowsCredentialsNewApi.loader(args);
export const action = (args: ActionFunctionArgs) => WorkflowsCredentialsNewApi.action(args);

export default () => <WorkflowsCredentialsNewView />;

export function ErrorBoundary() {
  return <ServerError />;
}
