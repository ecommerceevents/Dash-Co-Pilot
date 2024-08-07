import clsx from "clsx";
import { ReactNode } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import { Checkbox } from "../checkbox";

interface Props {
  name: string;
  title: string | ReactNode;
  value?: boolean;
  setValue?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  readOnly?: boolean;
  autoFocus?: boolean;
}
export default function InputCheckboxInline({
  name,
  title,
  value,
  setValue,
  description,
  className,
  help,
  required,
  disabled = false,
  readOnly,
  autoFocus,
}: Props) {
  // useImperativeHandle(ref, () => ({ input }));
  // const input = useRef<HTMLInputElement>(null);
  return (
    <div className={clsx(className, "")}>
      <div className="relative flex cursor-pointer select-none items-start sm:col-span-6">
        <div className="flex h-5 cursor-pointer items-center">
          <Checkbox
            id={name}
            name={name}
            checked={value}
            onCheckedChange={(e) => {
              setValue?.(e === "indeterminate" ? false : e);
            }}
            disabled={disabled}
            autoFocus={autoFocus}
            className={clsx(
              (disabled || readOnly) && "cursor-not-allowed bg-gray-100",
              "text-theme-600 focus:ring-theme-500 h-4 w-4 cursor-pointer rounded border-gray-300"
            )}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="cursor-pointer font-medium">
            <div className=" flex items-center space-x-1">
              <div>
                {title}
                {description}
                {required && <span className="ml-1 text-red-500">*</span>}
              </div>

              {help && <HintTooltip text={help} />}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
