import clsx from "clsx";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import { Input } from "../../input";

export interface RefInputPhone {
  input: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>;
}

interface Props {
  name?: string;
  title?: string;
  withLabel?: boolean;
  defaultValue?: string | undefined;
  value?: string | undefined;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  classNameBg?: string;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  button?: ReactNode;
  lowercase?: boolean;
  uppercase?: boolean;
  type?: string;
  darkMode?: boolean;
  hint?: ReactNode;
  help?: string;
  onBlur?: () => void;
  borderless?: boolean;
  autoFocus?: boolean;
}
export default function InputPhone({
  name,
  title,
  withLabel = true,
  defaultValue,
  value,
  setValue,
  className,
  classNameBg,
  help,
  disabled = false,
  readOnly = false,
  required = false,
  minLength,
  maxLength,
  placeholder,
  pattern,
  hint,
  button,
  lowercase,
  uppercase,
  type = "text",
  darkMode,
  onBlur,
  borderless,
  autoFocus,
}: Props) {
  // useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    // simple phone number validation, no letters or special characters except for +, -, (, and )
    const regex = /^[0-9-+()]*$/;
    if (regex.test(value ?? "")) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [value]);

  function onChange(value: string) {
    if (setValue) {
      if (lowercase) {
        setValue(value.toLowerCase());
      } else if (uppercase) {
        setValue(value.toUpperCase());
      } else {
        setValue(value);
      }
    }
  }

  return (
    <div className={clsx(className, !darkMode && "")}>
      {withLabel && (
        <label htmlFor={name} className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
          <div className="flex items-center space-x-1 truncate">
            <div className="flex space-x-1 truncate">
              <div className="truncate">{title}</div>
              {required && title && <div className="ml-1 text-red-500">*</div>}
            </div>
            <div className="">{help && <HintTooltip text={help} />}</div>
          </div>
          {hint}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="text-muted-foreground h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Input
          ref={input}
          type={type}
          id={name}
          name={name}
          autoComplete={"off"}
          required={required}
          minLength={10}
          maxLength={maxLength}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder ?? "+1 (555) 555-5555"}
          pattern={pattern !== "" && pattern !== undefined ? pattern : undefined}
          autoFocus={autoFocus}
          className="pl-10"
          // className={clsx(
          //   "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
          //   className,
          //   classNameBg,
          //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
          //   "px-10",
          //   borderless && "border-transparent",
          //   !(disabled || readOnly) &&
          //     clsx(
          //       isValid
          //         ? "border-teal-500 focus:border-teal-500 focus:ring-teal-500"
          //         : value
          //         ? "focus:border-accent-500 focus:ring-accent-500 border-red-300"
          //         : "focus:border-accent-500 focus:ring-accent-500 border-gray-300"
          //     )
          // )}
        />
        {!(disabled || readOnly) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? <CheckIcon className="h-4 w-4 text-teal-500" /> : value ? <ExclamationTriangleIcon className="h-4 w-4 text-red-500" /> : null}
          </div>
        )}
        {button}
      </div>
    </div>
  );
}
