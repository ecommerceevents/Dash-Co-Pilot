import { BlogPostDto } from "~/modules/blog/dtos/BlogPostDto";

export type BlogPostsBlockDto = {
  style: BlogPostsBlockStyle;
  withCoverImage: boolean;
  withAuthorName: boolean;
  withAuthorAvatar: boolean;
  withDate: boolean;
  blogPath: string;
  data: BlogPostDto[] | null;
};

export const BlogPostsBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type BlogPostsBlockStyle = (typeof BlogPostsBlockStyles)[number]["value"];

export const defaultBlogPostsBlock: BlogPostsBlockDto = {
  style: "simple",
  withCoverImage: true,
  withAuthorName: true,
  withAuthorAvatar: true,
  withDate: true,
  blogPath: "/blog",
  data: null,
};
