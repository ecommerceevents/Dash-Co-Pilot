import { db } from "~/utils/db.server";
import { Prisma, PromptFlowGroup, PromptFlowGroupTemplate, PromptFlow } from "@prisma/client";

export type PromptFlowGroupWithDetails = PromptFlowGroup & {
  templates: PromptFlowGroupTemplate[];
  promptFlows: PromptFlow[];
};
export async function getAllPromptFlowGroups(): Promise<PromptFlowGroupWithDetails[]> {
  return await db.promptFlowGroup.findMany({
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetails | null> {
  return await db.promptFlowGroup.findUnique({
    where: { id },
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
  });
}

export async function getPromptFlowGroupByTitle(title: string): Promise<PromptFlowGroupWithDetails | null> {
  return await db.promptFlowGroup.findFirst({
    where: { title },
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
  });
}

export async function createPromptFlowGroup(data: {
  order: number;
  title: string;
  description: string;
  templates: {
    order: number;
    title: string;
  }[];
}): Promise<PromptFlowGroupWithDetails> {
  return await db.promptFlowGroup.create({
    data: {
      order: data.order,
      title: data.title,
      description: data.description,
      templates: { create: data.templates },
    },
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
  });
}

export async function updatePromptFlowGroup(
  id: string,
  data: {
    order?: number;
    title?: string;
    description?: string;
    templates?: {
      id?: string;
      order: number;
      title: string;
    }[];
  }
): Promise<PromptFlowGroupWithDetails> {
  const update: Prisma.PromptFlowGroupUncheckedUpdateInput = {
    title: data.title,
    description: data.description,
  };
  if (data.templates) {
    update.templates = {
      deleteMany: {},
      create: data.templates.map((s) => ({
        order: s.order,
        title: s.title,
      })),
    };
  }
  return await db.promptFlowGroup.update({
    where: { id },
    data: update,
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
  });
}

export async function deletePromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetails> {
  return await db.promptFlowGroup.delete({
    where: { id },
    include: {
      templates: { orderBy: { order: "asc" } },
      promptFlows: true,
    },
  });
}
