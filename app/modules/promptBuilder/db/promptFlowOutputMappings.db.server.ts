import { PromptFlowOutputMapping, PromptTemplate } from "@prisma/client";
import { db } from "~/utils/db.server";

export type PromptFlowOutputMappingWithDetails = PromptFlowOutputMapping & {
  promptTemplate: PromptTemplate;
  property: { id: string; name: string; title: string };
};

export async function getPromptFlowOutputMapping(id: string): Promise<PromptFlowOutputMappingWithDetails | null> {
  return await db.promptFlowOutputMapping.findUnique({
    where: { id },
    include: {
      promptTemplate: true,
      property: { select: { id: true, name: true, title: true } },
    },
  });
}

export async function createPromptFlowOutputMapping(data: { promptFlowOutputId: string; promptTemplateId: string; propertyId: string }) {
  return await db.promptFlowOutputMapping.create({
    data: {
      promptFlowOutputId: data.promptFlowOutputId,
      promptTemplateId: data.promptTemplateId,
      propertyId: data.propertyId,
    },
  });
}

export async function updatePromptFlowOutputMapping(id: string, data: { promptTemplateId: string; propertyId: string }) {
  return await db.promptFlowOutputMapping.update({
    where: { id },
    data: {
      promptTemplateId: data.promptTemplateId,
      propertyId: data.propertyId,
    },
  });
}

export async function deletePromptFlowOutputMapping(id: string): Promise<PromptFlowOutputMapping> {
  return await db.promptFlowOutputMapping.delete({
    where: { id },
  });
}
