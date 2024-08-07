import { Prisma, RowTask } from "@prisma/client";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";
import { RowWithValues } from "./rows.db.server";

export type RowTaskWithDetails = RowTask & {
  createdByUser: UserSimple;
  assignedToUser: UserSimple | null;
  row: RowWithValues;
};

export async function getRowTasks(rowId: string): Promise<RowTaskWithDetails[]> {
  return await db.rowTask.findMany({
    where: {
      rowId,
    },
    include: {
      ...UserModelHelper.includeSimpleCreatedByUser,
      assignedToUser: true,
      row: {
        include: {
          createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
          createdByApiKey: true,
          values: { include: { media: true, multiple: true, range: true } },
        },
      },
    },
    orderBy: [
      {
        completed: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
}

export async function getRowTask(id: string): Promise<RowTaskWithDetails | null> {
  return await db.rowTask.findUnique({
    where: {
      id,
    },
    include: {
      ...UserModelHelper.includeSimpleCreatedByUser,
      assignedToUser: true,
      row: {
        include: {
          createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
          createdByApiKey: true,
          values: { include: { media: true, multiple: true, range: true } },
        },
      },
    },
  });
}

export async function createRowTask(data: {
  createdByUserId: string;
  rowId: string;
  title: string;
  description?: string;
  completed?: boolean;
  completedAt?: Date | null;
  completedByUserId?: string | null;
  assignedToUserId?: string | null;
  deadline?: Date | null;
}) {
  return await db.rowTask.create({
    data: {
      createdByUserId: data.createdByUserId,
      rowId: data.rowId,
      title: data.title,
      description: data.description ?? "",
      completed: data.completed ?? false,
      completedAt: data.completedAt ?? null,
      completedByUserId: data.completedByUserId ?? null,
      assignedToUserId: data.assignedToUserId ?? null,
      deadline: data.deadline ?? null,
    },
  });
}

export async function updateRowTask(
  id: string,
  data: {
    createdByUserId?: string;
    rowId?: string;
    title?: string;
    description?: string;
    completed?: boolean;
    completedAt?: Date | null;
    completedByUserId?: string | null;
    assignedToUserId?: string | null;
    deadline?: Date | null;
  }
) {
  return await db.rowTask.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteRowTask(id: string) {
  return await db.rowTask.delete({
    where: {
      id,
    },
  });
}

export async function getAllRowTasks({
  completed,
  assignedOrCreatedUserId,
}: {
  completed?: boolean;
  assignedOrCreatedUserId?: string;
}): Promise<RowTaskWithDetails[]> {
  const userWhere: Prisma.RowTaskWhereInput = {};
  if (assignedOrCreatedUserId) {
    userWhere.OR = [
      {
        createdByUserId: assignedOrCreatedUserId,
      },
      {
        assignedToUserId: assignedOrCreatedUserId,
      },
    ];
  }
  return await db.rowTask.findMany({
    where: {
      completed,
      ...userWhere,
    },
    include: {
      ...UserModelHelper.includeSimpleCreatedByUser,
      assignedToUser: true,
      row: {
        include: {
          createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
          createdByApiKey: true,
          values: { include: { media: true, multiple: true, range: true } },
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
}
