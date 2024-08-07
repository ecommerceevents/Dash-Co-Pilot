import { BlogPostBlockDto } from "./BlogPostBlockUtils";
import BlogPostVariantSimple from "./BlogPostVariantSimple";

export default function BlogPostBlock({ item }: { item: BlogPostBlockDto }) {
  return <>{item.style === "simple" && <BlogPostVariantSimple item={item} />}</>;
}
