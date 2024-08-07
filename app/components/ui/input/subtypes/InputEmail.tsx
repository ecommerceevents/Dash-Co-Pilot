import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import { Input } from "../../input";

export interface RefInputEmail {
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
const InputEmail = (
  {
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
  }: Props,
  ref: Ref<RefInputEmail>
) => {
  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const isValid = value?.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    setIsValid(isValid ? true : false);
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
              d="M5.404 14.596A6.5 6.5 0 1116.5 10a1.25 1.25 0 01-2.5 0 4 4 0 10-.571 2.06A2.75 2.75 0 0018 10a8 8 0 10-2.343 5.657.75.75 0 00-1.06-1.06 6.5 6.5 0 01-9.193 0zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
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
          minLength={minLength}
          maxLength={maxLength}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
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
};
export default forwardRef(InputEmail);
