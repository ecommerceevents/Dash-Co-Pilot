import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import HintTooltip from "../tooltips/HintTooltip";
import { useState, useEffect } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import CheckFilledCircleIcon from "../icons/CheckFilledCircleIcon";

type ItemDto = {
  value: string | number;
  name: string;
  color?: Colors;
  icon?: JSX.Element;
  disabled?: boolean;
  renderName?: React.ReactNode;
};
export default function InputRadioGroupCards({
  title,
  name,
  options,
  defaultValue,
  value,
  onChange,
  required,
  disabled,
  help,
  hint,
  columns,
  className,
  display,
}: {
  title?: string;
  name?: string;
  options: ItemDto[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  help?: string;
  hint?: React.ReactNode;
  columns?: number;
  className?: string;
  display?: "name" | "value" | "nameAndValue";
}) {
  const [displayType, setDisplayType] = useState<"name" | "value" | "nameAndValue">("name");

  const [actualValue, setActualValue] = useState<string | undefined>(value || defaultValue);

  useEffect(() => {
    if (actualValue && onChange && value !== actualValue) {
      onChange(actualValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualValue]);

  useEffect(() => {
    if (display) {
      setDisplayType(display);
    } else {
      const hasNames = options.some((item) => item.name);
      if (!hasNames) {
        setDisplayType("value");
      } else {
        const namesAreDifferent = options.some((item) => item.name !== item.value.toString());
        if (namesAreDifferent) {
          setDisplayType("nameAndValue");
        } else {
          setDisplayType("name");
        }
      }
    }
  }, [display, options]);
  return (
    <RadioGroup value={actualValue} defaultValue={defaultValue} onChange={(e) => setActualValue(e)} className={className}>
      {title && (
        <RadioGroup.Label htmlFor={name} className="mb-1 flex justify-between space-x-2 text-xs font-medium">
          <div className=" flex items-center space-x-1">
            <div className="truncate">
              {title}
              {required && <span className="ml-1 text-red-500">*</span>}
            </div>

            {help && <HintTooltip text={help} />}
          </div>
          {hint}
        </RadioGroup.Label>
      )}
      <input type="hidden" name={name} value={actualValue} hidden readOnly />
      <div
        className={clsx(
          "grid w-full grid-cols-1 gap-3",
          columns === undefined && "md:grid-cols-3",
          columns === 1 && "md:grid-cols-1",
          columns === 2 && "md:grid-cols-2",
          columns === 3 && "md:grid-cols-3",
          columns === 4 && "md:grid-cols-4",
          columns === 5 && "md:grid-cols-5",
          columns === 6 && "md:grid-cols-6",
          columns === 7 && "md:grid-cols-7",
          columns === 8 && "md:grid-cols-8",
          columns === 9 && "md:grid-cols-9",
          columns === 10 && "md:grid-cols-10",
          columns === 11 && "md:grid-cols-11",
          columns === 12 && "md:grid-cols-12"
        )}
      >
        {options.map((item) => (
          <RadioGroup.Option
            key={item.value}
            value={item.value}
            disabled={disabled || item.disabled}
            className={({ checked, active }) =>
              clsx(
                checked ? "ring-ring border-transparent" : "",
                active ? "" : "",
                "relative flex rounded-lg border p-3 shadow-sm focus:outline-none",
                disabled || item.disabled ? "text-muted-foreground cursor-not-allowed opacity-60" : "cursor-pointer"
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="w-full truncate">
                  <span className="flex w-full select-none flex-col">
                    {item.icon ? (
                      <div className="flex w-full justify-center truncate">{item.icon}</div>
                    ) : (
                      <>
                        <RadioGroup.Label as="span" className={clsx("block truncate text-sm", !disabled ? "font-medium" : "")}>
                          {["name", "nameAndValue"].includes(displayType) ? <span>{item.renderName ? item.renderName : item.name}</span> : item.value}
                        </RadioGroup.Label>
                        {["nameAndValue", "value"].includes(displayType) && (
                          <RadioGroup.Description as="span" className="mt-1 flex items-center truncate text-sm">
                            {item.value}
                          </RadioGroup.Description>
                        )}
                      </>
                    )}
                  </span>
                </span>
                <CheckFilledCircleIcon className={clsx("flex-shrink-0", !checked ? "invisible hidden" : "flex", " text-primary h-5 w-5")} aria-hidden="true" />
                <span
                  className={clsx(
                    checked || active ? " ring-ring border-transparent ring-2" : "",
                    // checked ? "border-gray-300" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
