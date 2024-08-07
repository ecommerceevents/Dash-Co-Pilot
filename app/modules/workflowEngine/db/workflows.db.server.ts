import { Prisma, Workflow, WorkflowInputExample } from "@prisma/client";
import { db } from "~/utils/db.server";
import { WorkflowBlockWithDetails } from "./workflowBlocks.db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";

export type WorkflowWithDetails = Workflow & {
  tenant: TenantSimple | null;
  blocks: WorkflowBlockWithDetails[];
  inputExamples: WorkflowInputExample[];
  _count: {
    executions: number;
  };
};

export async function getAllWorkflows({
  tenantId,
  status,
}: {
  tenantId: string | null;
  status?: "draft" | "live" | "archived";
}): Promise<WorkflowWithDetails[]> {
  return await db.workflow.findMany({
    where: { tenantId, status },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      blocks: {
        include: {
          toBlocks: { include: { toBlock: true } },
          conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
        },
      },
      inputExamples: true,
      _count: { select: { executions: true } },
    },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
}

export async function getAllWorkflowsAppliesToAllTenants({
  tenantId,
  status,
}: {
  tenantId: string | null;
  status?: "draft" | "live" | "archived";
}): Promise<WorkflowWithDetails[]> {
  const where: Prisma.WorkflowWhereInput = { status };
  if (tenantId === null) {
    where.tenantId = null;
  } else {
    where.OR = [{ tenantId }, { appliesToAllTenants: true, tenantId: null }];
  }
  return await db.workflow.findMany({
    where,
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      blocks: {
        include: {
          toBlocks: { include: { toBlock: true } },
          conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
        },
      },
      inputExamples: true,
      _count: { select: { executions: true } },
    },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
}

export async function getWorkflowsIdsAndNames({ tenantId }: { tenantId: string | null }): Promise<{ id: string; name: string }[]> {
  return await db.workflow.findMany({
    where: { tenantId },
    select: { id: true, name: true },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
}

export async function getWorkflowById({ id, tenantId }: { id: string; tenantId: string | null }): Promise<WorkflowWithDetails | null> {
  return await db.workflow
    .findFirstOrThrow({
      where: { id, tenantId },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        blocks: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: {
              include: { conditions: { orderBy: { index: "asc" } } },
              orderBy: { index: "asc" },
            },
          },
        },
        inputExamples: true,
        _count: { select: { executions: true } },
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getWorkflow(id: string): Promise<WorkflowWithDetails | null> {
  return await db.workflow
    .findUnique({
      where: { id },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        blocks: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: {
              include: { conditions: { orderBy: { index: "asc" } } },
              orderBy: { index: "asc" },
            },
          },
        },
        inputExamples: true,
        _count: { select: { executions: true } },
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getWorkflowByName({ name, tenantId }: { name: string; tenantId: string | null }): Promise<WorkflowWithDetails | null> {
  return await db.workflow
    .findFirstOrThrow({
      where: { name, tenantId },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        blocks: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: {
              include: { conditions: { orderBy: { index: "asc" } } },
              orderBy: { index: "asc" },
            },
          },
        },
        inputExamples: true,
        _count: { select: { executions: true } },
      },
    })
    .catch(() => {
      return null;
    });
}

export async function createWorkflow(data: { tenantId: string | null; createdByUserId: string | null; name: string; description: string }) {
  return await db.workflow.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      description: data.description,
      createdByUserId: data.createdByUserId,
    },
  });
}

export async function updateWorkflow(
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: "draft" | "live" | "archived";
    appliesToAllTenants?: boolean;
  }
) {
  return await db.workflow.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      appliesToAllTenants: data.appliesToAllTenants,
    },
  });
}

export async function deleteWorkflow(id: string) {
  return await db.workflow.deleteMany({
    where: { id },
  });
}

export async function countWorkflows({ tenantId }: { tenantId: string | null }) {
  return await db.workflow.count({
    where: { tenantId },
  });
}
