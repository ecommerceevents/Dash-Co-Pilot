import { KnowledgeBaseArticle, KnowledgeBaseRelatedArticle, Prisma } from "@prisma/client";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { cachified, clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";

export type KnowledgeBaseArticleWithDetails = KnowledgeBaseArticle & {
  category: { slug: string; title: string } | null;
  section: { order: number; title: string } | null;
  relatedArticles: (KnowledgeBaseRelatedArticle & {
    relatedArticle: { id: string; order: number; title: string; slug: string };
  })[];
  createdByUser: {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  } | null;
  _count: {
    views: number;
    upvotes: number;
    downvotes: number;
  };
};

export type KnowledgeBaseArticleSimple = {
  id: string;
  knowledgeBaseId: string;
  title: string;
  language: string;
  category: { id: string; slug: string; title: string } | null;
  section: { id: string; order: number; title: string } | null;
};

const include = {
  category: {
    select: { slug: true, title: true },
  },
  section: {
    select: { order: true, title: true },
  },
  relatedArticles: {
    include: {
      relatedArticle: {
        select: { id: true, order: true, title: true, slug: true },
      },
    },
  },
  createdByUser: {
    select: { email: true, firstName: true, lastName: true, avatar: true },
  },
  _count: {
    select: { views: true, upvotes: true, downvotes: true },
  },
};

export async function getAllKnowledgeBaseArticles({
  knowledgeBaseSlug,
  categoryId,
  language,
}: {
  knowledgeBaseSlug: string;
  categoryId?: string;
  language: string | undefined;
}): Promise<KnowledgeBaseArticleWithDetails[]> {
  return await db.knowledgeBaseArticle.findMany({
    where: {
      knowledgeBase: { slug: knowledgeBaseSlug },
      categoryId,
      language,
    },
    include,
    orderBy: [
      {
        category: { order: "asc" },
      },
      {
        section: { order: "asc" },
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllKnowledgeBaseArticlesSimple(): Promise<KnowledgeBaseArticleSimple[]> {
  return await db.knowledgeBaseArticle.findMany({
    select: {
      id: true,
      knowledgeBaseId: true,
      title: true,
      language: true,
      category: { select: { id: true, slug: true, title: true } },
      section: { select: { id: true, order: true, title: true } },
    },
    orderBy: [
      {
        knowledgeBaseId: "asc",
      },
      {
        category: { order: "asc" },
      },
      {
        section: { order: "asc" },
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllKnowledgeBaseArticlesWithPagination({
  knowledgeBaseSlug,
  language,
  pagination,
  filters,
}: {
  knowledgeBaseSlug: string;
  language: string | undefined;
  pagination: {
    page: number;
    pageSize: number;
  };
  filters: {
    title?: string;
    description?: string;
    categoryId?: string | null;
    content?: string;
  };
}): Promise<{
  items: KnowledgeBaseArticleWithDetails[];
  pagination: PaginationDto;
}> {
  const where: Prisma.KnowledgeBaseArticleWhereInput = {
    knowledgeBase: { slug: knowledgeBaseSlug },
    language,
  };
  if (filters.title !== undefined) {
    where.title = { contains: filters.title, mode: "insensitive" };
  }
  if (filters.description !== undefined) {
    where.description = { contains: filters.description, mode: "insensitive" };
  }
  if (filters.categoryId !== undefined) {
    where.categoryId = filters.categoryId;
  }
  if (filters.content !== undefined) {
    where.contentPublishedAsText = { contains: filters.content, mode: "insensitive" };
  }
  const items = await db.knowledgeBaseArticle.findMany({
    take: pagination.pageSize,
    skip: (pagination.page - 1) * pagination.pageSize,
    where,
    include,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
  const totalItems = await db.knowledgeBaseArticle.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function findKnowledgeBaseArticles({
  knowledgeBaseSlug,
  language,
  query,
}: {
  knowledgeBaseSlug: string;
  language: string | undefined;
  query: string;
}): Promise<KnowledgeBaseArticleWithDetails[]> {
  return await db.knowledgeBaseArticle.findMany({
    where: {
      knowledgeBase: { slug: knowledgeBaseSlug },
      language,
      publishedAt: { not: null },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        {
          contentPublishedAsText: { contains: query, mode: "insensitive" },
        },
      ],
    },
    include,
    orderBy: [
      {
        category: { order: "asc" },
      },
      {
        section: { order: "asc" },
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getFeaturedKnowledgeBaseArticles({
  knowledgeBaseId,
  language,
}: {
  knowledgeBaseId: string;
  language: string;
}): Promise<KnowledgeBaseArticleWithDetails[]> {
  return await db.knowledgeBaseArticle.findMany({
    where: {
      knowledgeBaseId,
      language,
      featuredOrder: { not: null },
      publishedAt: { not: null },
    },
    include,
    orderBy: [{ featuredOrder: "asc" }],
  });
}

export async function getKbArticleById(id: string): Promise<KnowledgeBaseArticleWithDetails | null> {
  return await db.knowledgeBaseArticle.findUnique({
    where: { id },
    include,
  });
}

export async function getKbArticleBySlug({
  knowledgeBaseId,
  slug,
  language,
}: {
  knowledgeBaseId: string;
  slug: string;
  language: string;
}): Promise<KnowledgeBaseArticleWithDetails | null> {
  return await cachified({
    key: `kb-article:${knowledgeBaseId}:${slug}:${language}`,
    ttl: 60 * 60 * 24,
    getFreshValue: () =>
      db.knowledgeBaseArticle
        .findFirstOrThrow({
          where: {
            knowledgeBaseId,
            slug,
            language,
          },
          include: {
            ...include,
            // category: {
            //   include: {
            //     articles: {
            //       select: { id: true, order: true, title: true, description: true, slug: true, language: true, sectionId: true, publishedAt: true },
            //     },
            //     sections: {
            //       select: { id: true, order: true, title: true, description: true },
            //     },
            //   },
            // },
          },
        })
        .catch(() => {
          return null;
        }),
  });
}

export async function createKnowledgeBaseArticle(data: {
  knowledgeBaseId: string;
  categoryId: string | null;
  sectionId: string | null;
  slug: string;
  title: string;
  description: string;
  order: number;
  contentDraft: string;
  contentPublished: string;
  contentPublishedAsText: string;
  contentType: string;
  language: string;
  featuredOrder: number | null;
  createdByUserId: string | null;
  seoImage: string;
  publishedAt: Date | null;
}) {
  return await db.knowledgeBaseArticle.create({
    data: {
      knowledgeBaseId: data.knowledgeBaseId,
      categoryId: data.categoryId,
      sectionId: data.sectionId,
      slug: data.slug,
      title: data.title,
      description: data.description,
      order: data.order,
      contentDraft: data.contentDraft,
      contentPublished: data.contentPublished,
      contentPublishedAsText: data.contentPublishedAsText,
      contentType: data.contentType,
      language: data.language,
      featuredOrder: data.featuredOrder,
      createdByUserId: data.createdByUserId,
      seoImage: data.seoImage,
      publishedAt: data.publishedAt,
    },
  });
}

export async function updateKnowledgeBaseArticle(
  id: string,
  data: {
    categoryId?: string | null;
    sectionId?: string | null;
    slug?: string;
    title?: string;
    description?: string;
    order?: number;
    contentDraft?: string;
    contentPublished?: string;
    contentPublishedAsText?: string;
    contentType?: string;
    language?: string;
    featuredOrder?: number | null;
    createdByUserId?: string | null;
    seoImage?: string;
    publishedAt?: Date | null;
    relatedArticles?: string[];
  }
) {
  const update: Prisma.KnowledgeBaseArticleUncheckedUpdateInput = {
    categoryId: data.categoryId,
    sectionId: data.sectionId,
    slug: data.slug,
    title: data.title,
    description: data.description,
    order: data.order,
    contentDraft: data.contentDraft,
    contentPublished: data.contentPublished,
    contentPublishedAsText: data.contentPublishedAsText,
    contentType: data.contentType,
    language: data.language,
    featuredOrder: data.featuredOrder,
    createdByUserId: data.createdByUserId,
    seoImage: data.seoImage,
    publishedAt: data.publishedAt,
  };
  await db.knowledgeBaseArticle
    .update({
      where: { id },
      data: update,
    })
    .then((item) => {
      clearCacheKey(`kb-article:${item.knowledgeBaseId}:${item.slug}:${item.language}`);
      return item;
    });
  if (data.relatedArticles) {
    await db.knowledgeBaseRelatedArticle.deleteMany({
      where: {
        articleId: id,
      },
    });
    await db.knowledgeBaseRelatedArticle.createMany({
      data: data.relatedArticles.map((f) => {
        return {
          articleId: id,
          relatedArticleId: f,
        };
      }),
    });
  }
}

export async function deleteKnowledgeBaseArticle(id: string) {
  return await db.knowledgeBaseArticle
    .delete({
      where: { id },
    })
    .then((item) => {
      clearCacheKey(`kb-article:${item.knowledgeBaseId}:${item.slug}:${item.language}`);
      return item;
    });
}

export async function countKnowledgeBaseArticles() {
  return await db.knowledgeBaseArticle.count();
}
