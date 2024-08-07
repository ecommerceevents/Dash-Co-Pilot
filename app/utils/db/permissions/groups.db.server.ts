import { Group, GroupUser } from "@prisma/client";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";

export type GroupWithDetails = Group & {
  users: (GroupUser & { user: UserSimple })[];
};

export async function getAllGroups(tenantId: string | null): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      tenantId,
    },
    include: {
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getGroups(tenantId: string | null, ids: string[]): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      tenantId,
      id: {
        in: ids,
      },
    },
    include: {
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getMyGroups(userId: string, tenantId: string | null): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      tenantId,
      OR: [
        {
          createdByUserId: userId,
        },
        {
          users: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getGroup(id: string): Promise<GroupWithDetails | null> {
  return await db.group.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
  });
}

export async function createGroup(data: { createdByUserId: string; tenantId: string | null; name: string; description: string; color: number }) {
  return await db.group.create({
    data,
  });
}

export async function updateGroup(id: string, data: { name: string; description: string; color: number }) {
  return await db.group.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteGroup(id: string) {
  return await db.group.delete({
    where: {
      id,
    },
  });
}
