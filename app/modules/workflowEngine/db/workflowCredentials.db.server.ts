import { db } from "~/utils/db.server";

export async function getAllWorkflowCredentials({ tenantId }: { tenantId: string | null }) {
  return await db.workflowCredential.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkflowCredentialById(id: string, { tenantId }: { tenantId: string | null }) {
  return await db.workflowCredential
    .findFirstOrThrow({
      where: { id, tenantId },
    })
    .catch(() => {
      return null;
    });
}

export async function getWorkflowCredentialByName(name: string, { tenantId }: { tenantId: string | null }) {
  return await db.workflowCredential
    .findFirstOrThrow({
      where: { name, tenantId },
    })
    .catch(() => {
      return null;
    });
}

export async function createWorkflowCredential({
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
  return await db.workflowCredential.create({
    data: {
      tenantId,
      createdByUserId,
      name,
      value,
    },
  });
}

export async function updateWorkflowCredential(id: string, { value }: { value?: string }) {
  return await db.workflowCredential.update({
    where: {
      id,
    },
    data: {
      value,
    },
  });
}

export async function deleteWorkflowCredential(id: string, { tenantId }: { tenantId: string | null }) {
  return await db.workflowCredential.deleteMany({
    where: {
      id,
      tenantId,
    },
  });
}
