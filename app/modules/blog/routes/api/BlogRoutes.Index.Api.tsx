import { LoaderFunctionArgs, json } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { BlogPostWithDetails, getAllBlogPosts } from "../../db/blog.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import AnalyticsService from "~/utils/helpers/.server/AnalyticsService";
import UrlUtils from "~/utils/app/UrlUtils";
import { AnalyticsPageView } from "@prisma/client";

export namespace BlogRoutesIndexApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    items: BlogPostWithDetails[];
    views: AnalyticsPageView[];
  };

  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    if (tenantId === null) {
      await verifyUserHasPermission(request, "admin.blog.view");
    }
    const items = await getAllBlogPosts({ tenantId });
    const data: LoaderData = {
      metatags: [{ title: `Blog | ${process.env.APP_NAME}` }],
      items,
      views: await AnalyticsService.getPageViews({
        url: { startsWith: UrlUtils.getBlogPath(params) },
      }),
    };
    return json(data);
  };
}
