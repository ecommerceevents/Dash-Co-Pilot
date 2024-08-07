import { PromptFlowExecution, PromptTemplateResult } from "@prisma/client";
import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import DateUtils from "~/utils/shared/DateUtils";
import { PromptFlowWithExecutions } from "../db/promptFlows.db.server";
import { useTranslation } from "react-i18next";
import InputSelect from "~/components/ui/input/InputSelect";
import PromptResultBadge from "./PromptResultBadge";
import { useState } from "react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";

interface Props {
  item: PromptFlowWithExecutions;
}
export default function PromptResults({ item }: Props) {
  const { t } = useTranslation();

  const [openedResults, setOpenedResults] = useState<number[]>([0]);

  function getResults() {
    const results: {
      result: PromptTemplateResult;
      execution: PromptFlowExecution;
    }[] = [];
    item.executions.forEach((execution) => {
      execution.results.forEach((result) => {
        results.push({
          result,
          execution,
        });
      });
    });
    return results;
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-2">
        <InputText name="createdAt" title="Created at" defaultValue={DateUtils.dateYMDHMS(item.createdAt)} disabled />
        <InputText autoFocus name="title" title={t("shared.title")} defaultValue={item.title} disabled />
        <InputText name="description" title={t("shared.description")} defaultValue={item.description} disabled />
        <InputText name="actionTitle" title={"Action title"} defaultValue={item.actionTitle ?? ""} disabled />
        <InputSelect
          name="executionType"
          title={"Execution type"}
          value={item.executionType}
          options={[
            {
              name: "Sequential",
              value: "sequential",
            },
            {
              name: "Parallel",
              value: "parallel",
            },
          ]}
          disabled
        />
        <InputSelect name="model" title={"Model"} value={item.model} options={OpenAIDefaults.models.map((f) => f)} disabled />
      </div>
      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-sm font-bold">Results</h3>

        <div>
          <ButtonTertiary
            onClick={() => {
              if (openedResults.length === getResults().length) {
                setOpenedResults([]);
                return;
              } else {
                setOpenedResults(getResults().map((_, idx) => idx));
              }
            }}
          >
            {openedResults.length === getResults().length ? "Collapse all" : "Expand all"}
          </ButtonTertiary>
        </div>
      </div>

      {getResults().length === 0 && (
        <EmptyState
          captions={{
            thereAreNo: "No executions yet",
            description: "Results will appear here after you run the prompt flow",
          }}
        />
      )}
      {getResults().map((item, idx) => {
        return (
          <div key={idx} className="space-y-3">
            <CollapsibleRow
              key={idx}
              draggable={false}
              value={
                <div className="truncate">
                  <div className="flex items-center justify-between space-x-2 truncate">
                    <div className="flex flex-col truncate">
                      <h3 className="text-sm font-bold">Result #{getResults().length - idx}</h3>
                      <div className="truncate text-xs italic text-gray-500">{DateUtils.dateYMDHMS(item.result.createdAt)}</div>
                    </div>
                    <div className=" flex-shrink-0">
                      <PromptResultBadge
                        createdAt={item.result.createdAt}
                        startedAt={item.result.startedAt}
                        completedAt={item.result.completedAt}
                        status={item.result.status}
                        error={item.result.error}
                      />
                    </div>
                  </div>
                </div>
              }
              title={`Result #${getResults().length - idx}`}
              initial={idx === 0}
              opened={openedResults.includes(idx)}
            >
              <div key={idx} className="space-y-2 pb-4">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="space-y-2 overflow-x-auto lg:col-span-6">
                    <div className="flex justify-between space-x-2">
                      <div className="text-sm font-medium text-gray-600">Response</div>
                    </div>
                    <div>
                      <div className="space-y-1 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                        <div className="prose">
                          <pre className="h-44">{item.result.response}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 overflow-x-auto lg:col-span-6">
                    <div className="flex justify-between space-x-2">
                      <div className="text-sm font-medium text-gray-600">Prompt</div>
                    </div>
                    <div>
                      <div className="space-y-1 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                        <div className="prose">
                          <pre className="h-44 bg-gray-600">{item.result.prompt}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleRow>
          </div>
        );
      })}
    </div>
  );
}
