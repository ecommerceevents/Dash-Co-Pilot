import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { PromptFlowWithDetails } from "../db/promptFlows.db.server";
import { PromptBuilderVariableDto } from "../dtos/PromptBuilderVariableDto";
import { RowDto } from "~/modules/rows/repositories/RowDto";

function getUsedVariables(template: string, entities: EntityWithDetails[]): PromptBuilderVariableDto[] {
  const variables = getPossibleVariables(entities);

  const values: PromptBuilderVariableDto[] = [];

  variables.forEach((variable) => {
    // eslint-disable-next-line no-useless-escape
    const escapedVariableName = variable.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`{{${escapedVariableName}}}`, "g");
    if (regex.test(template)) {
      values.push(variable);
    }
  });

  const allVariables: string[] = [];
  // find every variable within {{}} and escape them, can be "{{row.entity.countOfRows}}"
  const regex = new RegExp(`{{(.*?)}}`, "g");
  let match;
  while ((match = regex.exec(template)) !== null) {
    const variableName = match[1];
    allVariables.push(variableName);
  }

  const nonCatchedVariables = allVariables.filter((f) => !values.find((v) => v.name === f));

  nonCatchedVariables.forEach((nonCatchedVariable) => {
    if (nonCatchedVariable.startsWith("promptFlow.")) {
      return;
    }
    values.push({
      type: "text",
      name: nonCatchedVariable,
    });
  });

  return values;
}

function getPossibleVariables(entities: EntityWithDetails[], upToIdx?: number): PromptBuilderVariableDto[] {
  const variables: PromptBuilderVariableDto[] = [
    { type: "text", name: "text" },
    { type: "tenant", name: "tenant.name" },
    { type: "tenant", name: "tenant.slug" },
    { type: "user", name: "user.email" },
    { type: "user", name: "user.firstName" },
    { type: "user", name: "user.lastName" },
    { type: "user", name: "user.name" },
  ];
  entities.forEach((entity) => {
    entity.properties.forEach((property) => {
      // variables.push({ type: "row", name: `entity.${entity.name}.${property.name}` });
      variables.push({ type: "row", name: `row.${entity.name}.${property.name}` });
    });
  });

  if (upToIdx !== undefined) {
    let promptFlowResults: PromptBuilderVariableDto[] = [];
    for (let index = 0; index < upToIdx; index++) {
      promptFlowResults.push({ type: "promptFlow", name: `promptFlow.results.[${index}]` });
    }
    // push to top if any
    if (promptFlowResults.length > 0) {
      variables.unshift(...promptFlowResults);
    }
  }

  return variables;
}

function getVariablesNeeded(flow: PromptFlowWithDetails, allEntities: EntityWithDetails[]) {
  const allVariables: PromptBuilderVariableDto[] = [];
  flow.templates.forEach((template) => {
    const variables = getUsedVariables(template.template, allEntities);
    variables.forEach((variable) => {
      if (allVariables.find((f) => f.name === variable.name)) {
        return;
      }
      allVariables.push(variable);
    });
  });
  return allVariables;
}

function getPromptFlowsOfType({ type, promptFlows, row }: { type: "list" | "edit"; promptFlows: PromptFlowWithDetails[]; row?: RowDto }) {
  let items: PromptFlowWithDetails[] = [];
  if (type === "list") {
    items = promptFlows.filter((f) => f.inputEntityId === null);
  } else if (type === "edit") {
    if (row) {
      promptFlows.forEach((promptFlow) => {
        if (promptFlow.inputEntityId === row.entityId) {
          if (promptFlow.inputVariables.find((f) => f.name === "selectedText")) {
            return;
          }
          items.push(promptFlow);
          return;
        }
      });
    }
  }
  return items;
}

export default {
  getUsedVariables,
  getPossibleVariables,
  getVariablesNeeded,
  getPromptFlowsOfType,
};
