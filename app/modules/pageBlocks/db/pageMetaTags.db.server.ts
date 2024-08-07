import { clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";

export async function getMetaTags(pageId: string | null) {
  return await db.pageMetaTag
    .findMany({
      where: { pageId },
      orderBy: { order: "asc" },
    })
    .catch(() => {
      return [];
    });
}

export async function createMetaTag(data: { pageId: string | null; name: string; value: string; order: number }) {
  return await db.pageMetaTag
    .create({
      data,
      include: { page: true },
    })
    .then((item) => {
      clearCacheKey(`page:${item.page?.slug}`);
      clearCacheKey(`pageMetaTags:${item.page?.slug}`);
      return item;
    });
}

export async function updateMetaTag(id: string, data: { value: string; order: number }) {
  return await db.pageMetaTag
    .update({
      where: { id },
      data,
      include: { page: true },
    })
    .then((item) => {
      clearCacheKey(`page:${item.page?.slug}`);
      clearCacheKey(`pageMetaTags:${item.page?.slug}`);
      return item;
    });
}

export async function deleteMetaTags(page: { id: string; slug: string } | null) {
  return await db.pageMetaTag.deleteMany({ where: { pageId: page?.id || null } }).then((item) => {
    clearCacheKey(`page:${page?.slug}`);
    clearCacheKey(`pageMetaTags:${page?.slug}`);
    return item;
  });
}
