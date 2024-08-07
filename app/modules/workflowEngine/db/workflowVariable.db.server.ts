import { db } from "~/utils/db.server";

export async function getAllWorkflowVariables({ tenantId }: { tenantId: string | null }) {
  return await db.workflowVariable.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getWorkflowVariableById(id: string, { tenantId }: { tenantId: string | null }) {
  return await db.workflowVariable
    .findFirstOrThrow({
      where: { id, tenantId },
    })
    .catch(() => {
      return null;
    });
}

export async function getWorkflowVariableByName(name: string, { tenantId }: { tenantId: string | null }) {
  return await db.workflowVariable
    .findFirstOrThrow({
      where: { name, tenantId },
    })
    .catch(() => {
      return null;
    });
}

export async function createWorkflowVariable({
  tenantId,
  createdByUserId,
  name,
  value,
}: {
  tenantId: string | null;
  createdByUserId: string | null;
  name: string;
  value: string;
}) {
  return await db.workflowVariable.create({
    data: {
      tenantId,
      createdByUserId,
      name,
      value,
    },
  });
}

export async function updateWorkflowVariable(id: string, { name, value }: { name?: string; value?: string }) {
  return await db.workflowVariable.update({
    where: {
      id,
    },
    data: {
      name,
      value,
    },
  });
}

export async function deleteWorkflowVariable(id: string) {
  return await db.workflowVariable.delete({
    where: {
      id,
    },
  });
}
