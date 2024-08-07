import { ReactNode, useEffect, useState } from "react";
import InputCombobox from "~/components/ui/input/InputCombobox";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import InputCheckboxCards from "~/components/ui/input/InputCheckboxCards";

interface Props {
  name: string;
  title: string;
  options: { value: string; name: string | null; color: number }[];
  subtype?: "combobox" | "checkboxCards";
  required?: boolean;
  disabled?: boolean;
  value?: RowValueMultipleDto[];
  onSelected?: (item: RowValueMultipleDto[]) => void;
  hint?: ReactNode;
  help?: string;
  icon?: string;
  autoFocus?: boolean;
}

const PropertyMultiSelector = ({ name, title, options, subtype, disabled, value, onSelected, required }: Props) => {
  const [actualValue, setActualValue] = useState<(string | number)[]>([]);

  useEffect(() => {
    const selection = value?.map((f) => f.value) ?? [];
    if (selection.sort().join(",") !== actualValue.sort().join(",")) {
      setActualValue(selection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    // onSelected(actualValue);
  }, [actualValue, onSelected]);

  return (
    <>
      {/* actualValue: {JSON.stringify(actualValue)} */}
      {!subtype || subtype === "combobox" ? (
        <InputCombobox
          name={name}
          title={title}
          value={actualValue}
          onChange={setActualValue}
          options={options}
          disabled={disabled}
          withSearch={false}
          withLabel={true}
          required={required}
        />
      ) : subtype === "checkboxCards" ? (
        <InputCheckboxCards
          name={name}
          title={title}
          value={actualValue}
          onChange={setActualValue}
          options={options.map((f) => {
            return {
              value: f.value,
              name: f.name ?? f.value,
            };
          })}
          disabled={disabled}
          required={required}
        />
      ) : null}
      {actualValue?.map((item, idx) => {
        return (
          <input
            key={idx}
            type="hidden"
            name={name + `[]`}
            value={JSON.stringify({
              value: item,
              order: idx,
            })}
          />
        );
      })}
    </>
  );
};

export default PropertyMultiSelector;
