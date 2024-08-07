import { Tag, TagTenant, TagUser, Tenant } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";

export type TagWithDetails = Tag & {
  users: (TagUser & { user: UserSimple })[];
  tenants: (TagTenant & { tenant: Tenant })[];
};
export async function getAllTags() {
  return await db.tag.findMany({
    include: {
      users: { select: UserModelHelper.selectSimpleUserProperties },
      tenants: true,
    },
  });
}

export async function setTag(data: { name: string; color?: Colors; userId?: string; tenantId?: string }) {
  let tag = await db.tag.findUnique({
    where: { name: data.name },
  });
  if (!tag) {
    tag = await db.tag.create({
      data: { name: data.name, color: data.color },
    });
  }
  if (data.userId) {
    await db.tagUser.create({
      data: { tagId: tag.id, userId: data.userId },
    });
  }
  if (data.tenantId) {
    await db.tagTenant.create({
      data: { tagId: tag.id, tenantId: data.tenantId },
    });
  }
  return tag;
}
