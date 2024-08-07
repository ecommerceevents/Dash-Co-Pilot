import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputText from "~/components/ui/input/InputText";
import MarginBlockForm from "./margin/MarginBlockForm";
import PaddingBlockForm from "./padding/PaddingBlockForm";
import SizeBlockForm from "./size/SizeBlockForm";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";

export default function LayoutBlockForm({ item, onUpdate }: { item?: PageBlockDto; onUpdate: (item: PageBlockDto) => void }) {
  const [state, setState] = useState(item);
  useEffect(() => {
    if (state) {
      onUpdate(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <InputGroup title="Layout">
      <div className="space-y-2">
        <PaddingBlockForm item={state?.layout?.padding} onUpdate={(padding) => setState({ ...state, layout: { ...state?.layout, padding } })} />
        <MarginBlockForm item={state?.layout?.margin} onUpdate={(margin) => setState({ ...state, layout: { ...state?.layout, margin } })} />
        <SizeBlockForm item={state?.layout?.size} onUpdate={(size) => setState({ ...state, layout: { ...state?.layout, size } })} />
        <InputText
          title="CSS"
          value={state?.layout?.css}
          setValue={(i) => setState({ ...state, layout: { ...state?.layout, css: i.toString().length > 0 ? i.toString() : undefined } })}
        />
      </div>
    </InputGroup>
  );
}
