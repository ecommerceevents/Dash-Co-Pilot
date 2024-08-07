import { LoaderFunctionArgs, json } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export namespace WorkflowEngineApi {
  type LoaderData = {
    metatags: MetaTagsDto;
  };

  export const loader = async (_: LoaderFunctionArgs) => {
    const data: LoaderData = {
      metatags: [{ title: `Workflows | ${process.env.APP_NAME}` }],
    };
    return json(data);
  };
}
