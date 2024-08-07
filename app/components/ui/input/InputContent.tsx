import NovelEditor from "~/modules/novel/ui/editor";
import InputText from "./InputText";
import clsx from "clsx";

interface Props {
  contentType: "wysiwyg" | "markdown";
  value: string;
  onChangeValue: (e: string) => void;
  onChangeContentType?: (e: "wysiwyg" | "markdown") => void;
  name?: string;
  className?: string;
  editorLanguage?: string;
  editorTheme?: "vs-dark" | "light";
  autoFocus?: boolean;
  disabled?: boolean;
}
export default function InputContent({
  contentType,
  onChangeContentType,
  value,
  onChangeValue,
  name,
  className,
  editorLanguage = "markdown",
  editorTheme = "vs-dark",
  autoFocus = false,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="grid gap-3">
        <div className="space-y-2">
          {onChangeContentType && (
            <div className="flex items-center space-x-1">
              <button type="button" onClick={() => onChangeContentType("wysiwyg")} className="text-xs text-gray-600 hover:underline">
                <div className={clsx(contentType === "wysiwyg" ? "font-bold" : "")}>WYSIWYG</div>
              </button>
              <div>•</div>
              <button type="button" onClick={() => onChangeContentType("markdown")} className="text-xs text-gray-600 hover:underline">
                <div className={clsx(contentType === "markdown" ? "font-bold" : "")}>Markdown</div>
              </button>
            </div>
          )}
          <input name="contentType" value={contentType} readOnly hidden />
          {contentType === "wysiwyg" ? (
            <div className={clsx(className)}>
              {name && <input type="hidden" name={name} value={value} hidden readOnly />}
              <NovelEditor
                content={value}
                onChange={(e) => onChangeValue(e.html ?? "")}
                usingLocalStorage={false}
                autoFocus={autoFocus}
                disabled={disabled}
                readOnly={disabled}
              />
            </div>
          ) : contentType === "markdown" ? (
            <InputText
              className={clsx(className, "min-h-[500px]")}
              rows={6}
              editor="monaco"
              editorLanguage={editorLanguage}
              editorTheme={editorTheme}
              editorFontSize={14}
              name={name}
              value={value}
              setValue={(e) => onChangeValue(e.toString())}
              autoFocus={autoFocus}
              disabled={disabled}
              readOnly={disabled}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
