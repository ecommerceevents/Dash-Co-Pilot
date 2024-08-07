import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { BlogRoutesEditApi } from "~/modules/blog/routes/api/BlogRoutes.Edit.Api";
import BlogEditView from "~/modules/blog/routes/views/BlogRoutes.Edit.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => BlogRoutesEditApi.loader(args);
export const action = (args: ActionFunctionArgs) => BlogRoutesEditApi.action(args);

export default () => <BlogEditView />;

export function ErrorBoundary() {
  return <ServerError />;
}
