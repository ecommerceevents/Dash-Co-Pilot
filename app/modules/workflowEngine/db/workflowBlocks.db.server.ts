import { WorkflowBlock, WorkflowBlockCondition, WorkflowBlockConditionGroup, WorkflowBlockToBlock } from "@prisma/client";
import { db } from "~/utils/db.server";

export type WorkflowBlockWithDetails = WorkflowBlock & {
  toBlocks: (WorkflowBlockToBlock & {
    toBlock: WorkflowBlock;
  })[];
  conditionsGroups: (WorkflowBlockConditionGroup & {
    conditions: WorkflowBlockCondition[];
  })[];
};

export async function getWorkflowBlockTypes(workflowId: string) {
  const workflowBlocks = await db.workflowBlock.findMany({
    where: {
      workflowId,
    },
    select: { type: true },
  });
  return workflowBlocks.map((block) => block.type);
}

export async function createWorkflowBlock(data: {
  workflowId: string;
  type: string;
  input: string;
  description: string;
  isTrigger: boolean;
  isBlock: boolean;
  // positionX: number;
  // positionY: number;
}) {
  return await db.workflowBlock.create({
    data: {
      workflowId: data.workflowId,
      type: data.type,
      description: data.description,
      isTrigger: data.isTrigger,
      isBlock: data.isBlock,
      input: data.input,
      // positionX: data.positionX,
      // positionY: data.positionY,
    },
  });
}

export async function updateWorkflowBlock(
  id: string,
  data: {
    type?: string;
    input?: string;
    description?: string;
    isTrigger?: boolean;
    isBlock?: boolean;
  }
) {
  return await db.workflowBlock.update({
    where: { id },
    data: {
      type: data.type,
      description: data.description,
      input: data.input,
      isTrigger: data.isTrigger,
      isBlock: data.isBlock,
      // positionX: data.positionX,
      // positionY: data.positionY,
    },
  });
}
