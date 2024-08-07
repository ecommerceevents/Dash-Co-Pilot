import { Fragment, useEffect, useRef, useState } from "react";
import MonacoEditor, { MonacoAutoCompletion } from "~/components/editors/MonacoEditor";
import { useCompletion } from "~/modules/novel/lib/ai/react/useCompletion";
import toast from "react-hot-toast";
import clsx from "clsx";
import ArrowsPointingIn from "~/components/ui/icons/ArrowsPointingIn";
import ArrowsPointingOut from "~/components/ui/icons/ArrowsPointingOut";
import Modal from "~/components/ui/modals/Modal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { Form } from "@remix-run/react";
import ClipboardIcon from "~/components/ui/icons/ClipboardIcon";
import QuestionMarkFilledIcon from "~/components/ui/icons/QuestionMarkFilledIcon";
import { RowAsJson } from "~/utils/helpers/TemplateApiHelper";
import { PromptTemplateDto } from "../../dtos/PromptTemplateDto";
import PromptTemplateTest from "./PromptTemplateTest";
import { PromptFlowWithDetails } from "../../db/promptFlows.db.server";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import HandlebarsService from "../../services/HandlebarsService";

type TemplateDto = {
  source: string;
  template: string;
  result: string;
};
interface Props {
  promptFlow?: PromptFlowWithDetails;
  promptTemplate?: PromptTemplateDto;
  value: TemplateDto;
  onChange: (value: TemplateDto) => void;
  autocompletions?: MonacoAutoCompletion[];
  buttons?: React.ReactNode;
  sampleSourceRow: RowAsJson | null;
}

export default function PromptTemplateEditors(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  function onToggleModal() {
    setIsModalOpen(!isModalOpen);
  }

  return (
    <Fragment>
      <Wrapper {...props} isExpanded={false} onToggleExpanded={onToggleModal} />
      <Modal position={1} size="full" open={isModalOpen} setOpen={setIsModalOpen}>
        <Wrapper {...props} isExpanded={true} onToggleExpanded={onToggleModal} />
      </Modal>
    </Fragment>
  );
}

function Wrapper({
  promptFlow,
  promptTemplate,
  value,
  onChange,
  autocompletions,
  isExpanded,
  onToggleExpanded,
  sampleSourceRow,
}: Props & {
  isExpanded: boolean;
  onToggleExpanded: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    try {
      const rendered = HandlebarsService.compile(value.template, JSON.parse(value.source));
      onChange({ ...value, result: rendered });
    } catch (e: any) {
      onChange({ ...value, result: e.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.source, value.template]);

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1 p-1">
          <div className="flex justify-between space-x-2">
            <label className="text-sm font-medium text-gray-800">Template</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowTest(true)}
                disabled={!sampleSourceRow}
                className={clsx(!sampleSourceRow ? "cursor-not-allowed text-gray-500 opacity-50" : "hover:text-gray-800")}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button type="button" onClick={() => setShowHelp(true)}>
                <QuestionMarkFilledIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-800" />
              </button>
              <button type="button" onClick={onToggleExpanded}>
                {isExpanded ? (
                  <ArrowsPointingIn className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-800" />
                ) : (
                  <ArrowsPointingOut className="h-5 w-5 rotate-180 transform cursor-pointer text-gray-500 hover:text-gray-800" />
                )}
              </button>
            </div>
            {/* {value.source && (
              <Fragment>
                <DropdownStyless
                  title="Options"
                  options={[
                    {
                      title: "Suggest Template Syntax",
                      onClick: onSuggestTemplate,
                    },
                  ]}
                />
              </Fragment>
            )} */}
          </div>
          <MonacoEditor
            theme="vs-dark"
            className={clsx(isExpanded ? "h-[calc(50vh-100px)]" : "h-[calc(35vh-100px)]")}
            value={value.template}
            onChange={(template) => onChange({ ...value, template })}
            fontSize={13}
            autocompletions={autocompletions}
            language="yaml"
          />
        </div>

        <div className={clsx("p-1")}>
          <div className="flex justify-between space-x-2">
            <label className="mb-1 text-sm font-medium text-gray-800">Source (READ-ONLY)</label>
          </div>
          <MonacoEditor
            theme="vs-dark"
            className={clsx(isExpanded ? "h-[calc(50vh-100px)]" : "h-[calc(35vh-100px)]")}
            value={value.source}
            onChange={(source) => onChange({ ...value, source })}
            fontSize={13}
            language="yaml"
          />
        </div>
        <div className={clsx("p-1")}>
          <div className="flex justify-between space-x-2">
            <label className="mb-1 text-sm font-medium text-gray-800">Result (READ-ONLY)</label>
          </div>
          <MonacoEditor
            theme="vs-dark"
            className={clsx(isExpanded ? "h-[calc(50vh-100px)]" : "h-[calc(35vh-100px)]")}
            value={value.result}
            onChange={(result) => onChange({ ...value, result })}
            fontSize={13}
            language="yaml"
          />
        </div>
      </div>

      <SlideOverWideEmpty
        className="sm:max-w-2xl"
        position={2}
        title={"What do you want to generate"}
        open={showHelp}
        onClose={() => {
          setShowHelp(false);
        }}
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <HelpForm template={value} />
        </div>
      </SlideOverWideEmpty>

      {promptTemplate && promptFlow && (
        <SlideOverWideEmpty
          className="sm:max-w-2xl"
          position={2}
          title={"Try: " + promptTemplate.title + " - " + promptFlow.title}
          open={showTest}
          onClose={() => setShowTest(false)}
          overflowYScroll={true}
        >
          <div className="-mx-1 -mt-3">
            <PromptTemplateTest promptFlow={promptFlow} item={promptTemplate} templateDto={value} row={sampleSourceRow} />
          </div>
        </SlideOverWideEmpty>
      )}
    </div>
  );
}

