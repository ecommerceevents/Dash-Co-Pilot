import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import { defaultBlogPostsBlock, BlogPostsBlockDto, BlogPostsBlockStyle, BlogPostsBlockStyles } from "./BlogPostsBlockUtils";

export default function BlogPostsBlockForm({ item, onUpdate }: { item?: BlogPostsBlockDto; onUpdate: (item: BlogPostsBlockDto) => void }) {
  const [state, setState] = useState<BlogPostsBlockDto>(item || defaultBlogPostsBlock);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-4">
      <InputGroup title="Design">
        <InputRadioGroup
          title="Style"
          value={state.style}
          setValue={(value) => setState({ ...state, style: value as BlogPostsBlockStyle })}
          options={BlogPostsBlockStyles.map((f) => f)}
        />
      </InputGroup>

      <InputGroup title="Details">
        <div className="space-y-2">
          <InputCheckboxWithDescription
            name="withCoverImage"
            title="With cover image"
            value={state.withCoverImage}
            setValue={(e) => setState({ ...state, withCoverImage: Boolean(e) })}
            description="Show cover image for each post."
          />

          <InputCheckboxWithDescription
            name="withAuthorName"
            title="With author name"
            value={state.withAuthorName}
            setValue={(e) => setState({ ...state, withAuthorName: Boolean(e) })}
            description="Show author name for each post."
          />

          <InputCheckboxWithDescription
            name="withAuthorAvatar"
            title="With author avatar"
            value={state.withAuthorAvatar}
            setValue={(e) => setState({ ...state, withAuthorAvatar: Boolean(e) })}
            description="Show author avatar for each post."
          />

          <InputCheckboxWithDescription
            name="withDate"
            title="With date"
            value={state.withDate}
            setValue={(e) => setState({ ...state, withDate: Boolean(e) })}
            description="Show date for each post."
          />
        </div>
      </InputGroup>
    </div>
  );
}
