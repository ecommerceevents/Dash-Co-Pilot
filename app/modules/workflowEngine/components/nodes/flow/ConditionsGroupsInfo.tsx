import { useState } from "react";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { WorkflowConditionsGroupDto } from "~/modules/workflowEngine/dtos/WorkflowConditionDtos";
import ConditionsGroupInput from "./ConditionsGroupInput";
import { WorkflowBlockDto } from "~/modules/workflowEngine/dtos/WorkflowBlockDto";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import WorkflowConditionUtils from "~/modules/workflowEngine/helpers/WorkflowConditionUtils";
import clsx from "clsx";

export default function ConditionsGroupsInfo({
  workflow,
  block,
  type,
  onUpdateConditionsGroups,
}: {
  workflow: WorkflowDto;
  block: WorkflowBlockDto;
  type: "if" | "switch";
  onUpdateConditionsGroups: (conditionsGroups: WorkflowConditionsGroupDto[]) => void;
}) {
  const [selectedConditionsGroup, setSelectedConditionsGroup] = useState<WorkflowConditionsGroupDto | null>(null);
  const [addingNewGroup, setAddingNewGroup] = useState(false);

  function onSaveGroup(conditionsGroup: WorkflowConditionsGroupDto) {
    if (conditionsGroup.index === block.conditionGroups.length) {
      onUpdateConditionsGroups([...block.conditionGroups, conditionsGroup]);
    } else {
      onUpdateConditionsGroups(block.conditionGroups.map((group) => (group.index === conditionsGroup.index ? conditionsGroup : group)));
    }
    setSelectedConditionsGroup(null);
    setAddingNewGroup(false);
  }
  function onDeleteGroup(idx: number) {
    const newConditionsGroups = block.conditionGroups.filter((_group, i) => i !== idx);
    onUpdateConditionsGroups(newConditionsGroups);
  }
  return (
    <div className="space-y-1">
      {block.conditionGroups.map((group) => {
        return (
          <div key={group.index} className="space-y-0.5">
            {type === "switch" && <div className="font-medium text-xs text-gray-500 uppercase">Case #{group.index + 1}</div>}
            <div
              onClick={() => setSelectedConditionsGroup(group)}
              className={clsx(
                "border border-dashed hover:border-dotted rounded-lg px-2 py-2 text-sm focus:outline-none cursor-pointer border-gray-500 relative group",
                group.conditions.length === 0
                  ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-800 hover:border-red-800"
                  : "bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-800"
              )}
            >
              {type === "switch" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group.index);
                  }}
                  className="rounded-md text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 absolute top-2.5 right-2 hidden group-hover:block"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              )}
              <div className="space-y-0.5">
                {group.conditions.length === 0 ? (
                  <div>
                    <div className="font-medium">No conditions</div>
                  </div>
                ) : group.conditions.length === 1 ? (
                  <div className=" flex justify-center flex-col text-center items-center p-2 bg-gray-100 border border-gray-300 rounded-md">
                    <div key={group.index} className="flex space-x-2 items-center">
                      <div className="font-medium">{WorkflowConditionUtils.getConditionString(group.conditions[0])}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">{group.conditions.length} conditions</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {type === "switch" && (
        <button
          type="button"
          onClick={() => setAddingNewGroup(true)}
          className="bg-gray-50 hover:bg-gray-100 border border-gray-300 px-2 py-1 rounded-md text-gray-600 text-xs"
        >
          Add case
        </button>
      )}

      <SlideOverWideEmpty
        className="sm:max-w-2xl"
        title={!selectedConditionsGroup ? "" : type === "if" ? "If Condition" : `Case ${selectedConditionsGroup.index + 1}`}
        open={!!selectedConditionsGroup}
        onClose={() => setSelectedConditionsGroup(null)}
      >
        {selectedConditionsGroup && (
          <ConditionsGroupInput
            workflow={workflow}
            block={block}
            type={type}
            conditionsGroup={selectedConditionsGroup}
            onCancel={() => setSelectedConditionsGroup(null)}
            onSave={onSaveGroup}
          />
        )}
      </SlideOverWideEmpty>

      <SlideOverWideEmpty
        className="sm:max-w-2xl"
        title={"Add case " + (block.conditionGroups.length + 1)}
        open={addingNewGroup}
        onClose={() => setAddingNewGroup(false)}
      >
        {addingNewGroup && (
          <ConditionsGroupInput
            workflow={workflow}
            block={block}
            type={type}
            conditionsGroup={{
              index: block.conditionGroups.length,
              type: "AND",
              conditions: [],
            }}
            onCancel={() => setAddingNewGroup(false)}
            onSave={onSaveGroup}
          />
        )}
      </SlideOverWideEmpty>
    </div>
  );
}
