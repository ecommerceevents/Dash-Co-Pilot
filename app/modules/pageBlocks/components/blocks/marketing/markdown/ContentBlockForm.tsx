import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputText from "~/components/ui/input/InputText";
import { defaultContentBlock, ContentBlockDto, ContentBlockStyle, ContentBlockStyles } from "./ContentBlockUtils";
import Editor from "~/modules/novel/ui/editor";
import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";

export default function ContentBlockForm({ item, onUpdate }: { item?: ContentBlockDto; onUpdate: (item: ContentBlockDto) => void }) {
  const [state, setState] = useState<ContentBlockDto>(item || defaultContentBlock);
  const [contentType, setContentType] = useState<"markdown" | "wysiwyg">("wysiwyg");
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-4">
      <InputGroup title="Design">
        <InputRadioGroup
          title="Style"
          value={state.style}
          setValue={(value) => setState({ ...state, style: value as ContentBlockStyle })}
          options={ContentBlockStyles.map((f) => f)}
        />
      </InputGroup>
      <InputGroup title="Copy">
        <InputGroup
          title="Content"
          right={
            <>
              {/* <button type="button" className="text-sm font-medium underline" onClick={onPreview}>
                {t("shared.preview")}
              </button> */}
            </>
          }
        >
          <InputRadioGroupCards
            name="contentType"
            columns={2}
            className="w-full"
            title="Type"
            value={contentType}
            onChange={(e) => setContentType(e as any)}
            display={"name"}
            options={[
              { value: "wysiwyg", name: "WYSIWYG" },
              { value: "markdown", name: "Markdown" },
            ]}
          />
        </InputGroup>
        <div className="space-y-2">
          {/* <InputText
            editor="monaco"
            editorLanguage="markdown"
            title="Content"
            type="content"
            value={state.content}
            setValue={(e) => setState({ ...state, content: e.toString() })}
            editorSize="lg"
          /> */}
          {contentType === "wysiwyg" ? (
            <div>
              <input type="hidden" name="content" value={state.content} hidden readOnly />
              {typeof window !== "undefined" && <Editor content={state.content} onChange={(e) => setState({ ...state, content: e.html ?? "" })} />}
            </div>
          ) : contentType === "markdown" ? (
            <InputGroup title="">
              <div className="grid grid-cols-12 gap-3 rounded-md bg-white">
                <InputText
                  className="col-span-12"
                  rows={6}
                  editor="monaco"
                  editorLanguage="markdown"
                  editorTheme="light"
                  editorSize="screen"
                  name="content"
                  value={state.content}
                  setValue={(e) => setState({ ...state, content: e.toString() })}
                  required
                />
              </div>
            </InputGroup>
          ) : null}
        </div>
      </InputGroup>
    </div>
  );
}
