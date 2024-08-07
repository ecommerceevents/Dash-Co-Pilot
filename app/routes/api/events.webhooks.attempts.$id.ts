import { EventWebhookAttempt } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request, params }) => {
  let attempt: EventWebhookAttempt | null = null;
  try {
    if (request.method === "POST") {
      attempt = await db.eventWebhookAttempt.findUnique({ where: { id: params.id ?? "" } });
      if (!attempt) {
        throw new Error("Invalid event webhook attempt");
      }
      await db.eventWebhookAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          startedAt: new Date(),
        },
      });
      // eslint-disable-next-line no-console
      console.log("event-webhook-endpoint", attempt.endpoint);
      const body = await request.json();
      const response = await fetch(attempt.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        await db.eventWebhookAttempt.update({
          where: {
            id: attempt.id,
          },
          data: {
            finishedAt: new Date(),
            success: true,
            status: response.status,
            message: response.statusText,
            body: JSON.stringify(await response.json()),
          },
        });
      } else {
        await db.eventWebhookAttempt.update({
          where: {
            id: attempt.id,
          },
          data: {
            finishedAt: new Date(),
            success: false,
            status: response.status,
            message: await response.text(),
          },
        });
      }

      return json({}, { status: 200 });
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log("event-webhook-attempt-error", e.message);
    if (attempt) {
      await db.eventWebhookAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          finishedAt: new Date(),
          success: false,
          status: 400,
          message: e.message,
        },
      });
    }
    return json({ error: e.message }, { status: 400 });
  }
};
