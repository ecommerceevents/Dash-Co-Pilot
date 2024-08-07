import { PromptFlowExecution, PromptTemplateResult, PromptFlow, PromptTemplate, Tenant } from "@prisma/client";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { UserSimple } from "~/utils/db/users.db.server";

export type PromptTemplateResultWithTemplate = PromptTemplateResult & {
  template: PromptTemplate | null;
};

export type PromptFlowExecutionWithResults = PromptFlowExecution & {
  user: UserSimple | null;
  tenant: Tenant | null;
  flow: PromptFlow;
  results: PromptTemplateResultWithTemplate[];
};

export async function getPromptFlowExecutions(): Promise<PromptFlowExecutionWithResults[]> {
  return await db.promptFlowExecution.findMany({
    include: {
      flow: true,
      user: { select: UserModelHelper.selectSimpleUserProperties },
      tenant: true,
      results: { include: { template: true }, orderBy: { order: "asc" } },
    },
  });
}

export async function getPromptFlowExecution(id: string): Promise<PromptFlowExecutionWithResults | null> {
  return await db.promptFlowExecution.findUnique({
    where: { id },
    include: {
      flow: true,
      user: { select: UserModelHelper.selectSimpleUserProperties },
      tenant: true,
      results: { include: { template: true }, orderBy: { order: "desc" } },
    },
  });
}

export async function createPromptFlowExecution(data: {
  flowId: string;
  userId: string | null;
  tenantId: string | null;
  status: string;
  model: string;
  results: {
    order: number;
    templateId: string;
    status: string;
    prompt: string;
  }[];
}): Promise<PromptFlowExecution> {
  return await db.promptFlowExecution.create({
    data: {
      flowId: data.flowId,
      userId: data.userId,
      tenantId: data.tenantId,
      status: data.status,
      model: data.model,
      results: { create: data.results },
    },
  });
}

export async function updatePromptFlowExecution(
  id: string,
  data: {
    status?: string;
    error?: string | null;
    startedAt?: Date;
    completedAt?: Date;
    duration?: number | null;
  }
): Promise<PromptFlowExecution> {
  return await db.promptFlowExecution.update({
    where: { id },
    data: {
      status: data.status,
      error: data.error,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      duration: data.duration,
    },
  });
}

export async function updatePromptTemplateResult(
  id: string,
  data: {
    status?: string;
    prompt?: string;
    response?: string;
    error?: string | null;
    startedAt?: Date;
    completedAt?: Date;
  }
): Promise<PromptTemplateResult> {
  return await db.promptTemplateResult.update({
    where: { id },
    data,
  });
}

export async function deletePromptFlowExecution(id: string) {
  return await db.promptFlowExecution.delete({ where: { id } });
}
