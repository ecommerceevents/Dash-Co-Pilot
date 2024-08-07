import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getUserInfo } from "~/utils/session.server";
import { createKnowledgeBaseArticleView, getArticleStateByUserAnalyticsId, voteArticle } from "../../db/kbAnalytics.db.server";
import { KbArticleDto } from "../../dtos/KbArticleDto";
import { KbCategoryDto } from "../../dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "../../service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import { KbSearchResultDto } from "../../dtos/KbSearchResultDto";
import { getUser } from "~/utils/db/users.db.server";
import { getAnalyticsInfo } from "~/utils/analyticsCookie.server";
import RedirectsService from "~/modules/redirects/RedirectsService";

export namespace KbRoutesArticleApi {
  export type LoaderData = {
    metatags?: MetaTagsDto;
    kb: KnowledgeBaseDto;
    search: KbSearchResultDto | undefined;
    item: {
      article: KbArticleDto;
      category: KbCategoryDto;
    } | null;
    userState: {
      hasThumbsUp: boolean;
      hasThumbsDown: boolean;
    };
    isAdmin: boolean;
    categories: KbCategoryDto[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs, { kbSlug }: { kbSlug?: string } = {}) => {
    RedirectsService.findAndRedirect({ request });
    const analyticsInfo = await getAnalyticsInfo(request);
    const userInfo = await getUserInfo(request);
    const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
    const item = await KnowledgeBaseService.getArticle({
      kb,
      slug: params.article ?? "",
      params,
      request,
    });
    if (!item) {
      return redirect(KnowledgeBaseUtils.getKbUrl({ kb, params }));
    }

    if (item?.article) {
      createKnowledgeBaseArticleView({ userAnalyticsId: analyticsInfo.userAnalyticsId, articleId: item.article.id });
    }
    let userState = await getArticleStateByUserAnalyticsId({
      userAnalyticsId: analyticsInfo.userAnalyticsId,
      articleId: item?.article.id ?? "",
    });
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.toString();
    const currentUser = await getUser(userInfo.userId);
    KnowledgeBaseUtils.fixDarkMode({ article: item.article });
    const data: LoaderData = {
      metatags: item?.article.metatags,
      kb,
      search: await KnowledgeBaseService.search({ query, kb, params, request }),
      item,
      userState,
      isAdmin: !!currentUser?.admin,
      categories: await KnowledgeBaseService.getCategories({
        kb,
        params,
        request,
      }),
    };
    return json(data);
  };

  export const action = async ({ request, params }: ActionFunctionArgs, { kbSlug }: { kbSlug?: string } = {}) => {
    const { userAnalyticsId } = await getAnalyticsInfo(request);
    const form = await request.formData();
    const action = form.get("action") as string;
    const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
    const item = await KnowledgeBaseService.getArticle({
      kb,
      slug: params.article ?? "",
      params,
      request,
    });
    if (!item) {
      return json({ error: "Not found" }, { status: 404 });
    }
    if (action === "thumbsUp") {
      await voteArticle({ userAnalyticsId, articleId: item.article.id, type: "up" });
      return json({ success: true });
    } else if (action === "thumbsDown") {
      await voteArticle({ userAnalyticsId, articleId: item.article.id, type: "down" });
      return json({ success: true });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  };
}
