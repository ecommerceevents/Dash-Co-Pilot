import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";

type LoaderData = {
  metatags: MetaTagsDto;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    metatags: [
      { title: `API Documentation | ${process.env.APP_NAME}` },
      // { name: "keywords", content: category.keywords },
      { property: "og:title", content: `API Documentation | ${process.env.APP_NAME}` },
      ...getLinkTags(request),
    ],
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function Docs() {
  return <iframe src="/swagger.html" title="API Documentation" style={{ width: "100%", height: "100vh", border: "none" }} />;
}
