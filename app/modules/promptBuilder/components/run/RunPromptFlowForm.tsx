import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { PromptFlowWithDetails } from "../../db/promptFlows.db.server";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { useEffect, useRef, useState } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { useTypedActionData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { useTranslation } from "react-i18next";
import { PromptExecutionResultDto } from "../../dtos/PromptExecutionResultDto";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import { marked } from "marked";

interface Props {
  item: PromptFlowWithDetails;
  rowId?: string;
  initialVariables?: { [key: string]: string };
  autoRun?: boolean;
}
export default function RunPromptFlowForm({ item, rowId, initialVariables, autoRun = true }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const actionData = useTypedActionData<{
    promptFlowExecutionResult?: PromptExecutionResultDto | null;
  }>();
  const submit = useSubmit();

  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<PromptExecutionResultDto | null>(actionData?.promptFlowExecutionResult ?? null);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    if (initialVariables) {
      const variables = initialVariables;

      setTimeout(() => {
        mainInput.current?.input.current?.focus();

        const noVariablesOrAllVariablesSet = item.inputVariables.length === 0 || item.inputVariables.every((f) => !!variables[f.name]);
        // eslint-disable-next-line no-console
        console.log({
          variables: item.inputVariables.length,
          allSet: item.inputVariables.filter((f) => !!variables[f.name]),
        });
        if (noVariablesOrAllVariablesSet && autoRun) {
          const formData = new FormData();
          formData.set("action", "run-prompt-flow");
          formData.set("promptFlowId", item.id);
          item.inputVariables.forEach((item) => {
            formData.append("variables[]", JSON.stringify({ name: item.name, value: variables[item.name] }));
          });
          if (rowId) {
            formData.set("rowId", rowId.toString());
          }
          submit(formData, {
            method: "post",
          });
        }
      }, 100);

      setVariables(variables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVariables]);

  useEffect(() => {
    if (actionData?.promptFlowExecutionResult) {
      setResult(actionData.promptFlowExecutionResult);
    }
  }, [actionData?.promptFlowExecutionResult]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData();
    formData.set("action", "run-prompt-flow");
    formData.set("promptFlowId", item.id);
    item.inputVariables.forEach((item) => {
      formData.append("variables[]", JSON.stringify({ name: item.name, value: variables[item.name] }));
    });
    if (rowId) {
      formData.set("rowId", rowId.toString());
    }
    submit(formData, {
      method: "post",
    });
  }
  return (
    <div key={item.id} className="z-40 space-y-2">
      {/* <h2 className="font-medium text-gray-800">{item.description}</h2> */}
      {!result ? (
        <Form method="post" onSubmit={handleSubmit}>
          {item.inputVariables.map((f) => {
            return (
              <input
                key={f.name}
                type="hidden"
                name={"variables[]"}
                value={JSON.stringify({
                  name: f.name,
                  value: variables[f.name],
                })}
              />
            );
          })}
          <div className="space-y-2">
            {item.inputVariables.length === 0 && <InfoBanner title={item.title}>{item.description}</InfoBanner>}
            {item.inputVariables.map((f, idx) => {
              return (
                <InputText
                  key={f.name}
                  ref={idx === 0 ? mainInput : undefined}
                  autoFocus={idx === 0}
                  name={f.name}
                  title={f.title}
                  required={f.isRequired}
                  value={variables[f.name]}
                  setValue={(e) => setVariables({ ...variables, [f.name]: e.toString() ?? "" })}
                  readOnly={navigation.state === "submitting"}
                />
              );
            })}
            <div className="flex justify-end">
              <LoadingButton type="submit">Run</LoadingButton>
            </div>
          </div>
        </Form>
      ) : (
        <div className="space-y-2">
          {result.executionResult.results.map((f) => {
            return (
              <div key={f.id} className="flex flex-col rounded-md border border-gray-200 bg-white p-2 shadow-sm">
                <div className="text-sm font-medium text-gray-800">{f.template?.title}</div>
                <div className="prose">
                  <div dangerouslySetInnerHTML={{ __html: marked(f.response ?? "") }} />
                </div>
              </div>
            );
          })}
          <div className="flex justify-between space-x-2">
            <div></div>
            <div className="flex justify-between space-x-2">
              <ButtonSecondary
                onClick={() => {
                  setResult(null);
                }}
              >
                Run Again
              </ButtonSecondary>
              {result.outputResult.createdRows.length === 1 && (
                <ButtonPrimary target="_blank" to={result.outputResult.createdRows[0].href}>
                  View {t(result.outputResult.createdRows[0].entity.title)}
                </ButtonPrimary>
              )}
              {result.outputResult.updatedRows.length > 1 && (
                <ButtonPrimary target="_blank" to={result.outputResult.updatedRows[0].href}>
                  View {t(result.outputResult.updatedRows[0].entity.title)}
                </ButtonPrimary>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
