import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputText from "~/components/ui/input/InputText";
import { defaultHeadingBlock, HeadingBlockDto, HeadingBlockStyle, HeadingBlockStyles } from "./HeadingBlockUtils";

export default function HeadingBlockForm({ item, onUpdate }: { item?: HeadingBlockDto; onUpdate: (item: HeadingBlockDto) => void }) {
  const [state, setState] = useState<HeadingBlockDto>(item || defaultHeadingBlock);
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
          setValue={(value) => setState({ ...state, style: value as HeadingBlockStyle })}
          options={HeadingBlockStyles.map((f) => f)}
        />
      </InputGroup>
      <InputGroup title="Copy">
        <div className="space-y-2">
          <InputText title="Headline" type="text" value={state.headline} setValue={(e) => setState({ ...state, headline: e.toString() })} />
          <InputText title="Subheadline" type="text" value={state.subheadline} setValue={(e) => setState({ ...state, subheadline: e.toString() })} />
        </div>
      </InputGroup>
    </div>
  );
}
