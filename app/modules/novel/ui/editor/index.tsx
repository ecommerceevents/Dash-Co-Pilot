import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { TiptapEditorProps } from "./props";
import { TiptapExtensions } from "./extensions";
import { useCompletion } from "../../lib/ai/react/useCompletion";
import { toast } from "sonner";
import { EditorBubbleMenu } from "./components";
import { Editor, EditorOptions, JSONContent } from "@tiptap/core";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import RunPromptFlowForm from "~/modules/promptBuilder/components/run/RunPromptFlowForm";
import clsx from "clsx";

type ValueDto = {
  html?: string;
  json?: JSONContent;
  text?: string;
};
interface Props {
  content: string | JSONContent | undefined;
  onChange: (value: ValueDto) => void;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  promptFlows?: { rowId: string | undefined; prompts: PromptFlowWithDetails[] } | undefined;
  autoFocus?: boolean;
  darkMode?: boolean;
  usingLocalStorage?: boolean;
}
export default function NovelEditor({
  content,
  onChange,
  readOnly,
  disabled,
  promptFlows,
  className = "min-h-[500px]",
  autoFocus = true,
  darkMode,
  usingLocalStorage,
}: Props) {
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [selectedPrompt, setSelectedPrompt] = useState<{
    prompt: PromptFlowWithDetails;
    data: {
      text: string;
      selectedText: string;
    };
  } | null>(null);

  const [hydrated, setHydrated] = useState(false);

  const debouncedUpdates = useCallback(
    ({ editor }: { editor: Editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const text = editor.getText();
      setSaveStatus("Saving...");
      // onChange(json);
      onChange({
        json,
        html,
        text,
      });
      // Simulate a delay in saving.
      // setTimeout(() => {
      setSaveStatus("Saved");
      // }, 500);
    },
    [onChange]
  );

  let options: Partial<EditorOptions> = {
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus("Saving...");
      const selection = e.editor.state.selection;
      const lastTwo = e.editor.state.doc.textBetween(selection.from - 2, selection.from, "\n");
      if (lastTwo === "++" && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(e.editor.getText(), {
          body: {
            systemContent:
              "You are an AI writing assistant that continues existing text based on context from prior text. " +
              "Give more weight/priority to the later characters than the beginning ones. Make sure to construct complete sentences.",
          },
        });
        // va.track("Autocomplete Shortcut Used");
      } else {
        debouncedUpdates(e);
      }
    },
  };
  if (autoFocus) {
    options.autofocus = "start";
  } else {
    options.autofocus = false;
  }
  const editor = useEditor(options);

  const { complete, completion, isLoading, stop } = useCompletion({
    id: "novel",
    api: "/api/ai/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        // va.track("Rate Limit Reached");
        return;
      }
    },
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  const prev = useRef("");

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff, {
      parseOptions: {
        preserveWhitespace: "full",
      },
    });
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
        stop();
        if (e.key === "Escape") {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent("++");
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm("AI writing paused. Continue?")) {
        complete(editor?.getText() || "", {
          body: {
            systemContent:
              "You are an AI writing assistant that continues existing text based on context from prior text. " +
              "Give more weight/priority to the later characters than the beginning ones. Make sure to construct complete sentences.",
          },
        });
      }
    };
    if (isLoading) {
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", mousedownHandler);
    } else {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content);
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  function getPromptFlows() {
    return promptFlows?.prompts?.filter((f) => f.inputVariables.find((f) => f.name === "selectedText"));
  }
  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className={clsx(
        "border-border bg-background relative w-full max-w-screen-lg border p-12 px-8 sm:rounded-lg sm:border sm:px-12 sm:shadow-lg",
        className,
        darkMode && "dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200"
      )}
    >
      {usingLocalStorage && (
        <div
          className={clsx(
            "bg-secondary text-secondary-foreground absolute right-5 top-5 mb-5 rounded-lg px-2 py-1 text-sm",
            darkMode && "dark:bg-gray-800 dark:text-slate-200"
          )}
        >
          {saveStatus}
        </div>
      )}
      {/* value: {JSON.stringify(value)} */}
      {editor ? (
        <>
          <EditorContent editor={editor} readOnly={readOnly} disabled={disabled} />
          <EditorBubbleMenu editor={editor} promptFlows={getPromptFlows()} onRunPromptFlow={(prompt, data) => setSelectedPrompt({ prompt, data })} />

          <div className="z-50">
            <SlideOverWideEmpty
              title={selectedPrompt?.prompt.actionTitle ?? "Run prompt flow"}
              className="sm:max-w-2xl"
              open={!!selectedPrompt}
              onClose={() => setSelectedPrompt(null)}
            >
              {selectedPrompt && (
                <RunPromptFlowForm item={selectedPrompt.prompt} rowId={promptFlows?.rowId} autoRun={true} initialVariables={selectedPrompt.data} />
              )}
            </SlideOverWideEmpty>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
