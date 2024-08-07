import { EntityWebhook } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getBaseURL } from "~/utils/url.server";

export type EntityWebhookWithDetails = EntityWebhook & { _count: { logs: number } };
export async function getEntityWebhooks(entityId: string) {
  return await db.entityWebhook.findMany({
    where: {
      entityId,
    },
    include: {
      _count: {
        select: {
          logs: true,
        },
      },
    },
  });
}

export async function getEntityWebhook(id: string) {
  return await db.entityWebhook.findUnique({
    where: {
      id,
    },
  });
}

export async function getEntityWebhooksByAction(entityId: string, action: string) {
  return await db.entityWebhook.findMany({
    where: {
      entityId,
      action,
    },
  });
}

export async function createEntityWebhook(data: { entityId: string; action: string; method: string; endpoint: string }) {
  return await db.entityWebhook.create({
    data,
  });
}

export async function updateEntityWebhook(
  id: string,
  data: {
    action: string;
    method: string;
    endpoint: string;
  }
) {
  return await db.entityWebhook.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntityWebhook(id: string) {
  return await db.entityWebhook.delete({
    where: {
      id,
    },
  });
}

export async function callEntityWebhooks({
  logId,
  entityId,
  action,
  body,
  request,
}: {
  logId: string;
  entityId: string;
  action: string;
  body: string;
  request?: Request;
}) {
  const webhooks = await getEntityWebhooksByAction(entityId, action);
  return await Promise.all(
    webhooks.map(async (webhook) => {
      if (webhook.endpoint) {
        let endpoint = webhook.endpoint; //start edit
        if (endpoint.startsWith("/") && request) {
          endpoint = getBaseURL(request) + endpoint;
        }
        const response = await fetch(endpoint, {
          //end edit
          method: webhook.method,
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
        // eslint-disable-next-line no-console
        console.log({ response });
        return db.entityWebhookLog.create({
          data: {
            webhookId: webhook.id,
            logId,
            status: response.status,
          },
        });
      }
    })
  );
}
