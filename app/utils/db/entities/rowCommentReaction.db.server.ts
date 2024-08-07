import { RowCommentReaction } from "@prisma/client";
import { db } from "~/utils/db.server";
import { UserSimple } from "../users.db.server";

export type RowCommentReactionWithDetails = RowCommentReaction & {
  createdByUser: UserSimple;
};
export async function setRowCommentReaction(data: { createdByUserId: string; rowCommentId: string; reaction: string }) {
  const existing = await db.rowCommentReaction.findFirst({
    where: {
      createdByUserId: data.createdByUserId,
      rowCommentId: data.rowCommentId,
      reaction: data.reaction,
    },
  });
  if (!existing) {
    await db.rowCommentReaction.create({
      data,
    });
    return true;
  } else {
    await db.rowCommentReaction.deleteMany({
      where: {
        ...data,
      },
    });
    return false;
  }
}
