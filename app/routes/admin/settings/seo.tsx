import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import PageMetaTagsRouteIndex from "~/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { PageMetaTags_Index } from "~/modules/pageBlocks/routes/pages/PageMetaTags_Index";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export const loader = (args: LoaderFunctionArgs) => PageMetaTags_Index.loader(args);
export const action: ActionFunction = (args) => PageMetaTags_Index.action(args);

export default () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("pages.seo")}</h1>

        <PageMetaTagsRouteIndex />
      </div>
    </div>
  );
};
