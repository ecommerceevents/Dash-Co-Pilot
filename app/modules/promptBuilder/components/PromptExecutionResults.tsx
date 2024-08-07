import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import DateUtils from "~/utils/shared/DateUtils";
import PromptResultBadge from "./PromptResultBadge";
import { useState } from "react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { PromptFlowExecutionWithResults } from "../db/promptExecutions.db.server";
import { Colors } from "~/application/enums/shared/Colors";
import InputSelector from "~/components/ui/input/InputSelector";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import EmptyState from "~/components/ui/emptyState/EmptyState";

interface Props {
  item: PromptFlowExecutionWithResults;
}
export default function PromptExecutionResults({ item }: Props) {
  const [openedResults, setOpenedResults] = useState<number[]>([]);

  function getUnparsedVariables() {
    const unparsedVariables: string[] = [];
    item.results.forEach((result) => {
      const template = result.prompt;
      // find variables {{}} in template and escape them
      const regex = /{{(.*?)}}/g;
      const matches = template.match(regex);
      if (matches) {
        matches.forEach((match) => {
          const variable = match.replace("{{", "").replace("}}", "");
          if (!unparsedVariables.includes(variable)) {
            unparsedVariables.push(variable);
          }
        });
      }
    });
    return unparsedVariables;
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <InputText name="createdAt" title="Created at" defaultValue={DateUtils.dateYMDHMS(item.createdAt)} disabled />
        <InputText name="startedAt" title="Started at" defaultValue={DateUtils.dateYMDHMS(item.startedAt)} disabled />
        <InputText name="finishedAt" title="Completed at" defaultValue={DateUtils.dateYMDHMS(item.completedAt)} disabled />
        <InputText name="duration" title="Duration" defaultValue={DateUtils.getDurationInSeconds({ start: item.startedAt, end: item.completedAt })} disabled />

        <InputSelector
          name="status"
          title="Status"
          value={item.status}
          withColors={true}
          disabled={true}
          options={[
            {
              value: "pending",
              name: "Pending",
              color: Colors.YELLOW,
            },
            {
              value: "running",
              name: "Running",
              color: Colors.BLUE,
            },
            {
              value: "success",
              name: "Success",
              color: Colors.GREEN,
            },
            {
              value: "error",
              name: "Error",
              color: Colors.RED,
            },
          ].map((i) => {
            return {
              value: i.value,
              name: i.name,
              color: i.color,
            };
          })}
        />
        <InputText name="user" title="User" defaultValue={item.user?.email} disabled />
        <InputText name="tenant" title="Account" defaultValue={item.tenant?.name ?? "Admin"} disabled />
      </div>

      {item.error && <ErrorBanner title="Error" text={item.error} />}

      {getUnparsedVariables().length > 0 && (
        <WarningBanner title="Unparsed variables" text="">
          {getUnparsedVariables().map((variable) => {
            return (
              <div key={variable} className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                <div>{variable}</div>
              </div>
            );
          })}
        </WarningBanner>
      )}

      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-sm font-bold">Results</h3>

        <div>
          <ButtonTertiary
            onClick={() => {
              if (openedResults.length === item.results.length) {
                setOpenedResults([]);
                return;
              } else {
                setOpenedResults(item.results.map((_, idx) => idx));
              }
            }}
          >
            {openedResults.length === item.results.length ? "Collapse all" : "Expand all"}
          </ButtonTertiary>
        </div>
      </div>

      {item.results.length === 0 && (
        <EmptyState
          captions={{
            thereAreNo: "No executions yet",
            description: "Results will appear here after you run the prompt flow",
          }}
        />
      )}

      {item.results.map((result, idx) => {
        return (
          <div key={idx} className="space-y-3">
            <CollapsibleRow
              key={idx}
              draggable={false}
              value={
                <div className="truncate">
                  <div className="flex items-center justify-between space-x-2 truncate">
                    <div className="flex flex-col truncate">
                      <div className="flex items-center space-x-1">
                        <h3 className="text-sm font-bold text-gray-800">{result.template?.title}:</h3>
                        <div className="truncate text-gray-600">{result.response ?? "No response"}</div>
                      </div>
                      <div className="truncate text-xs italic text-gray-500">{DateUtils.dateYMDHMS(result.createdAt)}</div>
                    </div>
                    <div className=" flex-shrink-0">
                      <PromptResultBadge
                        createdAt={result.createdAt}
                        startedAt={result.startedAt}
                        completedAt={result.completedAt}
                        status={result.status}
                        error={result.error}
                      />
                    </div>
                  </div>
                </div>
              }
              title={`${result.template?.title}`}
              initial={idx === 0}
              opened={openedResults.includes(idx)}
            >
              <div key={idx} className="space-y-2 pb-4">
                <div className="grid gap-4">
                  <div className="space-y-2 overflow-x-auto ">
                    <div className="flex justify-between space-x-2">
                      <div className="text-sm font-medium text-gray-600">Response</div>
                    </div>
                    <div>
                      <div className="space-y-1 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                        <div className="prose">
                          <pre className="h-44">{result.response}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 overflow-x-auto ">
                    <div className="flex justify-between space-x-2">
                      <div className="text-sm font-medium text-gray-600">Prompt</div>
                    </div>
                    <div>
                      <div className="space-y-1 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                        <div className="prose">
                          <pre className="h-44 bg-gray-600">{result.prompt}</pre>
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
