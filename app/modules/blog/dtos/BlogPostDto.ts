export type BlogPostDto = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  date: Date;
  image?: string;
  content: string;
  category: { name: string } | null;
  author: {
    avatar: string | null;
    firstName: string;
    lastName: string;
  } | null;
  tags: { id: string; postId: string; tagId: string; tag: { name: string; color: number } }[];
};
