import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import { Input } from "../../input";

export interface RefInputUrl {
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
  autoComplete?: string;
  withTranslation?: boolean;
  translationParams?: string[];
  placeholder?: string;
  pattern?: string;
  rows?: number;
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
const InputUrl = (
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
    autoComplete,
    withTranslation = false,
    translationParams = [],
    placeholder,
    pattern,
    hint,
    rows,
    button,
    lowercase,
    uppercase,
    type = "text",
    darkMode,
    onBlur,
    borderless,
    autoFocus,
  }: Props,
  ref: Ref<RefInputUrl>
) => {
  const { t, i18n } = useTranslation();

  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const isValid = value?.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/);
    setIsValid(isValid ? true : false);
  }, [value]);

  function getTranslation(value: string) {
    if (!i18n.exists(value)) {
      return null;
    }
    return t(value);
  }

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
          {withTranslation && value?.includes(".") && (
            <div className="truncate font-light italic text-slate-600" title={t(value, { 0: translationParams })}>
              {t("admin.pricing.i18n")}:{" "}
              {getTranslation(value) ? (
                <span className="text-slate-600">{t(value, { 0: translationParams })}</span>
              ) : (
                <span className="text-red-600">{t("shared.invalid")}</span>
              )}
            </div>
          )}
          {hint}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="text-muted-foreground h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
            <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
          </svg>
        </div>
        <Input
          ref={input}
          type={type}
          id={name}
          name={name}
          autoComplete={autoComplete}
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
export default forwardRef(InputUrl);
