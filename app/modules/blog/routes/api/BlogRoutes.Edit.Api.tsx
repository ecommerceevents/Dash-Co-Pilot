import { BlogCategory, BlogTag } from "@prisma/client";
import { MetaFunction, json, ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getTranslations } from "~/locale/i18next.server";
import { BlogApi } from "~/utils/api/.server/BlogApi";
import FormHelper from "~/utils/helpers/FormHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { storeSupabaseFile } from "~/utils/integrations/supabaseService";
import { getUserInfo } from "~/utils/session.server";
import { BlogPostWithDetails, getBlogPost, updateBlogPost, deleteBlogPost } from "../../db/blog.db.server";
import { getAllBlogCategories } from "../../db/blogCategories.db.server";
import { getAllBlogTags } from "../../db/blogTags.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import UrlUtils from "~/utils/app/UrlUtils";

export namespace BlogRoutesEditApi {
  export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

  export type LoaderData = {
    metatags: MetaTagsDto;
    item: BlogPostWithDetails;
    categories: BlogCategory[];
    tags: BlogTag[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const item = await getBlogPost({ tenantId, idOrSlug: params.id ?? "" });
    if (!item) {
      return redirect(UrlUtils.getModulePath(params, "blog"));
    }

    const data: LoaderData = {
      metatags: [{ title: `Blog | ${process.env.APP_NAME}` }],
      item,
      categories: await getAllBlogCategories(tenantId),
      tags: await getAllBlogTags(tenantId),
    };
    return json(data);
  };

  export type ActionData = {
    error?: string;
    createdPost?: BlogPostWithDetails | null;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const userInfo = await getUserInfo(request);
    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const content = form.get("content")?.toString() ?? "";
    if (action === "edit") {
      if (tenantId === null) {
        await verifyUserHasPermission(request, "admin.blog.update");
      }
      const title = form.get("title")?.toString() ?? "";
      const slug = form.get("slug")?.toString() ?? "";
      const description = form.get("description")?.toString() ?? "";
      const date = form.get("date")?.toString() ?? "";
      const image = form.get("image")?.toString() ?? "";
      const published = FormHelper.getBoolean(form, "published");
      const readingTime = form.get("reading-time")?.toString() ?? "";
      const categoryId = form.get("category")?.toString() ?? "";
      const tags = form.get("tags")?.toString() ?? "";
      const contentType = form.get("contentType")?.toString() ?? "";
      const addingCategoryName = form.get("new-category")?.toString() ?? "";

      try {
        const blogPost = await getBlogPost({ tenantId, idOrSlug: params.id ?? "" });
        if (!blogPost) {
          return redirect(UrlUtils.getModulePath(params, "blog"));
        }
        let category: BlogCategory | null = null;
        if (addingCategoryName) {
          category = await BlogApi.getCategory({ tenantId, idOrName: { name: addingCategoryName } });
          if (!category) {
            category = await BlogApi.createCategory({ tenantId, name: addingCategoryName });
          }
        }
        let authorId = blogPost.authorId;
        if (authorId === null) {
          authorId = userInfo.userId;
        }
        const updated = await updateBlogPost(blogPost.id, {
          slug,
          title,
          description,
          date: new Date(date),
          image: await storeSupabaseFile({ bucket: "blog", content: image, id: slug }),
          content,
          readingTime,
          published,
          categoryId: categoryId.length ? categoryId : category?.id ?? null,
          tagNames: tags.split(",").filter((f) => f.trim() != ""),
          contentType,
          authorId,
        });

        return redirect(UrlUtils.getBlogPath(params, updated.slug));
      } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
      }
    } else if (action === "delete") {
      if (tenantId === null) {
        await verifyUserHasPermission(request, "admin.blog.delete");
      }
      try {
        await deleteBlogPost(params.id ?? "");
        return redirect(UrlUtils.getModulePath(params, "blog"));
      } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
