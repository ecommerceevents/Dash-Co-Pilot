import { Prisma, WorkflowBlockExecution, WorkflowExecution } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { WorkflowBlockWithDetails } from "./workflowBlocks.db.server";
import { WorkflowStatus } from "../dtos/WorkflowStatus";

export type WorkflowExecutionWithDetails = WorkflowExecution & {
  workflow: { id: string; name: string };
  tenant: { id: string; name: string; slug: string } | null;
  waitingBlock: WorkflowBlockWithDetails | null;
  blockRuns: (WorkflowBlockExecution & {
    workflowBlock: {
      type: string;
      description: string;
    };
  })[];
};

export async function getAllWorkflowExecutions({
  tenantId,
  pagination,
  filters,
}: {
  tenantId: string | null;
  pagination: { page: number; pageSize: number };
  filters: FiltersDto;
}): Promise<{ items: WorkflowExecutionWithDetails[]; pagination: PaginationDto }> {
  let where: Prisma.WorkflowExecutionWhereInput = {};
  if (tenantId === null) {
    where = {
      OR: [{ appliesToAllTenants: true }, { tenantId: null }],
    };
  } else {
    where = {
      tenantId,
      appliesToAllTenants: false,
    };
  }
  const workflowId = filters?.properties.find((f) => f.name === "workflowId")?.value ?? filters?.query ?? "";
  const status = filters?.properties.find((f) => f.name === "status")?.value ?? filters?.query ?? "";
  const type = filters?.properties.find((f) => f.name === "workflowId")?.value ?? filters?.query ?? "";
  if (workflowId) {
    where.workflowId = workflowId;
  }
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  const items = await db.workflowExecution.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      workflow: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, slug: true } },
      waitingBlock: {
        include: {
          toBlocks: { include: { toBlock: true } },
          conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
        },
      },
      blockRuns: {
        orderBy: { startedAt: "asc" },
        include: {
          workflowBlock: {
            select: { type: true, description: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const totalItems = await db.workflowExecution.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function getWorkflowExecutions(
  { workflowId }: { workflowId: string },
  session: { tenantId: string | null }
): Promise<WorkflowExecutionWithDetails[]> {
  const where: Prisma.WorkflowExecutionWhereInput = {
    workflowId,
  }
  if (session.tenantId !== null) {
    where.tenantId = session.tenantId
  }
  return db.workflowExecution.findMany({
    where,
    include: {
      workflow: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, slug: true } },
      waitingBlock: {
        include: {
          toBlocks: { include: { toBlock: true } },
          conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
        },
      },
      blockRuns: {
        orderBy: { startedAt: "asc" },
        include: {
          workflowBlock: {
            select: { type: true, description: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkflowExecution(id: string, session: { tenantId: string | null }): Promise<WorkflowExecutionWithDetails | null> {
  return db.workflowExecution
    .findFirstOrThrow({
      where: {
        id,
        tenantId: session.tenantId,
      },
      include: {
        workflow: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, slug: true } },
        waitingBlock: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        blockRuns: {
          orderBy: { startedAt: "asc" },
          include: {
            workflowBlock: {
              select: { type: true, description: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => null);
}

export async function countWorkflowExecutions({ tenantId }: { tenantId: string | null }): Promise<number> {
  let where: Prisma.WorkflowExecutionWhereInput = {};
  if (tenantId === null) {
    where = {
      OR: [{ appliesToAllTenants: true }, { tenantId: null }],
    };
  } else {
    where = {
      tenantId,
      appliesToAllTenants: false,
    };
  }
  return await db.workflowExecution.count({
    where,
  });
}

export async function updateWorkflowExecution(
  id: string,
  {
    error,
    status,
    output,
    duration,
    waitingBlockId,
  }: {
    error: string | null;
    status: WorkflowStatus;
    output: string;
    duration: number;
    waitingBlockId: string | null;
  }
): Promise<WorkflowExecutionWithDetails> {
  return await db.workflowExecution.update({
    where: { id },
    data: {
      status: error ? "error" : status,
      output,
      duration: Math.round(duration),
      endedAt: new Date(),
      error,
      waitingBlockId,
    },
    include: {
      workflow: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, slug: true } },
      waitingBlock: {
        include: {
          toBlocks: { include: { toBlock: true } },
          conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
        },
      },
      blockRuns: {
        orderBy: { startedAt: "asc" },
        include: {
          workflowBlock: {
            select: { type: true, description: true },
          },
        },
      },
    },
  });
}

export async function deleteWorkflowExecution(id: string) {
  return await db.workflowExecution.delete({
    where: {
      id,
    },
  });
}
