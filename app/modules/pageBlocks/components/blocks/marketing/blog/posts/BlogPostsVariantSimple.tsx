import { BlogPostsBlockDto } from "./BlogPostsBlockUtils";
import PostsList from "~/components/blog/PostsList";

export default function BlogPostsVariantSimple({ item }: { item: BlogPostsBlockDto }) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto antialiased">
          {item.data && (
            <PostsList
              blogPath={item.blogPath}
              items={item.data}
              withCoverImage={item.withCoverImage}
              withAuthorName={item.withAuthorName}
              withAuthorAvatar={item.withAuthorAvatar}
              withDate={item.withDate}
            />
          )}
        </div>
      </div>
    </>
  );
}
