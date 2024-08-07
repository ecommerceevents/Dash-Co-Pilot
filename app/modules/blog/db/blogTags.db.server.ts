import { BlogPost, BlogTag } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import { db } from "~/utils/db.server";

export async function getAllBlogTags(tenantId: string | null): Promise<BlogTag[]> {
  return await db.blogTag.findMany({
    where: { tenantId },
    orderBy: {
      color: "asc",
    },
  });
}

export async function syncBlogTags({ post, tagNames }: { post: BlogPost; tagNames: string[] }) {
  const tagsWithoutDuplicates = Array.from(new Set(tagNames));
  const tags = await Promise.all(
    tagsWithoutDuplicates.map(async (tagName) => {
      const tag = await db.blogTag.findUnique({
        where: {
          tenantId: post.tenantId,
          name: tagName.trim(),
        },
      });
      if (tag) {
        return tag;
      } else {
        return await db.blogTag.create({
          data: {
            tenantId: post.tenantId,
            name: tagName.trim(),
            color: Colors.BLUE,
          },
        });
      }
    })
  );
  await db.blogPostTag.deleteMany({
    where: {
      postId: post.id,
    },
  });
  await Promise.all(
    tags.map(async (tag) => {
      return await db.blogPostTag.create({
        data: {
          postId: post.id,
          tagId: tag.id,
        },
      });
    })
  );
}
