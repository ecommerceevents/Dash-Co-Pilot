import { json } from "@remix-run/node";
import { PageBlockActionArgs } from "~/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { getBlogPost, updateBlogPostPublished } from "~/modules/blog/db/blog.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { BlockVariableService } from "../../../shared/variables/BlockVariableService.server";
import { BlogPostBlockData } from "./BlogPostBlockUtils";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";

export namespace BlogPostBlockService {
  export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<BlogPostBlockData> {
    const postSlug = BlockVariableService.getValue({ request, params, variable: block.blogPost?.variables?.postSlug });
    if (!postSlug) {
      throw new Error("Slug variable not set");
    }
    const userInfo = await getUserInfo(request);
    const user = await getUser(userInfo.userId);
    const post = await getBlogPost({ tenantId: null, idOrSlug: postSlug });
    if (!post) {
      throw json({ error: "Post not found with slug: " + postSlug }, { status: 404 });
    }
    if (!post.published && (!user || !user.admin)) {
      throw json({ error: "Post not published" }, { status: 404 });
    }
    let metaTags: MetaTagsDto = [
      { title: post.title },
      { name: "description", content: post.description },
      { name: "keywords", content: post.tags.map((postTag) => postTag.tag.name).join(",") },
      { property: "og:image", content: post.image },
      { property: "og:type", content: "article" },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      // { property: "og:url", content: `${getBaseURL(request)}/blog/${post.slug}` },
      { property: "twitter:image", content: post.image },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: post.title },
      { property: "twitter:description", content: post.description },
      ...getLinkTags(request),
    ];
    if (block.blogPost?.socials?.twitter) {
      metaTags = [...metaTags, { property: "twitter:site", content: block.blogPost.socials.twitter }];
    }
    if (block.blogPost?.socials?.twitterCreator) {
      metaTags = [...metaTags, { property: "twitter:creator", content: block.blogPost.socials.twitterCreator }];
    }
    return {
      post,
      canEdit: user?.admin !== undefined,
      metaTags,
    };
  }
  export async function publish({ params, form }: PageBlockActionArgs) {
    const postId = form.get("id")?.toString() ?? "";
    const post = await getBlogPost({ tenantId: null, idOrSlug: postId });
    if (!post) {
      throw json({ error: "Post not found with id: " + postId }, { status: 404 });
    }
    await updateBlogPostPublished(post.id ?? "", true);
    return json({});
  }
}
