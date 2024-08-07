/* eslint-disable no-console */
import { PromptFlowWithDetails, createPromptFlow, getPromptFlow } from "../../db/promptFlows.db.server";
import AIService from "~/modules/ai/lib/AIService";
import {
  PromptFlowExecutionWithResults,
  PromptTemplateResultWithTemplate,
  createPromptFlowExecution,
  getPromptFlowExecution,
  updatePromptFlowExecution,
  updatePromptTemplateResult,
} from "../../db/promptExecutions.db.server";
import { TimeFunction, timeFake } from "~/modules/metrics/services/.server/MetricTracker";
import PromptFlowOutputService from "../PromptFlowOutputService";
import { PromptExecutionResultDto } from "../../dtos/PromptExecutionResultDto";
import { Params } from "@remix-run/react";
import { PromptFlowOutputResultDto } from "../../dtos/PromptFlowOutputResultDto";
import { RowWithDetails, getRowById } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import TemplateApiHelper, { RowAsJson } from "~/utils/helpers/TemplateApiHelper";
import TemplateApiService from "~/utils/helpers/.server/TemplateApiService";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { TFunction } from "i18next";
import { RowRelationshipsApi } from "~/utils/api/.server/RowRelationshipsApi";
import HandlebarsService from "../HandlebarsService";
import PromptBuilderDefault from "../PromptBuilderDefault";

