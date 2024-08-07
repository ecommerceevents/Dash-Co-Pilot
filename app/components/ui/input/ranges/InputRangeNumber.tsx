import clsx from "clsx";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import { Input } from "../../input";

interface Props {
  name?: string;
  title?: string;
  withLabel?: boolean;
  valueMin?: number | null;
  defaultValueMin?: number | undefined;
  onChangeMin?: (value: number) => void;
  valueMax?: number | null;
  defaultValueMax?: number | undefined;
  onChangeMax?: (value: number) => void;
  className?: string;
  help?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hint?: ReactNode;
  step?: string;
  placeholder?: string;
  icon?: string;
  borderless?: boolean;
  autoFocus?: boolean;
}
export default function InputRangeNumber({
  name,
  title,
  withLabel = true,
  valueMin,
  defaultValueMin,
  onChangeMin,
  valueMax,
  defaultValueMax,
  onChangeMax,
  className,
  hint,
  help,
  disabled = false,
  readOnly = false,
  required = false,
  min = 0,
  max,
  step,
  placeholder,
  icon,
  borderless,
  autoFocus,
}: Props) {
  const { t } = useTranslation();

  // useImperativeHandle(ref, () => ({ inputMin, inputMax }));
  // const inputMin = useRef<HTMLInputElement>(null);
  // const inputMax = useRef<HTMLInputElement>(null);

  return (
    <div className={clsx(className, "")}>
      {withLabel && (
        <label htmlFor={name} className="mb-1 flex justify-between space-x-2 text-xs font-medium">
          <div className=" flex items-center space-x-1">
            <div className="truncate">
              {title}
              {required && <span className="ml-1 text-red-500">*</span>}
            </div>

            {help && <HintTooltip text={help} />}
          </div>
          {hint}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <EntityIcon className="text-muted-foreground h-5 w-5" icon={icon} />
          </div>
        )}
        <div className="flex w-full items-center space-x-2">
          <Input
            type="number"
            id={`${name}-min`}
            name={`${name}-min`}
            required={required}
            min={min}
            max={max}
            value={valueMin || undefined}
            defaultValue={defaultValueMin}
            onChange={(e) => (onChangeMin ? onChangeMin(Number(e.currentTarget.value)) : null)}
            step={step}
            placeholder={placeholder ?? t("shared.from") + "..."}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className={clsx(
              icon && "pl-10"
              // "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
              // className,
              // disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
              // icon && "pl-10",
              // borderless && "border-transparent"
            )}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            id={`${name}-max`}
            name={`${name}-max`}
            required={required}
            min={max}
            max={max}
            value={valueMax || undefined}
            defaultValue={defaultValueMax}
            onChange={(e) => (onChangeMax ? onChangeMax(Number(e.currentTarget.value)) : null)}
            step={step}
            placeholder={placeholder ?? t("shared.to") + "..."}
            disabled={disabled}
            readOnly={readOnly}
            className={clsx(
              icon && "pl-10"
              // "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
              // className,
              // disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
              // borderless && "border-transparent"
            )}
          />
        </div>
      </div>
    </div>
  );
}
