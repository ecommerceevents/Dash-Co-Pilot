import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { KbRoutesArticleApi } from "~/modules/knowledgeBase/routes/api/KbRoutes.Article.Api";
import KbRoutesArticleView from "~/modules/knowledgeBase/routes/views/KbRoutes.Article.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];
export const loader = (args: LoaderFunctionArgs) => KbRoutesArticleApi.loader(args, { kbSlug: "docs" });
export const action = (args: ActionFunctionArgs) => KbRoutesArticleApi.action(args, { kbSlug: "docs" });

export default () => <KbRoutesArticleView />;

export function ErrorBoundary() {
  return <ServerError />;
}
