import { db } from "~/utils/db.server";

export async function createUserGroup(userId: string, groupId: string) {
  return await db.groupUser.create({
    data: {
      userId,
      groupId,
    },
  });
}

export async function deleteUserGroup(userId: string, groupId: string) {
  return await db.groupUser.deleteMany({
    where: {
      userId,
      groupId,
    },
  });
}

export async function deleteGroupUsers(groupId: string) {
  return await db.groupUser.deleteMany({
    where: {
      groupId,
    },
  });
}
