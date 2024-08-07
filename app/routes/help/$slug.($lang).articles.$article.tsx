import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { KbRoutesArticleApi } from "~/modules/knowledgeBase/routes/api/KbRoutes.Article.Api";
import KbRoutesArticleView from "~/modules/knowledgeBase/routes/views/KbRoutes.Article.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => KbRoutesArticleApi.loader(args);
export const action = (args: ActionFunctionArgs) => KbRoutesArticleApi.action(args);

export default () => <KbRoutesArticleView />;

export function ErrorBoundary() {
  return <ServerError />;
}
