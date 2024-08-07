import { useState } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import { PageConfiguration } from "~/modules/pageBlocks/dtos/PageConfiguration";
import PageBlockPromptUtils from "../prompts/PageBlockPromptUtils";

interface Props {
  page: PageConfiguration | undefined;
  className: string;
  onGenerate: (value: string) => void;
  children: React.ReactNode;
}
export default function ChatGptSetParametersButton({ page, className, onGenerate, children }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [parameters, setParameters] = useState<string>(PageBlockPromptUtils.getDefaultPrompt(page));
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <Modal open={open} setOpen={() => setOpen(false)}>
        <div className="space-y-3 text-gray-800">
          <InputText
            autoFocus={true}
            title="Context"
            editor="monaco"
            editorLanguage="markdown"
            editorOptions={{
              wordWrap: "on",
            }}
            value={parameters}
            editorSize="lg"
            setValue={(e) => setParameters(e ?? "")}
          />
          <div className="flex justify-end space-x-2">
            <ButtonSecondary onClick={() => setOpen(false)}>Cancel</ButtonSecondary>
            <ButtonPrimary
              onClick={() => {
                onGenerate(parameters ?? "");
                setOpen(false);
              }}
            >
              Generate
            </ButtonPrimary>
          </div>
        </div>
      </Modal>
    </div>
  );
}
