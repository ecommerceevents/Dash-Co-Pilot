import { RowsApi } from "~/utils/api/.server/RowsApi";
import { BlockExecutionParamsDto } from "../../dtos/BlockExecutionParamsDto";
import { BlockExecutionResultDto } from "../../dtos/BlockExecutionResultDto";
import WorkflowsValidationService from "../WorkflowsValidationService";
import { parseVariable } from "../WorkflowsVariablesService";
import OpenAIService from "~/modules/ai/lib/OpenAIService";
import ApiHelper from "~/utils/helpers/ApiHelper";
import EntitiesSingleton from "~/modules/rows/repositories/EntitiesSingleton";
import EmailService from "~/modules/emails/services/EmailService.server";

async function executeBlock(args: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  switch (args.block.type) {
    case "waitForInput":
      return await executeWaitForInputBlock(args);
    case "gpt":
      return await executeGptBlock(args);
    case "rowGet":
      return await executeRowGetBlock(args);
    case "rowCreate":
      return await executeRowCreateBlock(args);
    case "rowUpdate":
      return await executeRowUpdateBlock(args);
    case "rowDelete":
      return await executeRowDeleteBlock(args);
    case "email":
      return await executeEmailBlock(args);
    default:
      throw new Error("Block type not implemented: " + args.block.type);
  }
}

