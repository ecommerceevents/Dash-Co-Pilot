import { Editor } from "@tiptap/core";
import clsx from "clsx";
import { SparklesIcon } from "lucide-react";
import { FC } from "react";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";

export interface BubblePromptMenuItem {
  id: string;
  name: string;
}

interface PromptSelectorProps {
  items: PromptFlowWithDetails[];
  editor: Editor;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRun: (
    promptFlow: PromptFlowWithDetails,
    data: {
      text: string;
      selectedText: string;
    }
  ) => void;
}

export const PromptSelector: FC<PromptSelectorProps> = ({ editor, items, isOpen, setIsOpen, onRun }) => {
  function onRunPrompt(item: PromptFlowWithDetails) {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    // eslint-disable-next-line no-console
    console.log({
      selectedText,
    });

    editor.commands.setTextSelection(0);

    onRun(item, {
      text: editor.getText(),
      selectedText,
    });
  }

  return (
    <div className="relative h-full">
      <button
        type="button"
        className="flex h-full items-center gap-1 p-2 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: "#000000" }}>AI</span>

        <SparklesIcon className="h-4 w-4 text-violet-500 " />
      </button>

      {isOpen && (
        <section className="animate-in fade-in slide-in-from-top-1 fixed top-full z-[99999] mt-1 flex w-48 flex-col overflow-hidden rounded border border-stone-200 bg-white p-1 shadow-xl">
          {items.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={() => {
                onRunPrompt(item);
                setIsOpen(false);
              }}
              className={clsx("flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100", {
                // "text-blue-600": editor.isActive("textStyle", { color }),
              })}
            >
              <div className="flex items-center space-x-2">
                {/* <div className="rounded-sm border border-stone-200 px-1 py-px font-medium">A</div> */}
                <span>{item.actionTitle ?? item.title}</span>
              </div>
              {/* {editor.isActive("textStyle", { color }) && <Check className="h-4 w-4" />} */}
            </button>
          ))}
        </section>
      )}
    </div>
  );
};
