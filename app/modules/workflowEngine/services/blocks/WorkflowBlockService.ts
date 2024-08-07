import { db } from "~/utils/db.server";
import { WorkflowBlockDto } from "../../dtos/WorkflowBlockDto";
import { WorkflowDto } from "../../dtos/WorkflowDto";
import { WorkflowBlockTypes } from "../../dtos/WorkflowBlockTypes";
import { parseVariable } from "../WorkflowsVariablesService";
import WorkflowsConditionsService from "../WorkflowsConditionsService";
import WorkflowConditionUtils from "../../helpers/WorkflowConditionUtils";
import { emitter } from "~/utils/stream/emitter.server";
import { BlockExecutionResultDto } from "../../dtos/BlockExecutionResultDto";
import WorkflowUtils from "../../helpers/WorkflowUtils";
import { BlockExecutionParamsDto } from "../../dtos/BlockExecutionParamsDto";
import WorkflowsBlocksProService from "./WorkflowBlockProService";
import { WorkflowStatus } from "../../dtos/WorkflowStatus";
import { getWorkflowExecution } from "../../db/workflowExecutions.db.server";
import WorkflowExecutionUtils from "../../helpers/WorkflowExecutionUtils";
import WorkflowsValidationService from "../WorkflowsValidationService";

async function execute({
  workflowContext,
  workflowExecutionId,
  workflow,
  block,
  fromBlock,
  session,
}: {
  workflowContext: { [key: string]: any };
  workflowExecutionId: string;
  workflow: WorkflowDto;
  block: WorkflowBlockDto;
  fromBlock: WorkflowBlockDto | null;
  session: {
    tenantId: string | null;
    userId: string | null;
  };
}): Promise<{
  status: WorkflowStatus;
  workflowContext: { [key: string]: any };
  waitingBlockId: string | null;
}> {
  if (!WorkflowUtils.canRun(workflow)) {
    throw new Error("Workflow is not ready to run");
  }
  const workflowBlock = WorkflowBlockTypes.find((f) => f.value === block.type);
  if (!workflowBlock) {
    throw new Error("Invalid workflow block type: " + block.type);
  }

  let error: string | null = null;
  let blockExecution = await db.workflowBlockExecution.create({
    data: {
      workflowExecutionId,
      workflowBlockId: block.id,
      fromWorkflowBlockId: fromBlock ? fromBlock.id : null,
      status: "pending",
      startedAt: new Date(),
      input: block.input ? JSON.stringify(block.input) : null,
      output: null,
      endedAt: null,
      duration: null,
      error: null,
    },
  });

  const blockStartTime = performance.now();
  let result: BlockExecutionResultDto | null = {
    output: null,
    toBlockIds: [],
    error: null,
  };
  try {
    result = await executeBlock({ block, workflowContext, workflow, workflowExecutionId, session });
    workflowContext = {
      ...workflowContext,
      [block.variableName]: result.output,
    };
  } catch (e: any) {
    if (!result) {
      result = {
        error: e.message,
        output: null,
        toBlockIds: [],
      };
    } else {
      result.error = e.message;
    }
  }

  const blockEndTime = performance.now();
  const blockDuration = blockEndTime - blockStartTime;

  await db.workflowBlockExecution.update({
    where: { id: blockExecution.id },
    data: {
      output: result.output ? JSON.stringify(result.output) : null,
      status: result.error ? "error" : "success",
      duration: Math.round(blockDuration),
      endedAt: new Date(),
      error: result.error,
    },
  });

  const updatedExecution = await getWorkflowExecution(workflowExecutionId, session);
  if (updatedExecution) {
    emitter.emit(`workflowExecutionUpdate:${workflowExecutionId}`, JSON.stringify(WorkflowExecutionUtils.rowToDto(updatedExecution)));
  }

  if (result.error && result.throwsError) {
    throw new Error(result.error);
  }

  for (const nextBlockId of result.toBlockIds) {
    const toBlock = workflow.blocks.find((f) => f.id === nextBlockId);
    if (toBlock) {
      if (toBlock.type === "waitForInput") {
        return {
          status: "waitingBlock",
          workflowContext: workflowContext,
          waitingBlockId: toBlock.id,
        };
      }
      const result = await execute({ workflowContext, workflowExecutionId, workflow, block: toBlock, fromBlock: block, session });
      workflowContext = {
        ...workflowContext,
        ...result.workflowContext,
      };
      if (result.status === "waitingBlock") {
        return result;
      }
    }
  }

  return {
    status: error ? "error" : "success",
    workflowContext: workflowContext,
    waitingBlockId: null,
  };
}