async function executeWaitForInputBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  let input = workflowContext["$params"].input;
  if (!input) {
    input = {};
  }
  return {
    output: { input },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeGptBlock({ block, workflowContext }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  let result: string | null = null;

  try {
    let prompt = parseVariable(block.input.prompt, workflowContext)!;
    // eslint-disable-next-line no-console
    console.log({
      prompt,
      blockInput: block.input,
    });
    const chatCompletion = await OpenAIService.createChatCompletion({
      role: "user",
      model: parseVariable(block.input.model, workflowContext)!,
      apiKey: parseVariable(block.input.apiKey, workflowContext)!,
      prompt,
    });
    if (chatCompletion.length > 0) {
      result = chatCompletion[0];
    } else {
      return {
        output: {
          result: null,
        },
        toBlockIds: block.toBlocks.map((f) => f.toBlockId),
        error: "No response from AI",
        throwsError: true,
      };
    }
  } catch (e: any) {
    return {
      output: {
        result: null,
      },
      toBlockIds: block.toBlocks.map((f) => f.toBlockId),
      error: e.message,
      throwsError: true,
    };
  }
  return {
    output: {
      result,
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeRowGetBlock({ block, workflowContext, session }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const translated = parseVariable(JSON.stringify(block.input, null, 2), workflowContext)!;
  const inputData = JSON.parse(translated);
  const entityName = inputData.entity;
  const id = inputData.id;
  const error = WorkflowsValidationService.validate(
    { entity: entityName, id },
    {
      type: "object",
      properties: {
        entity: { type: "string" },
        id: { type: "string" },
      },
      required: ["entity", "id"],
    }
  );
  if (error) {
    return { output: null, error, throwsError: true, toBlockIds: [] };
  }
  const entity = await EntitiesSingleton.getEntity({ name: entityName });

  const existing = await RowsApi.get(id, {
    entity,
    tenantId: session.tenantId,
    userId: session.userId ?? undefined,
  }).catch(() => {
    return null;
  });

  return {
    output: {
      row: !existing ? null : ApiHelper.getApiFormat(entity, existing.item),
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeRowCreateBlock({ block, workflowContext, session }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const translated = parseVariable(JSON.stringify(block.input, null, 2), workflowContext)!;
  const inputData = JSON.parse(translated);
  const entityName = inputData.entity;
  const row = JSON.parse(inputData.row);
  const error = WorkflowsValidationService.validate(
    { entity: entityName, row },
    {
      type: "object",
      properties: {
        entity: { type: "string" },
        row: { type: "object" },
      },
      required: ["entity", "row"],
    }
  );
  if (error) {
    return { output: null, error, throwsError: true, toBlockIds: [] };
  }
  const entity = await EntitiesSingleton.getEntity({ name: entityName });
  const rowValues = ApiHelper.getRowPropertiesFromJson(undefined, entity, row);
  const created = await RowsApi.create({
    entity,
    tenantId: session.tenantId,
    userId: session.userId ?? undefined,
    rowValues,
  });

  return {
    output: {
      row: ApiHelper.getApiFormat(entity, created),
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeRowUpdateBlock({ block, workflowContext, session }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const translated = parseVariable(JSON.stringify(block.input, null, 2), workflowContext)!;
  const inputData = JSON.parse(translated);
  const entityName = inputData.entity;
  const id = inputData.id;
  const data = JSON.parse(inputData.data);
  // eslint-disable-next-line no-console
  console.log({
    entityName,
    id,
    data,
  });
  const error = WorkflowsValidationService.validate(
    { entity: entityName, id, data },
    {
      type: "object",
      properties: {
        entity: { type: "string" },
        id: { type: "string" },
        data: { type: "object" },
      },
      required: ["entity", "id", "data"],
    }
  );
  if (error) {
    return { output: null, error, throwsError: true, toBlockIds: [] };
  }
  const entity = await EntitiesSingleton.getEntity({ name: entityName });

  const existing = await RowsApi.get(id, {
    entity,
    tenantId: session.tenantId,
    userId: session.userId ?? undefined,
  });

  const rowValues = ApiHelper.getRowPropertiesFromJson(undefined, entity, data, existing.item);
  const updated = await RowsApi.update(id, {
    entity,
    tenantId: session.tenantId,
    userId: session.userId ?? undefined,
    rowValues,
  });

  return {
    output: {
      row: ApiHelper.getApiFormat(entity, updated),
    },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

async function executeRowDeleteBlock({ block, workflowContext, session }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  const translated = parseVariable(JSON.stringify(block.input, null, 2), workflowContext)!;
  const inputData = JSON.parse(translated);
  const entityName = inputData.entity;
  const id = inputData.id;
  const error = WorkflowsValidationService.validate(
    { entity: entityName, id },
    {
      type: "object",
      properties: {
        entity: { type: "string" },
        id: { type: "string" },
      },
      required: ["entity", "id"],
    }
  );
  if (error) {
    return { output: null, error, throwsError: true, toBlockIds: [] };
  }
  const entity = await EntitiesSingleton.getEntity({ name: entityName });

  try {
    const existing = await RowsApi.get(id, {
      entity,
      tenantId: session.tenantId,
      userId: session.userId ?? undefined,
    });

    await RowsApi.del(id, {
      entity,
      tenantId: session.tenantId,
      userId: session.userId ?? undefined,
    });

    return {
      output: {
        row: ApiHelper.getApiFormat(entity, existing.item),
      },
      toBlockIds: block.toBlocks.map((f) => f.toBlockId),
    };
  } catch (e: any) {
    return { output: null, error: e.message, throwsError: true, toBlockIds: block.toBlocks.map((f) => f.toBlockId) };
  }
}

async function executeEmailBlock({ block, workflowContext, session }: BlockExecutionParamsDto): Promise<BlockExecutionResultDto> {
  // resend
  const provider: "postmark" | "resend" = parseVariable(block.input.provider, workflowContext) as any;
  const from = parseVariable(block.input.from, workflowContext)!;
  const to = parseVariable(block.input.to, workflowContext)!;
  const subject = parseVariable(block.input.subject, workflowContext)!;
  const body = parseVariable(block.input.body, workflowContext)!;
  const apiKey = parseVariable(block.input.apiKey, workflowContext)!;

  if (!provider || !from || !to || !subject || !body) {
    return {
      output: null,
      error: "Missing email data: provider, from, to, subject, body",
      throwsError: true,
      toBlockIds: [],
    };
  }

  if (!apiKey) {
    return {
      output: null,
      error: "Missing emails API key",
      throwsError: true,
      toBlockIds: [],
    };
  }

  const sent = await EmailService.send({
    provider,
    data: { from, to, subject, body },
    config: { apiKey },
  });
  return {
    output: { sent },
    toBlockIds: block.toBlocks.map((f) => f.toBlockId),
  };
}

export default {
  executeBlock,
};
