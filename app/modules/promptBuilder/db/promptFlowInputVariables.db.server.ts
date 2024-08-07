import { PromptFlowInputVariable } from "@prisma/client";
import { db } from "~/utils/db.server";

export type PromptFlowInputVariableWithDetails = PromptFlowInputVariable & {};

export async function getPromptFlowVariables(promptFlowId: string): Promise<PromptFlowInputVariableWithDetails[]> {
  return await db.promptFlowInputVariable.findMany({
    where: { promptFlowId },
  });
}

export async function getPromptFlowVariable(id: string): Promise<PromptFlowInputVariableWithDetails | null> {
  return await db.promptFlowInputVariable.findUnique({
    where: { id },
  });
}

export async function createPromptFlowVariable(data: { promptFlowId: string; type: string; name: string; title: string; isRequired: boolean }) {
  return await db.promptFlowInputVariable.create({
    data: {
      promptFlowId: data.promptFlowId,
      type: data.type,
      name: data.name,
      title: data.title,
      isRequired: data.isRequired,
    },
  });
}

export async function updatePromptFlowVariable(id: string, data: { type: string; name: string; title: string; isRequired: boolean }) {
  return await db.promptFlowInputVariable.update({
    where: {
      id,
    },
    data: {
      type: data.type,
      name: data.name,
      title: data.title,
      isRequired: data.isRequired,
    },
  });
}

export async function deletePromptFlowVariable(id: string): Promise<PromptFlowInputVariable> {
  return await db.promptFlowInputVariable.delete({
    where: { id },
  });
}
