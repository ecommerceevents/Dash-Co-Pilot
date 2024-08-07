import {
  Prisma,
  PromptFlow,
  PromptFlowExecution,
  PromptFlowGroup,
  PromptFlowInputVariable,
  PromptFlowOutput,
  PromptFlowOutputMapping,
  PromptTemplate,
  PromptTemplateResult,
  Tenant,
} from "@prisma/client";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import { getPromptFlowOutputs } from "./promptFlowOutputs.db.server";

export type PromptFlowWithDetails = PromptFlow & {
  inputVariables: PromptFlowInputVariable[];
  inputEntity: { id: string; name: string; title: string } | null;
  templates: PromptTemplate[];
  outputs: (PromptFlowOutput & {
    entity: { id: string; name: string; title: string };
    mappings: (PromptFlowOutputMapping & {
      promptTemplate: PromptTemplate;
      property: { id: string; name: string; title: string };
    })[];
  })[];
};

export type PromptFlowWithExecutions = PromptFlowWithDetails & {
  promptFlowGroup: PromptFlowGroup | null;
  executions: (PromptFlowExecution & {
    user: UserSimple | null;
    tenant: Tenant | null;
    results: PromptTemplateResult[];
  })[];
};

const includeOutputs = {
  include: {
    entity: { select: { id: true, name: true, title: true } },
    mappings: {
      include: {
        promptTemplate: true,
        property: { select: { id: true, name: true, title: true } },
      },
    },
  },
};

