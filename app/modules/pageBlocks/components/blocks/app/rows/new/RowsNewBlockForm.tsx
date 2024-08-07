import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputText from "~/components/ui/input/InputText";
import BlockVariableForm from "../../../shared/variables/BlockVariableForm";
import { defaultRowsNewBlock, RowsNewBlockDto, RowsNewBlockStyle, RowsNewBlockStyles } from "./RowsNewBlockUtils";

export default function RowsNewBlockForm({ item, onUpdate }: { item?: RowsNewBlockDto; onUpdate: (item: RowsNewBlockDto) => void }) {
  const [state, setState] = useState<RowsNewBlockDto>(item || defaultRowsNewBlock);
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
          setValue={(value) => setState({ ...state, style: value as RowsNewBlockStyle })}
          options={RowsNewBlockStyles.map((f) => f)}
        />
      </InputGroup>

      <InputGroup title="Properties">
        <InputText
          title="Hidden"
          value={state.hiddenProperties.join(",")}
          setValue={(value) =>
            setState({
              ...state,
              hiddenProperties: value
                .toString()
                .split(",")
                .filter((f) => f),
            })
          }
        />
      </InputGroup>

      <InputGroup title="Variables">
        <div className="space-y-2">
          <BlockVariableForm
            name="entityName"
            item={item?.variables.entityName}
            onUpdate={(entityName) => setState({ ...state, variables: { ...state.variables, entityName } })}
          />
          <BlockVariableForm
            name="tenantId"
            item={item?.variables.tenantId}
            onUpdate={(tenantId) => setState({ ...state, variables: { ...state.variables, tenantId } })}
          />
          <BlockVariableForm
            name="redirectTo"
            item={item?.variables.redirectTo}
            onUpdate={(redirectTo) => setState({ ...state, variables: { ...state.variables, redirectTo } })}
          />
        </div>
      </InputGroup>
    </div>
  );
}
