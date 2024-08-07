import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import PageMetaTagsRouteIndex from "~/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { PageMetaTags_Index } from "~/modules/pageBlocks/routes/pages/PageMetaTags_Index";

export const loader = (args: LoaderFunctionArgs) => PageMetaTags_Index.loader(args);
export const action: ActionFunction = (args) => PageMetaTags_Index.action(args);

export default () => <PageMetaTagsRouteIndex />;
