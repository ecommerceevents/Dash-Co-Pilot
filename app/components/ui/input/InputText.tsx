import clsx from "clsx";
import { forwardRef, Fragment, ReactNode, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import Editor from "@monaco-editor/react";
import NovelEditor from "~/modules/novel/ui/editor";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { Input } from "../input";
import { Textarea } from "../textarea";

export interface RefInputText {
  input: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>;
  textArea: RefObject<HTMLTextAreaElement>;
}

type EditorSize = "sm" | "md" | "lg" | "auto" | "full" | "screen";

type WithDefaultValue = { defaultValue: string | undefined };
type WithValueAndSetValue = { value: string | undefined; setValue: React.Dispatch<React.SetStateAction<string>> };

export type InputTextProps = (WithDefaultValue | WithValueAndSetValue) & {
  id?: string;
  name?: string;
  title?: string;
  withLabel?: boolean;
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
  // lowercase?: boolean;
  // uppercase?: boolean;
  type?: string;
  darkMode?: boolean;
  hint?: ReactNode;
  help?: string;
  icon?: string;
  editor?: string; // monaco
  editorLanguage?: string; // "javascript" | "typescript" | "html" | "css" | "json";
  editorHideLineNumbers?: boolean;
  editorTheme?: "vs-dark" | "light";
  editorFontSize?: number;
  editorOptions?: any;
  onBlur?: () => void;
  onFocus?: () => void;
  borderless?: boolean;
  editorSize?: EditorSize;
  autoFocus?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  promptFlows?: { rowId: string | undefined; prompts: PromptFlowWithDetails[] } | undefined;
  hideChars?: boolean;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
};
const InputText = (props: InputTextProps, ref: Ref<RefInputText>) => {
  const {
    id,
    name,
    title,
    withLabel = true,
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
    // lowercase,
    // uppercase,
    type = "text",
    darkMode,
    icon,
    editor,
    editorLanguage,
    editorHideLineNumbers,
    editorTheme = "vs-dark",
    editorFontSize,
    editorOptions,
    onBlur,
    onFocus,
    borderless,
    editorSize = "sm",
    autoFocus,
    // isError,
    // isSuccess,
    promptFlows,
    hideChars,
    onPaste,
  } = props;

  const { t, i18n } = useTranslation();

  const value = "value" in props ? props.value : undefined;
  const setValue = "setValue" in props ? props.setValue : undefined;
  const defaultValue = "defaultValue" in props ? props.defaultValue : undefined;

  const [actualEditorSize] = useState<EditorSize>(editorSize ?? ("sm" as EditorSize));

  useImperativeHandle(ref, () => ({ input, textArea }));
  const input = useRef<HTMLInputElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);

  const [actualValue, setActualValue] = useState<string>(value ?? defaultValue ?? "");

  useEffect(() => {
    setActualValue(value || defaultValue || "");
  }, [value, defaultValue]);

  useEffect(() => {
    if (setValue && actualValue !== value) {
      setValue(actualValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualValue]);

  function getTranslation(value: string) {
    if (!i18n.exists(value)) {
      return null;
    }
    return t(value);
  }

  function onChange(value: string) {
    setActualValue(value);
    if (setValue) {
      setValue(value);
      // if (lowercase) {
      //   setValue(value.toLowerCase());
      // } else if (uppercase) {
      //   setValue(value.toUpperCase());
      // } else {
      //   setValue(value);
      // }
    }
  }

  return (
    <div className={clsx(className, !darkMode && "")}>
      {withLabel && title && (
        <label htmlFor={name} className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
          <div className="flex flex-shrink-0 items-center space-x-1 truncate">
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
          {/* {editor === "wysiwyg" && <ChangeEditorSize value={actualEditorSize} onChange={(value) => setActualEditorSize(value)} />} */}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        {editor === "monaco" && editorLanguage ? (
          <>
            <textarea hidden readOnly name={name} value={actualValue} />
            {typeof window !== "undefined" && (
              <Editor
                theme={editorTheme}
                className={clsx(
                  "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                  actualEditorSize === "sm" && "h-32",
                  actualEditorSize === "md" && "h-64",
                  actualEditorSize === "lg" && "h-96",
                  actualEditorSize === "auto" && "h-auto",
                  actualEditorSize === "full" && "h-full",
                  actualEditorSize === "screen" && "h-screen",
                  className,
                  classNameBg,
                  editorHideLineNumbers && "-ml-10",
                  borderless && "border-transparent"
                )}
                defaultLanguage={editorLanguage}
                language={editorLanguage}
                options={{
                  fontSize: editorFontSize,
                  renderValidationDecorations: "off",
                  wordWrap: "on",
                  readOnly: disabled || readOnly,
                  ...editorOptions,
                }}
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange(e ?? "")}
              />
            )}
          </>
        ) : editor === "wysiwyg" ? (
          <>
            <textarea hidden readOnly name={name} value={actualValue} />

            <NovelEditor
              autoFocus={autoFocus}
              key={promptFlows?.rowId ?? name ?? "novel-editor"}
              readOnly={readOnly || disabled}
              disabled={disabled}
              darkMode={darkMode}
              className={clsx(
                actualEditorSize === "sm" && "min-h-[100px]",
                actualEditorSize === "md" && "min-h-[300px]",
                actualEditorSize === "lg" && "min-h-[500px]",
                actualEditorSize === "auto" && "h-auto",
                actualEditorSize === "full" && "h-full",
                actualEditorSize === "screen" && "h-screen",
                borderless && "border-transparent"
              )}
              content={value || defaultValue}
              onChange={(e) => onChange(e?.html ?? "")}
              promptFlows={promptFlows}
            />
          </>
        ) : !rows ? (
          <>
            {icon && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EntityIcon className="h-5 w-5 text-gray-400" icon={icon} />
              </div>
            )}
            <Input
              ref={input}
              type={type}
              style={hideChars ? ({ WebkitTextSecurity: "disc" } as any) : {}}
              id={id ?? name}
              name={name}
              autoComplete={autoComplete}
              required={required}
              minLength={minLength}
              maxLength={maxLength}
              defaultValue={defaultValue}
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              pattern={pattern !== "" && pattern !== undefined ? pattern : undefined}
              autoFocus={autoFocus}
              className={clsx(className)}
              // className={clsx(
              //   "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
              //   className,
              //   classNameBg,
              //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
              //   icon && "pl-10",
              //   borderless && "border-transparent",
              //   isError && "border-red-300 bg-red-100 text-red-900",
              //   isSuccess && "bg-real-100 border-real-300 text-real-900"
              // )}
              onPaste={onPaste}
            />
            {button}
          </>
        ) : (
          <Textarea
            rows={rows}
            ref={textArea}
            style={hideChars ? ({ WebkitTextSecurity: "disc" } as any) : {}}
            id={id ?? name}
            name={name}
            autoComplete={autoComplete}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            defaultValue={defaultValue}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            autoFocus={autoFocus}
            // className={clsx(
            //   "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
            //   className,
            //   classNameBg,
            //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
            //   borderless && "border-transparent",
            //   isError && "border-red-300 bg-red-100 text-red-900",
            //   isSuccess && "bg-real-100 border-real-300 text-real-900"
            // )}
          />
        )}
      </div>
    </div>
  );
};

// function ChangeEditorSize({ value, onChange }: { value: string; onChange: (value: EditorSize) => void }) {
//   const sizes: EditorSize[] = ["sm", "md", "lg", "auto", "screen"];
//   return (
//     <div className="flex items-center space-x-1">
//       {sizes.map((size, idx) => {
//         return (
//           <Fragment key={idx}>
//             <button type="button" onClick={() => onChange(size)} className="text-xs text-gray-600 hover:underline">
//               <div className={clsx(value === size ? "font-bold" : "")}>{size}</div>
//             </button>
//             {idx !== sizes.length - 1 && <div>•</div>}
//           </Fragment>
//         );
//       })}
//     </div>
//   );
// }

export default forwardRef(InputText);