function HelpForm({ template }: { template: TemplateDto }) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [compiled, setCompiled] = useState("");
  const [error, setError] = useState("");

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { complete, completion, isLoading, stop } = useCompletion({
    id: "prompt-templates-syntax",
    api: "/api/ai/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        // va.track("Rate Limit Reached");
        return;
      }
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  useEffect(() => {
    if (completion) {
      setResult(completion);
    }
  }, [completion]);

  useEffect(() => {
    try {
      const rendered = HandlebarsService.compile(result, JSON.parse(template.source));
      setCompiled(rendered);
      setError("");
    } catch (e: any) {
      setCompiled(e.message);
      setError(e.message);
    }
  }, [template.source, result]);

  function getKeysWithStructure(obj: any): any {
    let keysObject: any = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
      if (typeof obj[key] === "object") {
        keysObject[key] = getKeysWithStructure(obj[key]);
      } else {
        keysObject[key] = null; // replace with undefined or any other value if needed
      }
    }

    return keysObject;
  }
  function getObjectStructure() {
    let keysWithStructure = getKeysWithStructure(JSON.parse(template.source));
    const objectString = JSON.stringify(keysWithStructure, null, 2);
    return objectString;
  }
  function onGetSuggestions(e: React.FormEvent<HTMLFormElement>) {
    setResult("");
    e.preventDefault();

    const objectString = getObjectStructure();

    setHasSubmitted(true);
    complete(value, {
      body: {
        systemContent: `You are an AI assistant that gives handlerbar.js syntax (with no explanations, no HTML format) to display what the user needs given the following JSON structure. Respond only with the template syntax. \n\n${objectString}`,
      },
    });
  }

  return (
    <div className="space-y-2">
      <Form onSubmit={onGetSuggestions} className="space-y-2">
        <InputText ref={mainInput} value={value} setValue={setValue} required placeholder="e.g. iterate product names and quantities..." rows={5} />
        <div className="flex justify-end">
          <LoadingButton type="submit" isLoading={isLoading}>
            Get Suggestions
          </LoadingButton>
        </div>
      </Form>

      <div className="space-y-2 border-t border-gray-200 pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-1/2 space-y-1">
            <div className="flex justify-between space-x-2">
              <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
                <span>Template Syntax</span>
              </label>
            </div>

            <div className="h-[calc(100vh-250px)] overflow-y-scroll break-words rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-600">{result}</div>
          </div>

          <div className="w-1/2 space-y-1">
            <div className="flex justify-between space-x-2">
              <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
                <span>Result</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success("Copied to clipboard");
                }}
              >
                <ClipboardIcon className="h-5 w-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <div className="h-[calc(100vh-250px)] overflow-y-scroll break-words rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-600">
              {hasSubmitted && isLoading ? (
                <span>Loading...</span>
              ) : compiled ? (
                <span className={clsx(error ? "text-red-500" : "")}>{compiled}</span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
