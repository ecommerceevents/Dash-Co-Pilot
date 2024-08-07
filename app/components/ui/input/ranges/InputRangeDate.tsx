import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import { Input } from "../../input";

interface Props {
  name: string;
  title: string;
  valueMin?: Date | null;
  defaultValueMin?: Date | null;
  onChangeMin?: (date: Date) => void;
  valueMax?: Date | null;
  defaultValueMax?: Date | null;
  onChangeMax?: (date: Date) => void;
  className?: string;
  help?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hint?: ReactNode;
  icon?: string;
  darkMode?: boolean;
  autoFocus?: boolean;
}
export default function InputDateRangeDate({
  name,
  title,
  valueMin,
  defaultValueMin,
  valueMax,
  defaultValueMax,
  onChangeMin,
  onChangeMax,
  className,
  help,
  disabled = false,
  readOnly = false,
  required = false,
  hint,
  icon,
  darkMode,
  autoFocus,
}: Props) {
  // useImperativeHandle(ref, () => ({ inputMin, inputMax }));
  // const inputMin = useRef<HTMLInputElement>(null);
  // const inputMax = useRef<HTMLInputElement>(null);

  const [actualMin, setActualMin] = useState<string>("");
  const [actualMax, setActualMax] = useState<string>("");

  useEffect(() => {
    const value = valueMin || defaultValueMin;
    if (value) {
      const date = new Date(value);
      if (date) {
        setActualMin(date.toISOString().split("T")[0]);
      }
    }
  }, [defaultValueMin, valueMin]);

  useEffect(() => {
    const value = valueMax || defaultValueMax;
    if (value) {
      const date = new Date(value);
      if (date) {
        setActualMax(date.toISOString().split("T")[0]);
      }
    }
  }, [defaultValueMax, valueMax]);

  useEffect(() => {
    if (onChangeMin && actualMin) {
      const date = new Date(actualMin);
      if (date) {
        onChangeMin(date);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualMin]);

  useEffect(() => {
    if (onChangeMax && actualMax) {
      const date = new Date(actualMax);
      if (date) {
        onChangeMax(date);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualMax]);

  return (
    <div className={clsx(className, !darkMode && "")}>
      <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium">
        <div className=" flex items-center space-x-1">
          <div className="truncate">
            {title}
            {required && <span className="ml-1 text-red-500">*</span>}
          </div>

          {help && <HintTooltip text={help} />}
        </div>
        {hint}
      </label>
      <div className="relative mt-1 flex w-full rounded-md">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <EntityIcon className="text-muted-foreground h-5 w-5" icon={icon} />
          </div>
        )}

        <div className="flex w-full items-center space-x-2">
          <Input
            type="date"
            id={name}
            name={`${name}-min`}
            required={required}
            value={actualMin}
            onChange={(e) => setActualMin(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className={clsx(
              icon && "pl-10"
              // "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
              // className,
              // (disabled || readOnly) && "cursor-not-allowed bg-gray-100",
            )}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            id={name}
            name={`${name}-max`}
            required={required}
            value={actualMax}
            onChange={(e) => setActualMax(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className={clsx(
              icon && "pl-10"
              // "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
              // className,
              // (disabled || readOnly) && "cursor-not-allowed bg-gray-100",
            )}
          />
        </div>
      </div>
    </div>
  );
}
