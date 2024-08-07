import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import PageMetaTagsRouteIndex from "~/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { PageMetaTags_Index } from "~/modules/pageBlocks/routes/pages/PageMetaTags_Index";

export const loader = (args: LoaderFunctionArgs) => PageMetaTags_Index.loader(args);
export const action: ActionFunction = (args) => PageMetaTags_Index.action(args);

export default () => (
  <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
    <PageMetaTagsRouteIndex />
  </div>
);