export async function getPromptFlows({ isPublic }: { isPublic?: boolean } = {}): Promise<PromptFlowWithDetails[]> {
  return await db.promptFlow.findMany({
    where: {
      public: isPublic,
    },
    include: {
      promptFlowGroup: true,
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
    orderBy: [{ promptFlowGroup: { title: "asc" } }, { createdAt: "desc" }],
  });
}

export async function getPromptFlowsWithExecutions({ isPublic }: { isPublic?: boolean } = {}): Promise<PromptFlowWithExecutions[]> {
  return await db.promptFlow.findMany({
    where: {
      public: isPublic,
    },
    include: {
      promptFlowGroup: true,
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
      executions: {
        include: {
          user: { select: UserModelHelper.selectSimpleUserProperties },
          tenant: true,
          results: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ promptFlowGroup: { title: "asc" } }, { createdAt: "desc" }],
  });
}

export async function getPromptFlow(id: string): Promise<PromptFlowWithDetails | null> {
  return await db.promptFlow.findUnique({
    where: { id },
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });
}

export async function getPromptFlowsByEntity(entityId: string): Promise<PromptFlowWithDetails[]> {
  return await db.promptFlow.findMany({
    where: {
      OR: [
        { inputEntityId: entityId },
        {
          outputs: {
            some: {
              entityId,
            },
          },
        },
      ],
    },
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });
}

export async function getPromptFlowsByEntityName(entityName: string): Promise<PromptFlowWithDetails[]> {
  return await db.promptFlow.findMany({
    where: {
      OR: [
        { inputEntity: { name: entityName } },
        {
          outputs: {
            some: {
              entity: { name: entityName },
            },
          },
        },
      ],
    },
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });
}

export async function getPromptFlowByName(title: string): Promise<PromptFlowWithDetails | null> {
  return await db.promptFlow.findFirst({
    where: { title },
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });
}

export async function getPromptFlowWithExecutions(id: string): Promise<PromptFlowWithExecutions | null> {
  return await db.promptFlow.findUnique({
    where: { id },
    include: {
      promptFlowGroup: true,
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
      executions: {
        include: {
          user: { select: UserModelHelper.selectSimpleUserProperties },
          tenant: true,
          results: { orderBy: { order: "desc" } },
        },
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });
}

export type CreatePromptFlowDto = {
  model: string;
  stream: boolean;
  title: string;
  description: string;
  actionTitle: string | null;
  executionType: string; // sequential, parallel
  promptFlowGroupId: string | null;
  inputEntityId: string | null;
  isPublic: boolean;
  templates: {
    order: number;
    title: string;
    template: string;
    temperature: number;
    maxTokens: number | null;
  }[];
  inputVariables?: {
    type: string;
    name: string;
    title: string;
    isRequired: boolean;
  }[];
  outputs?: {
    type: string;
    entityId: string;
    mappings: {
      promptTemplateId: string;
      propertyId: string;
    }[];
  }[];
};
export async function createPromptFlow(data: CreatePromptFlowDto): Promise<PromptFlowWithDetails> {
  return await db.promptFlow.create({
    data: {
      model: data.model,
      stream: data.stream,
      title: data.title,
      description: data.description,
      actionTitle: data.actionTitle,
      executionType: data.executionType,
      promptFlowGroupId: data.promptFlowGroupId,
      inputEntityId: data.inputEntityId,
      templates: { create: data.templates },
      inputVariables: { create: data.inputVariables },
      public: data.isPublic,
      outputs: {
        create: data.outputs?.map((o) => {
          return {
            type: o.type,
            entityId: o.entityId,
            mappings: { create: o.mappings },
          };
        }),
      },
    },
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });
}

export async function updatePromptFlow(
  id: string,
  data: {
    model?: string;
    stream?: boolean;
    title?: string;
    description?: string;
    actionTitle?: string | null;
    executionType?: string; // sequential, parallel
    promptFlowGroupId?: string | null;
    inputEntityId?: string | null;
    isPublic?: boolean;
    templates?: {
      id?: string;
      order: number;
      title: string;
      template: string;
      temperature: number;
      maxTokens: number | null;
    }[];
    outputs?: {
      type: string;
      entityId: string;
      mappings: {
        promptTemplateId: string;
        propertyId: string;
      }[];
    }[];
  }
): Promise<PromptFlowWithDetails> {
  const outputs = await getPromptFlowOutputs(id);
  const update: Prisma.PromptFlowUncheckedUpdateInput = {
    model: data.model,
    stream: data.stream,
    title: data.title,
    description: data.description,
    actionTitle: data.actionTitle,
    executionType: data.executionType,
    promptFlowGroupId: data.promptFlowGroupId,
    inputEntityId: data.inputEntityId,
    public: data.isPublic,
  };
  if (data.templates) {
    update.templates = {
      deleteMany: {},
      create: data.templates.map((s) => ({
        order: s.order,
        title: s.title,
        template: s.template,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
      })),
    };
  }
  if (data.outputs) {
    update.outputs = {
      deleteMany: {},
      create: data.outputs.map((s) => ({
        type: s.type,
        entityId: s.entityId,
        mappings: {
          create: s.mappings.map((o) => ({
            promptTemplateId: o.promptTemplateId,
            propertyId: o.propertyId,
          })),
        },
      })),
    };
  }
  const updated = await db.promptFlow.update({
    where: { id },
    data: update,
    include: {
      inputVariables: true,
      inputEntity: { select: { id: true, name: true, title: true } },
      templates: { orderBy: { order: "asc" } },
      outputs: includeOutputs,
    },
  });

  // since templates are recreated, we need to recreate the mappings
  await Promise.all(
    outputs.map(async (output) => {
      return output.mappings.map(async (mapping) => {
        const template = updated.templates.find((t) => t.title === mapping.promptTemplate.title);
        if (template) {
          await db.promptFlowOutputMapping
            .create({
              data: {
                promptFlowOutputId: output.id,
                promptTemplateId: template.id,
                propertyId: mapping.propertyId,
              },
            })
            .catch((e) => {
              // console.error(e);
            });
        }
      });
    })
  );
  return updated;
}

export async function deletePromptFlow(id: string) {
  await db.promptTemplateResult.deleteMany({ where: { flowExecution: { flowId: id } } });
  await db.promptFlowExecution.deleteMany({ where: { flowId: id } });
  return await db.promptFlow.delete({ where: { id } });
}
