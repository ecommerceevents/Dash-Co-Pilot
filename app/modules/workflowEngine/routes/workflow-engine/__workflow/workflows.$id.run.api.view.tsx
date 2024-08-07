import { Form, Link, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import MonacoEditor from "~/components/editors/MonacoEditor";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText from "~/components/ui/input/InputText";
import WorkflowInputExamplesDropdown from "~/modules/workflowEngine/components/workflows/buttons/WorkflowInputExamplesDropdown";
import WorkflowRunDropdown from "~/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import WorkflowUtils from "~/modules/workflowEngine/helpers/WorkflowUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { WorkflowsIdRunApiApi } from "./workflows.$id.run.api.server";
import clsx from "clsx";
import { WorkflowExecutionDto } from "~/modules/workflowEngine/dtos/WorkflowExecutionDto";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";

export default function WorkflowsIdRunApiApiView() {
  const data = useTypedLoaderData<WorkflowsIdRunApiApi.LoaderData>();
  const actionData = useTypedActionData<WorkflowsIdRunApiApi.ActionData>();
  const params = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [execution, setExecution] = useState<WorkflowExecutionDto | null>(null);
  const [inputData, setInputData] = useState("{}");
  const [waitingBlockInput, setWaitingBlockInput] = useState("");

  const waitingForInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => {
      waitingForInputRef.current?.focus();
    }, 100);
  }, [execution]);

  useEffect(() => {
    if (data.workflow.inputExamples.length > 0) {
      setSelectedTemplate(data.workflow.inputExamples[0].title);
      setInputData(JSON.stringify(data.workflow.inputExamples[0].input, null, 2));
    }
  }, [data]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }

    if (actionData?.execution) {
      setExecution(actionData.execution);
    }
  }, [actionData]);

  function onExecute() {
    const form = new FormData();
    form.append("action", "execute");
    form.append("input", inputData);
    submit(form, {
      method: "post",
    });
  }

  function onSubmitWaitingBlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("action", "continue-execution");
    form.set("executionId", execution?.id ?? "");
    form.set("input", JSON.stringify({ input: waitingBlockInput }));
    submit(form, {
      method: "post",
    });
    setWaitingBlockInput("");
  }
  return (
    <div>
      <div className="w-full border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <BreadcrumbSimple
          menu={[{ title: "Workflows", routePath: UrlUtils.getModulePath(params, `workflow-engine/workflows`) }, { title: data.workflow.name }]}
        />
      </div>
      <div className="w-full border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex justify-between">
          <Link
            to={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.workflow.id}/executions`)}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <span className="mr-1">&larr;</span> Back to executions
          </Link>
          <WorkflowRunDropdown workflow={data.workflow} />
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-2 p-4">
        <div className="flex justify-between space-x-2">
          <div className="text-lg font-semibold">Run Workflow using the API</div>
        </div>

        {!execution ? (
          <div>
            <div className="space-y-1">
              <div className="flex items-center justify-between space-x-2">
                <div className="text-sm font-medium">{selectedTemplate || "Body"}</div>
                {data.workflow.inputExamples.length > 0 && (
                  <WorkflowInputExamplesDropdown
                    workflow={data.workflow}
                    onSelected={(item) => {
                      setSelectedTemplate(item.title);
                      setInputData(JSON.stringify(item.input, null, 2));
                    }}
                  />
                )}
              </div>

              <div className="overflow-hidden rounded-md border border-gray-200">
                <MonacoEditor className="h-20" theme="light" value={inputData} onChange={setInputData} hideLineNumbers tabSize={2} language="json" />
              </div>
              <InputText title="URL" defaultValue={`/api/workflows/run/${data.workflow.id}`} readOnly />
              <InputText title="Method" defaultValue="POST" readOnly />
              <InputText title="Header: X-Api-Key" defaultValue="Your API key" readOnly />
            </div>
            <div className="flex justify-end pt-2">
              <LoadingButton actionName="execute" onClick={onExecute} disabled={!WorkflowUtils.canRun(data.workflow)}>
                Run {!WorkflowUtils.canRun(data.workflow) && <span className="ml-1 text-xs opacity-50"> (not live)</span>}
              </LoadingButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link
                target="_blank"
                to={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.workflow.id}/executions?executionId=${execution.id}`)}
                className="flex w-full flex-col items-center rounded-lg border-2 border-dotted border-gray-300 bg-white p-3 text-sm font-medium hover:border-dashed hover:border-gray-800"
              >
                <>
                  <div className="flex justify-center">
                    <div className=" ">View execution flow</div>
                  </div>
                </>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setExecution(null);
                }}
                className="flex w-full flex-col items-center rounded-lg border-2 border-dotted border-gray-300 bg-white p-3 text-sm font-medium hover:border-dashed hover:border-gray-800"
              >
                <div className="flex justify-center">
                  <div className=" ">Run again</div>
                </div>
              </button>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200">
              <MonacoEditor className="h-40" theme="vs-dark" value={JSON.stringify({ execution }, null, 2)} hideLineNumbers tabSize={2} language="json" />
            </div>

            {execution.waitingBlock && (
              <Form onSubmit={onSubmitWaitingBlock}>
                <div className="space-y-1">
                  {execution.waitingBlock.input.title && <label className="text-xs font-medium text-gray-600">{execution.waitingBlock.input.title}</label>}
                  <div className="relative flex items-center">
                    <input
                      ref={waitingForInputRef}
                      autoFocus
                      type="text"
                      name="input"
                      id="input"
                      autoComplete="off"
                      value={waitingBlockInput}
                      onChange={(e) => setWaitingBlockInput(e.currentTarget.value)}
                      className={clsx(
                        "block w-full rounded-md border-0 py-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-600 sm:text-sm sm:leading-6",
                        isLoading ? "base-spinner bg-gray-100" : "bg-white"
                      )}
                      placeholder={execution.waitingBlock.input.placeholder}
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </div>
        )}

        {actionData?.error && (
          <ErrorBanner title="Error">
            <div>{actionData.error}</div>
            {actionData.error === "No valid API key found" && params.tenant && (
              <div>
                <Link className="underline" target="_blank" to={`/app/${params.tenant}/settings/api/keys`}>
                  Click here to create a new API key.
                </Link>
              </div>
            )}
          </ErrorBanner>
        )}
      </div>
    </div>
  );
}