async function executeFlow({
  flow,
  userId,
  tenantId,
  request,
  params,
  variables,
  isDebugging,
  time,
  model,
  allEntities,
  row,
  t,
}: {
  flow: PromptFlowWithDetails;
  userId?: string | null;
  tenantId: string | null;
  variables: { [key: string]: string };
  request: Request;
  params: Params;
  // testData?: PromptBuilderVariableValueDto[];
  isDebugging?: boolean;
  time?: TimeFunction;
  model?: string;
  allEntities: EntityWithDetails[];
  row: RowWithDetails | undefined;
  t: TFunction;
}): Promise<PromptExecutionResultDto | null> {
  if (!time) {
    time = timeFake;
  }

  let rowAsJson: RowAsJson | null = null;
  if (row) {
    rowAsJson = await TemplateApiService.getRowInApiFormatWithRecursiveRelationships({
      entities: allEntities,
      rowId: row.id,
      t,
      options: {
        exclude: ["id", "folio", "createdAt", "updatedAt", "createdByUser", "createdByApiKey"],
      },
    });
  }
  const data = TemplateApiHelper.getTemplateValue({
    allEntities,
    t,
    session: {
      tenant: tenantId ? await getTenant(tenantId) : null,
      user: userId ? await getUser(userId) : null,
    },
    variables,
    row: rowAsJson ?? undefined,
  });

  // eslint-disable-next-line no-console
  console.log("[Prompts] Executing prompt flow: ", flow.title);

  const { id } = await createPromptFlowExecution({
    flowId: flow.id,
    userId: userId ?? null,
    tenantId,
    status: "pending",
    model: model ?? flow.model,
    results: flow.templates
      .sort((a, b) => a.order - b.order)
      .map((template) => ({
        templateId: template.id,
        order: template.order,
        status: "pending",
        prompt: "",
      })),
  });
  const execution = await getPromptFlowExecution(id);
  if (!execution) {
    throw new Error(`Could not create prompt execution: ${id}`);
  }

  await updatePromptFlowExecution(execution.id, {
    status: "running",
    startedAt: new Date(),
  });

  const startTime = performance.now();
  let toExecute = execution.results.sort((a, b) => a.order - b.order);
  try {
    // if (flow.inputEntity) {
    //   const row = data.find((f) => f.row?.entity.id === flow.inputEntityId);
    //   if (!row) {
    //     throw Error("Input required: " + flow.inputEntity.name);
    //   }
    // }

    const results: { response?: string | null; error?: string | null }[] = [];
    let index = 0;
    if (execution.flow.executionType === "sequential") {
      if (index > 0) {
        // wait up to 20 seconds for each prompt previous to the current one
        let waitTime = 0;
        do {
          // eslint-disable-next-line no-console
          console.log("[Prompts] Waiting for previous prompt to finish");

          const previousResult = results[index - 1];
          if (previousResult.response !== undefined) {
            break;
          }
          waitTime += 1000;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (waitTime < 20000);
      }

      // eslint-disable-next-line no-console
      console.log("[Prompts] Is sequential");
      for (const templateResult of toExecute) {
        if (!templateResult.template) {
          throw new Error(`Could not find template: ${templateResult.templateId}`);
        }
        // eslint-disable-next-line no-console
        console.log("Running template", templateResult.template.title);
        if (index > 0) {
          if (!data.promptFlow) {
            data.promptFlow = { results: [] };
          }
          // data[`promptFlow.results[${index - 1}]`] = results[index - 1].response || "";
          data.promptFlow.results[index - 1] = results[index - 1].response || "";
          // promptData.push({
          //   variable: {
          //     type: "promptFlow",
          //     name: `promptFlow.results[${index - 1}]`,
          //   },
          //   text: results[index - 1].response || "",
          // });
          // if (testData !== undefined) {
          //   testData.push({
          //     type: "promptFlow",
          //     name: `promptFlow.results[${index - 1}]`,
          //     value: results[index - 1].response || "",
          //   });
          // }
        }
        // eslint-disable-next-line no-console
        // console.log("[Prompts] Running template", {
        //   name: templateResult.template.title,
        //   order: templateResult.template.order,
        //   promptData: promptData.map((f) => {
        //     return {
        //       variable: f.variable.name,
        //       text: f.text,
        //     };
        //   }),
        // });
        // const prompt = await PromptBuilderVariableService.parseVariables(templateResult.template.template, promptData, testData, allEntities);
        let prompt = "";
        try {
          prompt = HandlebarsService.compile(templateResult.template.template, data);
          console.log({
            data: JSON.stringify(data),
          });
          console.log(`[${templateResult.template.title}] Prompt`, {
            template: templateResult.template.template,
            prompt,
          });
        } catch (e: any) {
          console.log(`[${templateResult.template.title}] Compile error`, e);
          throw new Error(`[${templateResult.template.title}] Compile error: ` + e.message);
        }
        const resultResponse = await executeTemplate({ execution, templateResult, prompt, isDebugging, userId, model });
        results.push(resultResponse);
        index++;

        if (resultResponse.error && resultResponse.error.length > 0) {
          throw new Error(`[${templateResult.template.title}] Error: ` + resultResponse.error);
        }
      }
    } else if (execution.flow.executionType === "parallel") {
      // eslint-disable-next-line no-console
      console.log("[Prompts] Is parallel");
      if (index > 0) {
        if (!data.promptFlow) {
          data.promptFlow = { results: [] };
        }
        data.promptFlow.results[index - 1] = results[index - 1].response || "";
        // promptData.push({
        //   variable: {
        //     type: "promptFlow",
        //     name: `promptFlow.results[${index - 1}]`,
        //   },
        //   text: results[index - 1].response || "",
        // });
        // if (testData !== undefined) {
        //   testData.push({
        //     type: "promptFlow",
        //     name: `promptFlow.results[${index - 1}]`,
        //     value: results[index - 1].response || "",
        //   });
        // }
      }
      // parallel
      await Promise.all(
        toExecute.map(async (templateResult) => {
          if (!templateResult.template) {
            throw new Error("Invalid template result: " + templateResult.id);
          }
          if (index > 0) {
            // wait up to 20 seconds for each prompt previous to the current one
            let waitTime = 0;
            do {
              // eslint-disable-next-line no-console
              console.log("[Prompts] Waiting for previous prompt to finish");

              const previousResult = results[index - 1];
              if (previousResult.response !== undefined) {
                break;
              }
              waitTime += 1000;
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } while (waitTime < 20000);
          }
          // const prompt = await PromptBuilderVariableService.parseVariables(templateResult.template.template, promptData, testData, allEntities);
          let prompt = "";
          try {
            prompt = HandlebarsService.compile(templateResult.template.template, data);
          } catch (e: any) {
            throw new Error(`[${templateResult.template.title}] Error: ` + e.message);
          }
          index++;
          console.log({ prompt });
          return await executeTemplate({ execution, templateResult, prompt, isDebugging, model });
        })
      );
    } else {
      throw new Error(`Invalid execution type: ${execution.flow.executionType}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    await updatePromptFlowExecution(execution.id, {
      status: "success",
      completedAt: new Date(),
      duration,
    });
  } catch (e: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    await updatePromptFlowExecution(execution.id, {
      status: "error",
      error: e.message,
      completedAt: new Date(),
      duration,
    });
  }

  // eslint-disable-next-line no-console
  console.log("[Prompts] Completed prompt flow");

  const executionResult = await getPromptFlowExecution(id);
  let outputResult: PromptFlowOutputResultDto = {
    createdRows: [],
    updatedRows: [],
  };
  // if (testData === undefined) {
  console.log("Executing outputs");
  outputResult = await PromptFlowOutputService.executeOutputs({
    request,
    params,
    flowExecution: executionResult!,
    row,
    session: {
      tenantId,
      userId: userId || undefined,
    },
  });
  const parentRowEntity = allEntities.find((f) => f.id === row?.entityId);
  if (row && parentRowEntity) {
    await Promise.all(
      outputResult.createdRows.map(async (createdRow) => {
        const createdRowEntity = allEntities.find((f) => f.id === createdRow.entity.id);
        if (!createdRowEntity) {
          return;
        }
        const relationship = parentRowEntity.childEntities.find((f) => f.childId === createdRowEntity?.id);
        if (relationship) {
          await RowRelationshipsApi.createRelationship({
            parent: row,
            child: createdRow.row,
          });
        }
      })
    );
  }

  const result: PromptExecutionResultDto = {
    executionResult: executionResult!,
    outputResult,
  };
  return result;
}

async function executeTemplate({
  execution,
  templateResult,
  prompt,
  isDebugging,
  userId,
  model,
}: {
  execution: PromptFlowExecutionWithResults;
  templateResult: PromptTemplateResultWithTemplate;
  prompt: string;
  isDebugging?: boolean;
  userId?: string | null;
  model?: string;
}): Promise<{ response?: string | null; error?: string | null }> {
  if (!templateResult.template) {
    throw new Error(`Could not find template for result: ${templateResult.id}`);
  }
  const result: { response?: string | null; error?: string | null } = {};

  // eslint-disable-next-line no-console
  // console.log(`[Prompts] Running template: ${templateResult.template.title}`);
  await updatePromptTemplateResult(templateResult.id, {
    startedAt: new Date(),
    status: "running",
    prompt,
  });

  let debugging = isDebugging; //|| process.env.NODE_ENV === "development";
  try {
    if (!debugging) {
      // eslint-disable-next-line no-console
      console.log("[Prompts.OpenAIService] Creating chat completion", { prompt });
      const response = await AIService.createChatCompletion({
        model: model ?? execution.flow.model,
        role: "assistant",
        prompt,
        temperature: Number(templateResult.template.temperature),
        stream: execution.flow.stream,
        max_tokens: templateResult.template?.maxTokens && templateResult.template.maxTokens > 0 ? Number(templateResult.template.maxTokens) : undefined,
        user: userId ?? undefined,
      });
      if (!response || !response.length) {
        throw new Error("No response from OpenAI");
      }
      if (!response[0]) {
        throw new Error("No message in response from OpenAI");
      }
      result.response = response[0];
    } else {
      // wait 1 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000));
      result.response = `[Debugging] Template ${templateResult.template?.order}: Skipping OpenAI`;
    }
    // eslint-disable-next-line no-console
    // console.log("[Prompts.OpenAIService.Success] ", result.response);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[Prompts.OpenAIService.Error] ", e.message);
    result.error = e.message;
  }

  await updatePromptTemplateResult(templateResult.id, {
    status: result.error ? "error" : "success",
    completedAt: new Date(),
    response: result.response ?? undefined,
    error: result.error ?? undefined,
  });

  return result;
}

async function runFromForm({
  request,
  params,
  form,
  userId,
  tenantId,
  time,
  t,
}: {
  request: Request;
  params: Params;
  form: FormData;
  userId: string | undefined;
  tenantId: string | null;
  time?: TimeFunction;
  t: TFunction;
}) {
  const promptFlowId = form.get("promptFlowId")?.toString() ?? "";
  const flow = await getPromptFlow(promptFlowId);
  if (!flow) {
    throw Error("Invalid prompt flow");
  }

  const variables: { name: string; value: string }[] = form.getAll("variables[]").map((f) => JSON.parse(f.toString()));
  const rowId = form.get("rowId")?.toString() ?? "";
  let row: RowWithDetails | null = null;
  if (rowId) {
    row = await getRowById(rowId);
  }
  const allEntities = await getAllEntities({ tenantId: null });
  let variableObject: { [key: string]: string } = {};
  variables.forEach((f) => {
    variableObject[f.name] = f.value;
  });
  const promptFlowExecutionResult = await executeFlow({
    flow,
    userId,
    tenantId,
    variables: variableObject,
    time,
    request,
    params,
    allEntities,
    row: row ?? undefined,
    t,
  });
  return promptFlowExecutionResult;
}

async function createDefault(promptTitle?: string) {
  let toCreate = PromptBuilderDefault.myTemplates();
  if (promptTitle) {
    toCreate = toCreate.filter((t) => t.title === promptTitle);
  }

  const createdFlows = await Promise.all(
    toCreate.map(async ({ model, stream, title, description, actionTitle, executionType, promptFlowGroupId, inputEntityId, isPublic, templates }) => {
      await createPromptFlow({
        model,
        stream,
        title,
        description,
        actionTitle,
        promptFlowGroupId,
        inputEntityId,
        isPublic,
        executionType,
        templates,
      });
    })
  );

  return createdFlows;
}

export default {
  executeFlow,
  runFromForm,
  createDefault,
};
