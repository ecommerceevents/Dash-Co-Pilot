import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import SocialsBlockForm from "../../../shared/socials/SocialsBlockForm";
import BlockVariableForm from "../../../shared/variables/BlockVariableForm";
import { defaultBlogPostBlock, BlogPostBlockDto, BlogPostBlockStyle, BlogPostBlockStyles } from "./BlogPostBlockUtils";

export default function BlogPostBlockForm({ item, onUpdate }: { item?: BlogPostBlockDto; onUpdate: (item: BlogPostBlockDto) => void }) {
  const [state, setState] = useState<BlogPostBlockDto>(item || defaultBlogPostBlock);
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
          setValue={(value) => setState({ ...state, style: value as BlogPostBlockStyle })}
          options={BlogPostBlockStyles.map((f) => f)}
        />
      </InputGroup>

      <InputGroup title="Socials">
        <SocialsBlockForm item={item?.socials} onUpdate={(socials) => setState({ ...state, socials })} />
      </InputGroup>

      <InputGroup title="Variable">
        <BlockVariableForm
          name="postSlug"
          item={item?.variables?.postSlug}
          onUpdate={(postSlug) => setState({ ...state, variables: { ...state.variables, postSlug } })}
        />
      </InputGroup>
    </div>
  );
}
