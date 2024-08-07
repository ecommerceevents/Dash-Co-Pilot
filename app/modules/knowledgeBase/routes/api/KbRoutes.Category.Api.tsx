import { LoaderFunctionArgs, json } from "@remix-run/node";
import { redirect } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { KbCategoryDto } from "../../dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "../../service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import { KbSearchResultDto } from "../../dtos/KbSearchResultDto";

export namespace KbRoutesCategoryApi {
  export type LoaderData = {
    metatags?: MetaTagsDto;
    kb: KnowledgeBaseDto;
    search: KbSearchResultDto | undefined;
    item: KbCategoryDto | null;
    language: string;
    allCategories: KbCategoryDto[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs, { kbSlug }: { kbSlug?: string } = {}) => {
    const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
    const language = params.lang ?? kb.defaultLanguage;

    const item = await KnowledgeBaseService.getCategory({
      kb,
      category: params.category ?? "",
      language,
      params,
      request,
    });
    if (!item) {
      return redirect(KnowledgeBaseUtils.getKbUrl({ kb, params }));
    }
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.toString();
    const data: LoaderData = {
      metatags: item?.metatags,
      kb,
      search: await KnowledgeBaseService.search({ query, kb, params, request }),
      item,
      allCategories: await KnowledgeBaseService.getCategories({
        kb,
        params,
        request,
      }),
      language,
    };
    return json(data);
  };
}
