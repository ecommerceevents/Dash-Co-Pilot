import { LoaderFunctionArgs, json } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { createKnowledgeBaseView } from "../../db/kbAnalytics.db.server";
import { KbArticleDto } from "../../dtos/KbArticleDto";
import { KbCategoryDto } from "../../dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "../../service/KnowledgeBaseService.server";
import { KbSearchResultDto } from "../../dtos/KbSearchResultDto";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import RedirectsService from "~/modules/redirects/RedirectsService";
import { getAnalyticsInfo } from "~/utils/analyticsCookie.server";
import { getUserInfo } from "~/utils/session.server";
import { getUser } from "~/utils/db/users.db.server";

export namespace KbRoutesIndexApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    kb: KnowledgeBaseDto;
    search: KbSearchResultDto | undefined;
    categories: KbCategoryDto[];
    featured: KbArticleDto[];
    isAdmin: boolean;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs, { kbSlug }: { kbSlug?: string } = {}) => {
    if (params.lang && !KnowledgeBaseUtils.supportedLanguages.find((f) => f.value === params.lang)) {
      RedirectsService.findAndRedirect({ request });
    }
    const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });

    const { userAnalyticsId } = await getAnalyticsInfo(request);
    const userInfo = await getUserInfo(request);

    await createKnowledgeBaseView({ userAnalyticsId, knowledgeBaseId: kb.id });
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.toString();
    const currentUser = await getUser(userInfo.userId);
    const data: LoaderData = {
      metatags: kb.metatags,
      kb,
      search: await KnowledgeBaseService.search({ query, kb, params, request }),
      categories: await KnowledgeBaseService.getCategories({
        kb,
        params,
        request,
      }),
      featured: await KnowledgeBaseService.getFeaturedArticles({
        kb,
        params,
        request,
      }),
      isAdmin: !!currentUser?.admin,
      // searchResult,
    };
    return json(data);
  };
}
