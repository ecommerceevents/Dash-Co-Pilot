import { TFunction } from "i18next";
import { db } from "~/utils/db.server";
import { createFeedback } from "../db/feedback.db.server";
import NotificationService from "~/modules/notifications/services/.server/NotificationService";

const MAX_FEEDBACK_PER_DAY = 3;

async function send({
  t,
  tenantId,
  userId,
  message,
  fromUrl,
}: {
  t: TFunction;
  tenantId: string | null;
  userId: string | null;
  message: string;
  fromUrl: string;
}) {
  if (tenantId) {
    const feedbackToday = await db.feedback.count({ where: { tenantId } });
    if (feedbackToday >= MAX_FEEDBACK_PER_DAY) {
      throw Error(t("feedback.limitReached"));
    }
  } else if (userId) {
    const feedbackToday = await db.feedback.count({ where: { userId } });
    if (feedbackToday >= MAX_FEEDBACK_PER_DAY) {
      throw Error(t("feedback.limitReached"));
    }
  }
  await NotificationService.sendToRoles({
    channel: "admin-users",
    tenantId: null,
    notification: {
      message: "[New Feedback] " + message,
      action: {
        url: "/admin/help-desk/feedback",
      },
    },
  });
  return await createFeedback({ tenantId, userId, message, fromUrl });
}

async function deleteMany({ ids }: { ids: string[] }) {
  return await db.feedback.deleteMany({
    where: {
      id: { in: ids },
    },
  });
}

export default {
  send,
  deleteMany,
};
