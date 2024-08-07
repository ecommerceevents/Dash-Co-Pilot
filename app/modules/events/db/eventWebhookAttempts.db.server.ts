import { db } from "~/utils/db.server";

export async function createEventWebhookAttempt(data: { eventId: string; endpoint: string }) {
  return await db.eventWebhookAttempt.create({
    data,
  });
}

export async function updateEventWebhookAttempt(
  id: string,
  data: { startedAt?: Date; finishedAt?: Date; success?: boolean; status?: number; message?: string; body?: string }
) {
  return await db.eventWebhookAttempt.update({
    where: { id },
    data,
  });
}

export async function deleteEventWebhookAttempt(id: string) {
  return await db.eventWebhookAttempt.delete({
    where: { id },
  });
}
