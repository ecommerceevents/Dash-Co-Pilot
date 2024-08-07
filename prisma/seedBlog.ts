import { Colors } from "~/application/enums/shared/Colors";
import { db } from "~/utils/db.server";
import { getMdxContent } from "~/utils/services/blogService";

export async function seedBlog() {
  await seedCategories({
    tenantId: null,
    items: [
      { name: "Article", color: Colors.INDIGO },
      { name: "Tutorial", color: Colors.ORANGE },
    ],
  });

  return await seedBlogPosts();
}

export async function seedBlogPosts() {
  const posts = [
    {
      tenantId: null,
      slug: "remix-saas-kit-v0-0-1-quickstart-core-concepts",
      title: "Remix SaaS kit v0.0.1 - QuickStart & Core Concepts",
      description: "Learn what you can do with the Remix SaaS kit.",
      date: new Date("2022-01-16T16:43:00.000Z"),
      image: "https://yahooder.sirv.com/saasfrontends/remix/blog/quickstart/cover.png",
      readingTime: "10 min",
      categoryName: "Tutorial",
      tagNames: ["remix", "react", "saas", "tutorial"],
      published: true,
    },
  ];

  return await Promise.all(
    posts.map(async (post) => {
      await new Promise((r) => setTimeout(r, 100));
      return await seedBlogPost(post);
    })
  );
}

// async function seedTags(tags: { name: string; color: Colors }[]) {
//   return await Promise.all(
//     tags.map(async (data) => {
//       const existing = await db.blogTag.findFirst({
//         where: { tenantId: null, name: data.name },
//       });
//       if (!existing) {
//         return await db.blogTag.create({
//           data: {
//             ...data,
//             tenantId: null,
//           },
//         });
//       }
//     })
//   );
// }

async function seedCategories({ tenantId, items }: { tenantId: string | null; items: { name: string; color: Colors }[] }) {
  return await Promise.all(
    items.map(async (data) => {
      return await db.blogCategory.create({
        data: {
          tenantId,
          ...data,
        },
      });
    })
  );
}

async function seedBlogPost(post: {
  tenantId: string | null;
  slug: string;
  title: string;
  description: string;
  date: Date;
  image: string;
  readingTime: string;
  published: boolean;
  categoryName: string;
  tagNames: string[];
}) {
  const existingBlogPost = await db.blogPost
    .findFirstOrThrow({
      where: {
        tenantId: post.tenantId,
        slug: post.slug,
      },
    })
    .catch(() => null);
  if (existingBlogPost) {
    // eslint-disable-next-line no-console
    console.log("existing blog post with slug: " + post.slug);
    return;
  }

  const category = await db.blogCategory
    .findFirstOrThrow({
      where: {
        tenantId: post.tenantId,
        name: post.categoryName,
      },
    })
    .catch(() => null);
  const tags = await db.blogTag.findMany({
    where: {
      tenantId: post.tenantId,
      name: { in: post.tagNames },
    },
  });
  const tagIds = tags.map((tag) => {
    return {
      tagId: tag.id,
    };
  });

  const content = await getMdxContent(post.slug);
  return await db.blogPost.create({
    data: {
      tenantId: post.tenantId,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      image: post.image,
      content,
      readingTime: post.readingTime,
      published: post.published,
      categoryId: category?.id ?? "",
      tags: {
        create: tagIds,
      },
    },
  });
}
