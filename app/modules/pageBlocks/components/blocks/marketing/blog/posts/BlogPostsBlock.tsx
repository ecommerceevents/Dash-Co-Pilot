import { BlogPostsBlockDto } from "./BlogPostsBlockUtils";
import BlogPostsVariantSimple from "./BlogPostsVariantSimple";

export default function BlogPostsBlock({ item }: { item: BlogPostsBlockDto }) {
  return <>{item.style === "simple" && <BlogPostsVariantSimple item={item} />}</>;
}
