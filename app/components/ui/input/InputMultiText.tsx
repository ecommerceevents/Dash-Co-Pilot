import React, { useState, useRef, useEffect, KeyboardEvent, ReactNode, RefObject, Ref, forwardRef, useImperativeHandle } from "react";
import clsx from "clsx";
import HintTooltip from "../tooltips/HintTooltip";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import { useTranslation } from "react-i18next";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { SeparatorFormatType } from "~/utils/shared/SeparatorUtils";
import { Input } from "../input";

export interface RefInputMultiText {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name?: string;
  title?: string;
  withLabel?: boolean;
  value?: RowValueMultipleDto[];
  className?: string;
  classNameBg?: string;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  translationParams?: string[];
  placeholder?: string;
  pattern?: string;
  rows?: number;
  button?: ReactNode;
  lowercase?: boolean;
  uppercase?: boolean;
  darkMode?: boolean;
  hint?: ReactNode;
  help?: string;
  icon?: string;
  onBlur?: () => void;
  borderless?: boolean;
  autoFocus?: boolean;
  separator?: SeparatorFormatType;
}

const InputMultiText = (
  {
    name,
    title,
    withLabel = true,
    value,
    className,
    classNameBg,
    help,
    disabled = false,
    readOnly = false,
    required = false,
    minLength,
    maxLength,
    autoComplete,
    placeholder,
    pattern,
    hint,
    rows,
    button,
    lowercase,
    uppercase,
    darkMode,
    icon,
    onBlur,
    borderless,
    autoFocus,
    separator = ",",
  }: Props,
  ref: Ref<RefInputMultiText>
) => {
  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");

  const [actualValue, setActualValue] = useState<(string | number)[]>([]);

  useEffect(() => {
    const selection = value?.map((f) => f.value) ?? [];
    if (selection.sort().join(",") !== actualValue.sort().join(",")) {
      setActualValue(selection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (separator === e.key) {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        setActualValue?.((prevTags) => [...prevTags, inputValue.trim()]);
        setInputValue("");
      }
    }

    if (e.key === "Backspace" && inputValue === "") {
      setActualValue?.((prevTags) => prevTags.slice(0, prevTags.length - 1));
    }
  };

  const removeTag = (index: number) => {
    setActualValue?.((prevTags) => prevTags.filter((_, i) => i !== index));
  };

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

      {actualValue.map((item, idx) => {
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

      <div className={clsx("relative flex w-full rounded-md")}>
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <EntityIcon className="text-muted-foreground h-5 w-5" icon={icon} />
          </div>
        )}
        <div className="flex w-full flex-wrap items-center">
          {actualValue?.map((tag, index) => (
            <div key={index} className="border-border bg-secondary m-0.5 flex items-center rounded border px-2 py-2 text-sm">
              <span>{tag}</span>
              {!disabled && !readOnly && (
                <button
                  type="button"
                  disabled={disabled}
                  className="text-muted-foreground focus:text-foreground ml-2 flex-shrink-0"
                  onClick={() => removeTag(index)}
                >
                  &#10005;
                </button>
              )}
            </div>
          ))}

          {!disabled && !readOnly && (
            <Input
              type="text"
              ref={input}
              value={inputValue}
              onChange={(e) => {
                if (lowercase) {
                  setInputValue(e.target.value.toLowerCase());
                } else if (uppercase) {
                  setInputValue(e.target.value.toUpperCase());
                } else {
                  setInputValue(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder ?? t("shared.typeAndPressTo", { 0: separator, 1: t("shared.add").toLowerCase() })}
              id={name}
              autoComplete={autoComplete}
              // required={required}
              minLength={minLength}
              maxLength={maxLength}
              // defaultValue={value}
              onBlur={() => {
                if (inputValue.trim() !== "") {
                  setActualValue?.((prevTags) => [...prevTags, inputValue.trim()]);
                  setInputValue("");
                }
                if (onBlur) {
                  onBlur();
                }
              }}
              disabled={disabled}
              readOnly={readOnly}
              pattern={pattern !== "" && pattern !== undefined ? pattern : undefined}
              autoFocus={autoFocus}
              className={clsx(
                "m-0.5 min-w-0 flex-1",
                icon && "rounded-md pl-10"
                // "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                // className,
                // classNameBg,
                // disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
                // borderless && "border-transparent"
              )}
            />
          )}
        </div>
        {button}
      </div>
    </div>
  );
};

export default forwardRef(InputMultiText);