async function executeBlock(args: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  switch (args.block.type) {
    case "manual":
      return await executeManualBlock(args);
    case "doNothing":
      return { output: null, toBlockIds: args.block.toBlocks.map((f) => f.toBlockId) };
    case "log":
      return await executeLogBlock(args);
    case "httpRequest":
      return await executeHttpRequestBlock(args);
    case "if":
      return await executeIfBlock(args);
    case "switch":
      return await executeSwitchBlock(args);
    case "alertUser":
      return await executeAlertUserBlock(args);
    case "iterator":
      return await executeIteratorBlock(args);
    case "variable":
      return await executeVariableBlock(args);
    case "event":
      return await executeEventBlock(args);
    default:
      return await WorkflowsBlocksProService.executeBlock(args);
  }
}

async function executeManualBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  if (block.input.validation) {
    const error = WorkflowsValidationService.validate(workflowContext["$params"], JSON.parse(block.input.validation));
    if (error) {
      return { output: null, error, throwsError: true, toBlockIds: [] };
    }
    block.input.validation = undefined;
  }
  return {
    output: null,
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeLogBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  let message = parseVariable(block.input.message, workflowContext);
  // eslint-disable-next-line no-console
  console.log(`[${block.variableName}] ${message}`);
  return {
    output: {
      message,
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeHttpRequestBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  let result: BlockExecutionResultDto = {
    output: {
      statusCode: 0,
      body: null,
      error: null,
    },
    error: null,
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
  const config = {
    url: parseVariable(block.input.url, workflowContext),
    method: parseVariable(block.input.method, workflowContext),
    body: parseVariable(block.input.body, workflowContext),
    headers: parseVariable(block.input.headers, workflowContext),
    throwsError: block.input.throwsError,
  };
  if (!config.url) {
    throw new Error("URL is required");
  }
  if (!config.method) {
    throw new Error("Method is required");
  }
  try {
    const response = await fetch(config.url, {
      method: config.method,
      body: config.body,
      headers: config.headers ? JSON.parse(config.headers) : undefined,
    });
    result.output.statusCode = response.status;
    result.output.body = await response.json();
    if (result.output.statusCode >= 400) {
      result.output.error = response.statusText;
    }
  } catch (e: any) {
    let error = e.message;
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    result.error = error;
    result.output.error = error;
    result.throwsError = config.throwsError;
  }

  return result;
}

async function executeIfBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const trueBlockId = block.toBlocks.find((f) => f.condition === "true")?.toBlockId;
  const falseBlockId = block.toBlocks.find((f) => f.condition === "false")?.toBlockId;
  if (!trueBlockId) {
    throw new Error("Missing true block");
  }
  if (!falseBlockId) {
    throw new Error("Missing false block");
  }
  if (block.conditionGroups.length !== 1) {
    throw new Error("If block must have exactly one condition group");
  }
  const result = WorkflowsConditionsService.validateGroups({ conditionGroup: block.conditionGroups[0], workflowContext });
  return {
    output: {
      condition: result,
      expression: block.conditionGroups[0].conditions.map((f) => WorkflowConditionUtils.getConditionString(f)).join(` ${block.conditionGroups[0].type} `),
    },
    toBlockIds: result ? [trueBlockId] : [falseBlockId],
  };
}

async function executeSwitchBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  for (const conditionGroup of block.conditionGroups) {
    const result = WorkflowsConditionsService.validateGroups({ conditionGroup, workflowContext });
    if (result) {
      const condition = `case${conditionGroup.index + 1}`;
      const foundBlockId = block.toBlocks.find((f) => f.condition === condition)?.toBlockId;
      if (!foundBlockId) {
        throw new Error(`[${block.variableName}] Missing block for condition: ${condition}`);
      }
      return {
        output: {
          condition,
          expression: conditionGroup.conditions.map((f) => WorkflowConditionUtils.getConditionString(f)).join(` ${conditionGroup.type} `),
        },
        toBlockIds: [foundBlockId],
      };
    }
  }
  const defaultBlockId = block.toBlocks.find((f) => f.condition === "default")?.toBlockId;
  if (!defaultBlockId) {
    throw new Error("Missing default block");
  }
  return {
    output: {
      condition: "default",
    },
    toBlockIds: [defaultBlockId],
  };
}

async function executeAlertUserBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  let message = parseVariable(block.input.message, workflowContext);
  // eslint-disable-next-line no-console
  console.log(`[${block.variableName}] ${message}`);
  return {
    output: {
      type: block.input.type ?? "success",
      message,
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeIteratorBlock({
  block,
  workflowContext,
  workflow,
  session,
  workflowExecutionId,
}: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const loopNextBlockId = block.toBlocks.find((f) => f.condition === "loopNext")?.toBlockId;
  const loopEndBlockId = block.toBlocks.find((f) => f.condition === "loopEnd")?.toBlockId;
  const loopNextBlock = workflow.blocks.find((f) => f.id === loopNextBlockId);
  if (!loopNextBlock) {
    throw new Error(`[${block.variableName}] Missing loop next block`);
  }
  if (!loopEndBlockId) {
    throw new Error(`[${block.variableName}] Missing loop end block`);
  }

  let variableName = block.input.variableName;
  // remove {{ and }} with regex
  variableName = variableName.replace(/{{/g, "").replace(/}}/g, "");

  function getNestedProperty(obj: any, path: string) {
    const keys = path.replace(/^/, "").split(".");
    return getNestedPropertyHelper(obj, keys);
  }

  function getNestedPropertyHelper(currentObject: any, remainingKeys: string[]): any {
    if (remainingKeys.length === 0) {
      return currentObject;
    }

    const currentKey = remainingKeys[0];

    if (currentObject !== null && typeof currentObject === "object" && currentKey in currentObject) {
      return getNestedPropertyHelper(currentObject[currentKey], remainingKeys.slice(1));
    } else {
      throw new Error(`Property not found for key: ${currentKey}`);
    }
  }

  const array = getNestedProperty(workflowContext, variableName);
  if (!array) {
    throw new Error(`Variable "${variableName}" not found`);
  }
  if (!Array.isArray(array)) {
    throw new Error(`Variable "${variableName}" is not an array`);
  }
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    workflowContext = {
      ...workflowContext,
      iterator: { index, item, isFirst: index === 0, isLast: index === array.length - 1 },
    };
    const loopResult = await execute({ workflowContext, workflowExecutionId, workflow, block: loopNextBlock, fromBlock: block, session });
    // eslint-disable-next-line no-console
    console.log({ loopResult });
  }
  return {
    output: array.length,
    toBlockIds: [loopEndBlockId],
  };
}

async function executeVariableBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const variableName = block.input.variableName;
  const value = parseVariable(block.input.value, workflowContext);
  workflowContext.$vars[variableName] = value;
  return {
    output: value,
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeEventBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const error = WorkflowsValidationService.validate(workflowContext["$params"], {
    type: "object",
    properties: { data: { type: "object" } },
    required: ["data"],
  });
  if (error) {
    return { output: null, error, throwsError: true, toBlockIds: [] };
  }

  if (["row.created", "row.updated", "row.deleted"].includes(block.input.event)) {
    // eslint-disable-next-line no-console
    console.log("Validating event: " + block.input.event, {
      data: workflowContext["$params"].data,
      hasId: !!workflowContext["$params"].data.id,
      hasTitle: !!workflowContext["$params"].data.title,
      hasRow: !!workflowContext["$params"].data.row,
      hasEntity: !!workflowContext["$params"].data.entity,
    });
    const error = WorkflowsValidationService.validate(workflowContext["$params"].data, {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        row: { type: "object" },
        entity: { type: "object" },
      },
      required: ["id", "title", "row", "entity"],
    });
    if (error) {
      return { output: null, error, throwsError: true, toBlockIds: [] };
    }
  }

  block.input.validation = undefined;
  return {
    output: workflowContext.$params,
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

export default {
  execute,
};
