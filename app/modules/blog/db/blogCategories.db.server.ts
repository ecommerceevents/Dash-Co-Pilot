import { BlogCategory } from "@prisma/client";
import { db } from "~/utils/db.server";

export async function getAllBlogCategories(tenantId: string | null): Promise<BlogCategory[]> {
  return await db.blogCategory.findMany({
    where: { tenantId },
    orderBy: {
      color: "asc",
    },
  });
}

export async function getBlogCategoryById(id: string): Promise<BlogCategory | null> {
  return await db.blogCategory.findUnique({
    where: {
      id,
    },
  });
}

export async function getBlogCategoryByName({ tenantId, name }: { tenantId: string | null; name: string }): Promise<BlogCategory | null> {
  return await db.blogCategory
    .findFirstOrThrow({
      where: {
        tenantId,
        name,
      },
    })
    .catch(() => null);
}

export async function createBlogCategory(data: { tenantId: string | null; name: string; color: number }) {
  return await db.blogCategory.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      color: data.color,
    },
  });
}
