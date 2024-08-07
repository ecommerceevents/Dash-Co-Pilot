import { RadioGroup } from "@headlessui/react";
import { ReactNode } from "react";
import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  name?: string;
  title?: string;
  options: { name: string | ReactNode; value: string | number | undefined; disabled?: boolean }[];
  value?: string | number | undefined;
  setValue?: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}
export default function InputRadioGroup({ name, title, value, options, setValue, className, required, disabled }: Props) {
  return (
    <div className={clsx(className, "w-full flex-grow")}>
      <div className="flex items-center justify-between">
        <label className="flex justify-between space-x-2 truncate text-xs font-medium">
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      <input type="hidden" name={name} value={value} hidden readOnly />

      <RadioGroup disabled={disabled} defaultValue={value} value={value} onChange={(e) => (setValue ? setValue(e) : {})} className="mt-1">
        <RadioGroup.Label className="sr-only">{title}</RadioGroup.Label>
        <div className={clsx("flex flex-col flex-wrap space-y-1 sm:flex-row sm:space-x-2 sm:space-y-0")}>
          {options.map((option, idx) => (
            <RadioGroup.Option
              key={idx}
              value={option.value}
              className={({ active, checked }) =>
                clsx(
                  "w-auto sm:w-1/2",
                  !option.disabled && !disabled ? "cursor-pointer focus:outline-none " : "cursor-not-allowed opacity-25",
                  active ? "ring-ring ring-2" : "",
                  checked ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent" : "",
                  "flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium uppercase sm:flex-1"
                )
              }
              disabled={option.disabled}
            >
              <RadioGroup.Label as="p">{option.name}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
