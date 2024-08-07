import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { BlogRoutesNewApi } from "~/modules/blog/routes/api/BlogRoutes.New.Api";
import BlogNewView from "~/modules/blog/routes/views/BlogRoutes.New.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => BlogRoutesNewApi.loader(args);
export const action = (args: ActionFunctionArgs) => BlogRoutesNewApi.action(args);

export default () => <BlogNewView />;

export function ErrorBoundary() {
  return <ServerError />;
}
