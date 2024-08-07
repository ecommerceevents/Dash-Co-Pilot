import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import BlockVariableForm from "../../../shared/variables/BlockVariableForm";
import { defaultRowsListBlock, RowsListBlockDto, RowsListBlockStyle, RowsListBlockStyles } from "./RowsListBlockUtils";

export default function RowsListBlockForm({ item, onUpdate }: { item?: RowsListBlockDto; onUpdate: (item: RowsListBlockDto) => void }) {
  const [state, setState] = useState<RowsListBlockDto>(item || defaultRowsListBlock);
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
          setValue={(value) => setState({ ...state, style: value as RowsListBlockStyle })}
          options={RowsListBlockStyles.map((f) => f)}
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
            name="pageSize"
            item={item?.variables.pageSize}
            onUpdate={(pageSize) => setState({ ...state, variables: { ...state.variables, pageSize } })}
          />
        </div>
      </InputGroup>
    </div>
  );
}
