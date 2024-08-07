import { PromptFlowOutput, PromptFlowOutputMapping, PromptTemplate } from "@prisma/client";
import { db } from "~/utils/db.server";

export type PromptFlowOutputWithDetails = PromptFlowOutput & {
  entity: { id: string; name: string; title: string };
  mappings: (PromptFlowOutputMapping & {
    promptTemplate: PromptTemplate;
    property: { id: string; name: string; title: string; type: number };
  })[];
};

export async function getPromptFlowOutputs(promptFlowId: string): Promise<PromptFlowOutputWithDetails[]> {
  return await db.promptFlowOutput.findMany({
    where: { promptFlowId },
    include: {
      entity: { select: { id: true, name: true, title: true } },
      mappings: {
        include: {
          promptTemplate: true,
          property: { select: { id: true, name: true, title: true, type: true } },
        },
      },
    },
  });
}

export async function getPromptFlowOutput(id: string): Promise<PromptFlowOutputWithDetails | null> {
  return await db.promptFlowOutput.findUnique({
    where: { id },
    include: {
      entity: { select: { id: true, name: true, title: true } },
      mappings: {
        include: {
          promptTemplate: true,
          property: { select: { id: true, name: true, title: true, type: true } },
        },
      },
    },
  });
}

export async function createPromptFlowOutput(data: { promptFlowId: string; type: string; entityId: string }) {
  return await db.promptFlowOutput.create({
    data: {
      promptFlowId: data.promptFlowId,
      type: data.type,
      entityId: data.entityId,
    },
  });
}

export async function updatePromptFlowOutput(id: string, data: { type: string; entityId: string }) {
  return await db.promptFlowOutput.update({
    where: {
      id,
    },
    data: {
      type: data.type,
      entityId: data.entityId,
    },
  });
}

export async function deletePromptFlowOutput(id: string): Promise<PromptFlowOutput> {
  return await db.promptFlowOutput.delete({ where: { id } });
}
