import { useEffect, useState } from "react";
import InputText from "~/components/ui/input/InputText";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import { BlockVariableDto } from "./BlockVariableDto";
import InputSelect from "~/components/ui/input/InputSelect";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import InputCheckbox from "~/components/ui/input/InputCheckbox";

export default function BlockVariableForm({ name, item, onUpdate }: { name: string; item?: BlockVariableDto; onUpdate: (item: BlockVariableDto) => void }) {
  const [state, setState] = useState<BlockVariableDto>(item || { type: "manual" });
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <CollapsibleRow title={name} value={<VariableDescription title={name} item={state} />} initial={false}>
      <div className="grid grid-cols-5 gap-2">
        <InputSelect
          className="col-span-2"
          name="type"
          title="Variable type"
          value={state.type}
          setValue={(value) => setState({ ...state, type: value?.toString() as "manual" | "param" | "query" })}
          options={[
            { name: "Manual", value: "manual" },
            { name: "Param", value: "param" },
            { name: "Query", value: "query" },
          ]}
        />
        {state.type === "manual" && (
          <InputText
            className="col-span-2"
            name="value"
            title="Value"
            value={state.value ?? undefined}
            setValue={(value) => setState({ ...state, value: value?.toString() })}
            required
            placeholder="Default: null"
          />
        )}
        {state.type === "query" && (
          <InputText
            className="col-span-2"
            name="query"
            title="Query"
            value={state.query}
            setValue={(value) => setState({ ...state, query: value?.toString() })}
            required
          />
        )}
        {state.type === "param" && (
          <InputRadioGroup
            className="col-span-2"
            name="paramId"
            title="Param ID"
            value={state.param}
            setValue={(value) => setState({ ...state, param: value as "id1" | "id2" })}
            options={[
              { name: ":id1", value: "id1" },
              { name: ":id2", value: "id2" },
            ]}
          />
        )}
        <InputCheckbox title="Required" name="required" value={state.required} setValue={(value) => setState({ ...state, required: Boolean(value) })} />
      </div>
    </CollapsibleRow>
  );
}

function VariableDescription({ title, item }: { title: string; item?: BlockVariableDto }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0 font-medium text-gray-800">{title}</div>
      {item && (
        <>
          <div className="text-gray-500">•</div>
          <div>{item.type}</div>
          {item.type === "manual" && (
            <>
              <div className="text-gray-500">•</div>
              <div>{item.value ?? "null"}</div>
            </>
          )}
          {item.type === "param" && (
            <>
              <div className="text-gray-500">•</div>
              <div>{item.param}</div>
            </>
          )}
          {item.type === "query" && (
            <>
              <div className="text-gray-500">•</div>
              <div>{item.query}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
