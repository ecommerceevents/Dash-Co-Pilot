import { BlogPost, BlogCategory, BlogPostTag, BlogTag, Prisma } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import { db } from "../../../utils/db.server";
import { syncBlogTags } from "./blogTags.db.server";
import { UserSimple } from "../../../utils/db/users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { clearCacheKey } from "~/utils/cache.server";

export type BlogPostWithDetails = BlogPost & {
  author: (UserSimple & { avatar: string | null }) | null;
  category: BlogCategory | null;
  tags: (BlogPostTag & { tag: BlogTag })[];
};

export async function getAllBlogPosts({ tenantId, published }: { tenantId: string | null; published?: boolean }): Promise<BlogPostWithDetails[]> {
  let where: Prisma.BlogPostWhereInput = {
    tenantId,
  };
  if (published) {
    where = {
      ...where,
      published,
    };
  }
  return await db.blogPost.findMany({
    where,
    orderBy: {
      date: "desc",
    },
    include: {
      author: { select: { ...UserModelHelper.selectSimpleUserProperties, avatar: true } },
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getBlogPost({ tenantId, idOrSlug }: { tenantId: string | null; idOrSlug: string }): Promise<BlogPostWithDetails | null> {
  return await db.blogPost
    .findFirstOrThrow({
      where: {
        tenantId,
        OR: [
          {
            id: idOrSlug,
          },
          {
            slug: idOrSlug,
          },
        ],
      },
      include: {
        author: { select: { ...UserModelHelper.selectSimpleUserProperties, avatar: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
    .catch(() => {
      return null;
    });
}

export async function deleteBlogPost(id: string) {
  return await db.blogPost
    .delete({
      where: {
        id,
      },
    })
    .then((item) => {
      clearCacheKey(`blog:published`);
      return item;
    });
}

export async function createBlogPost(data: {
  tenantId: string | null;
  slug: string;
  title: string;
  description: string;
  date: Date;
  image: string;
  content: string;
  readingTime: string;
  published: boolean;
  authorId: string | null;
  categoryId: string | null;
  tagNames: string[];
  contentType: string;
}): Promise<BlogPost> {
  const tags: BlogTag[] = [];

  await Promise.all(
    data.tagNames.map(async (tagName) => {
      const tag = await db.blogTag.findUnique({
        where: {
          tenantId: data.tenantId,
          name: tagName.trim(),
        },
      });
      if (tag) {
        tags.push(tag);
      } else {
        const tag = await db.blogTag.create({
          data: {
            tenantId: data.tenantId,
            name: tagName.trim(),
            color: Colors.BLUE,
          },
        });
        tags.push(tag);
      }
    })
  );

  const tagIds = tags.map((tag) => {
    return {
      tagId: tag.id,
    };
  });

  const post = await db.blogPost
    .create({
      data: {
        tenantId: data.tenantId,
        slug: data.slug,
        title: data.title,
        description: data.description,
        date: data.date,
        image: data.image,
        content: data.content,
        readingTime: data.readingTime,
        published: data.published,
        authorId: data.authorId,
        categoryId: data.categoryId,
        tags: {
          create: tagIds,
        },
        contentType: data.contentType,
      },
    })
    .then((item) => {
      clearCacheKey(`blog:published`);
      return item;
    });

  await syncBlogTags({ post, tagNames: data.tagNames });

  return post;
}

export async function updateBlogPost(
  id: string,
  data: {
    slug?: string;
    title?: string;
    description?: string;
    date?: Date;
    image?: string;
    content?: string;
    readingTime?: string;
    published?: boolean;
    authorId?: string | null;
    categoryId?: string | null;
    tagNames?: string[];
    contentType?: string;
  }
): Promise<BlogPost> {
  const post = await db.blogPost
    .update({
      where: {
        id,
      },
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        date: data.date,
        image: data.image,
        content: data.content,
        readingTime: data.readingTime,
        published: data.published,
        authorId: data.authorId,
        categoryId: data.categoryId,
        contentType: data.contentType,
      },
    })
    .then((item) => {
      clearCacheKey(`blog:published`);
      return item;
    });

  if (data.tagNames) {
    await syncBlogTags({ post, tagNames: data.tagNames });
  }

  return post;
}

export async function updateBlogPostImage(id: string, data: { image: string }): Promise<BlogPost> {
  return await db.blogPost.update({
    where: { id },
    data: {
      image: data.image,
    },
  });
}

export async function updateBlogPostPublished(id: string, published: boolean): Promise<BlogPost> {
  return await db.blogPost
    .update({
      where: {
        id,
      },
      data: {
        published,
      },
    })
    .then((item) => {
      clearCacheKey(`blog:published`);
      return item;
    });
}
