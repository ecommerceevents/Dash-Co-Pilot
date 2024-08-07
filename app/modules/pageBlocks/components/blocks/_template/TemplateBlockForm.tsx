import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import { defaultTemplateBlock, TemplateBlockDto, TemplateBlockStyle, TemplateBlockStyles } from "./TemplateBlockUtils";

export default function TemplateBlockForm({ item, onUpdate }: { item?: TemplateBlockDto; onUpdate: (item: TemplateBlockDto) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<TemplateBlockDto>(item || defaultTemplateBlock);
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
          setValue={(value) => setState({ ...state, style: value as TemplateBlockStyle })}
          options={TemplateBlockStyles.map((f) => f)}
        />
      </InputGroup>
      <InputGroup title="Copy">
        <div className="space-y-2">
          <InputText title="Text" type="text" value={state.text} setValue={(e) => setState({ ...state, text: e.toString() })} />
        </div>
      </InputGroup>

      <InputGroup title="Items">
        <div className="flex flex-col space-y-2">
          {state.items.map((item, index) => (
            <CollapsibleRow
              key={index}
              title={item.name}
              value={item.name}
              initial={!item.value}
              onRemove={() => {
                const items = state.items ?? [];
                items.splice(index, 1);
                setState({ ...state, items });
              }}
            >
              <div className="grid grid-cols-1 gap-2">
                <InputText
                  title="Name"
                  value={item.name}
                  setValue={(e) => setState({ ...state, items: state.items.map((item, i) => (i === index ? { ...item, name: e?.toString() } : item)) })}
                />
                <InputText
                  title="Value"
                  type="text"
                  value={item.value}
                  setValue={(e) => setState({ ...state, items: state.items.map((item, i) => (i === index ? { ...item, value: e.toString() } : item)) })}
                />
              </div>
            </CollapsibleRow>
          ))}
          <ButtonTertiary
            onClick={() =>
              setState({
                ...state,
                items: [
                  ...(state.items ?? []),
                  {
                    name: "Item " + state.items.length + 1,
                    value: "",
                  },
                ],
              })
            }
          >
            {t("shared.add")}
          </ButtonTertiary>
        </div>
      </InputGroup>
    </div>
  );
}
