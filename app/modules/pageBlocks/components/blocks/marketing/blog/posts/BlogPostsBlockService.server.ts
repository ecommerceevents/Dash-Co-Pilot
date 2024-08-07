import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { getAllBlogPosts } from "~/modules/blog/db/blog.db.server";
import { cachified } from "~/utils/cache.server";

export namespace BlogPostsBlockService {
  export async function load(_: PageBlockLoaderArgs) {
    return await cachified({
      key: `blog:published`,
      ttl: 1000 * 60 * 60 * 24,
      disabled: true, // live data at all times
      getFreshValue: () => getAllBlogPosts({ tenantId: null, published: true }),
    });
  }
}
