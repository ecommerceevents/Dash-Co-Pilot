import { WorkflowExecutionWithDetails } from "../db/workflowExecutions.db.server";
import { WorkflowBlockExecutionDto } from "../dtos/WorkflowBlockExecutionDto";
import { WorkflowExecutionDto } from "../dtos/WorkflowExecutionDto";
import WorkflowBlockUtils from "./WorkflowBlockUtils";

function rowToDto(item: WorkflowExecutionWithDetails): WorkflowExecutionDto {
  const execution: WorkflowExecutionDto = {
    id: item.id,
    createdAt: item.createdAt,
    status: item.status as WorkflowExecutionDto["status"],
    input: parseData(item.input),
    output: parseData(item.output),
    duration: item.duration,
    endedAt: item.endedAt,
    error: item.error,
    blockRuns: item.blockRuns.map((block) => {
      const blockRun: WorkflowBlockExecutionDto = {
        id: block.id,
        workflowBlockId: block.workflowBlockId,
        fromWorkflowBlockId: block.fromWorkflowBlockId,
        status: block.status as WorkflowBlockExecutionDto["status"],
        startedAt: block.startedAt,
        endedAt: block.endedAt,
        input: parseData(block.input),
        output: parseData(block.output),
        error: block.error,
        workflowBlock: {
          type: block.workflowBlock.type as WorkflowBlockExecutionDto["workflowBlock"]["type"],
          description: block.workflowBlock.description,
        },
      };
      return blockRun;
    }),
    executionAlerts: [],
    waitingBlock: null,
  };
  const alertUserBlockRuns = execution.blockRuns.filter((block) => block.workflowBlock.type === "alertUser");
  alertUserBlockRuns.forEach((blockRun) => {
    if (blockRun.output?.type && blockRun.output?.message) {
      execution.executionAlerts.push({
        type: blockRun.output?.type,
        message: blockRun.output?.message,
      });
    }
  });

  if (item.waitingBlock) {
    execution.waitingBlock = WorkflowBlockUtils.rowToDto(item.waitingBlock);
  }

  return execution;
}

// function executionToDto(item: WorkflowBlockExecution, workflowBlock: WorkflowBlockDto): WorkflowBlockExecutionDto {
//   const blockRun: WorkflowBlockExecutionDto = {
//     id: item.id,
//     workflowBlockId: item.workflowBlockId,
//     fromWorkflowBlockId: item.fromWorkflowBlockId,
//     status: item.status as WorkflowBlockExecutionDto["status"],
//     startedAt: item.startedAt,
//     endedAt: item.endedAt,
//     input: parseData(item.input),
//     output: parseData(item.output),
//     error: item.error,
//     workflowBlock: {
//       type: workflowBlock.type as WorkflowBlockExecutionDto["workflowBlock"]["type"],
//       description: workflowBlock.description,
//     },
//   };
//   return blockRun;
// }

function parseData(data: string | null): { [key: string]: any } | null {
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export default {
  rowToDto,
};
