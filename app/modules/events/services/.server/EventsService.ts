/* eslint-disable no-console */
import { Event } from "@prisma/client";
import NotificationService from "~/modules/notifications/services/.server/NotificationService";
import { getBaseURL } from "~/utils/url.server";
import { createEventWebhookAttempt, updateEventWebhookAttempt } from "../../db/eventWebhookAttempts.db.server";
import { createEvent } from "../../db/events.db.server";
import { ApplicationEvent, ApplicationEvents } from "../../types/ApplicationEvent";
import EventUtils from "../../utils/EventUtils";
import WorkflowsService from "~/modules/workflowEngine/services/WorkflowsService";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import WorkflowsExecutionsService from "~/modules/workflowEngine/services/WorkflowsExecutionsService";

type ICreateApplicationEvent = {
  request: Request;
  event: ApplicationEvent;
  tenantId: string | null;
  userId: string | null;
  data: any;
};
async function create({
  request,
  event,
  tenantId,
  userId,
  data,
  endpoints,
}: ICreateApplicationEvent & {
  endpoints?: string[];
}) {
  const description = EventUtils.getDescription(event, data) ?? "";
  const item = await createEvent({
    name: event,
    tenantId,
    userId,
    data: JSON.stringify(data),
    description,
  });

  await onEvent({ request, event, tenantId, userId, data, description }).catch((e) => {
    console.log("[Events] onEvent Error", e);
  });
  await executeWorkflows({ event, tenantId, userId, data }).catch((e) => {
    console.log("[Events] executeWorkflows Error", e);
  });

  if (endpoints && endpoints.length > 0) {
    await Promise.all(
      endpoints.map(async (endpoint) => {
        return await callEventEndpoint({ request, event: item, endpoint, body: JSON.stringify(data) }).catch((e) => {
          console.log("[Events] callEventEndpoint Error", e);
        });
      })
    );
  }

  return event;
}

async function callEventEndpoint({ request, event, endpoint, body }: { request: Request; event: Event; endpoint: string; body: string }) {
  const webhookAttempt = await createEventWebhookAttempt({ eventId: event.id, endpoint });
  try {
    await fetch(getBaseURL(request) + `/api/events/webhooks/attempts/${webhookAttempt.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (e: any) {
    // While seeding the database it should not call endpoints
    await updateEventWebhookAttempt(webhookAttempt.id, {
      startedAt: new Date(),
      finishedAt: new Date(),
      success: false,
      status: 500,
      message: "Could not call webhook endpoint: " + e.message,
    });
  }
}

function assertNever(x: never): never {
  throw new Error("Unexpected event: " + x);
}

async function onEvent(params: ICreateApplicationEvent & { description: string }) {
  console.log(`[Events] ${params.event}: ${params.description}`);
  const event = ApplicationEvents.find((f) => f.value === params.event);
  if (!event) {
    console.log("[Events] Event not found: " + params.event);
    return;
  }
  const tenantId = params.tenantId;
  try {
    switch (event.value) {
      case "user.profile.updated": {
        break;
      }
      case "user.profile.deleted": {
        break;
      }
      case "user.password.updated": {
        break;
      }
      case "user.preferences.updated": {
        break;
      }
      case "account.created": {
        await NotificationService.sendToRoles({
          channel: "admin-accounts",
          tenantId,
          notification: {
            message: params.description,
            action: {
              title: "View account",
              url: `/admin/accounts/${tenantId}`,
            },
          },
        });
        break;
      }
      case "account.updated": {
        break;
      }
      case "account.deleted": {
        break;
      }
      case "member.invitation.created": {
        await NotificationService.sendToRoles({
          channel: "admin-account-members",
          tenantId: null,
          notification: {
            message: params.description,
            action: { url: `/app/${tenantId}/settings/members` },
          },
        });
        break;
      }
      case "member.invitation.accepted": {
        break;
      }
      case "member.deleted": {
        break;
      }
      case "role.assigned": {
        await NotificationService.sendToRoles({
          channel: "roles",
          tenantId,
          notification: {
            message: params.description,
          },
        });
        break;
      }
      case "role.unassigned": {
        break;
      }
      case "subscription.subscribed": {
        await NotificationService.sendToRoles({
          channel: "admin-subscriptions",
          tenantId,
          notification: {
            message: params.description,
          },
        });
        break;
      }
      case "subscription.upgraded": {
        break;
      }
      case "subscription.downgraded": {
        break;
      }
      case "subscription.cancelled": {
        await NotificationService.sendToRoles({
          channel: "admin-subscriptions",
          tenantId,
          notification: {
            message: params.description,
            action: { url: `/admin/accounts/${tenantId}` },
          },
        });
        break;
      }
      case "subscription.ended": {
        await NotificationService.sendToRoles({
          channel: "admin-subscriptions",
          tenantId,
          notification: {
            message: params.description,
            action: { url: `/admin/accounts/${tenantId}` },
          },
        });
        break;
      }
      case "api_key.created": {
        break;
      }
      case "api_key.updated": {
        break;
      }
      case "api_key.deleted": {
        break;
      }
      case "email.received": {
        break;
      }
      case "row.created": {
        await NotificationService.sendToRoles({
          channel: "admin-rows",
          tenantId: null,
          notification: {
            message: params.description,
            action: { url: `/app/${tenantId}/${params.data.entity.slug}/${params.data.id}` },
          },
        });
        break;
      }
      case "row.updated": {
        await NotificationService.sendToRoles({
          channel: "admin-rows",
          tenantId: null,
          notification: {
            message: params.description,
            action: { url: `/app/${tenantId}/${params.data.entity.slug}/${params.data.id}` },
          },
        });
        break;
      }
      case "row.deleted": {
        await NotificationService.sendToRoles({
          channel: "admin-rows",
          tenantId: null,
          notification: {
            message: params.description,
            action: { url: `/app/${tenantId}/${params.data.entity.slug}` },
          },
        });
        break;
      }
      case "row.shared": {
        break;
      }
      case "row.tasks.created": {
        break;
      }
      case "row.tasks.updated": {
        break;
      }
      case "row.tasks.deleted": {
        break;
      }
      case "row.comments.created": {
        break;
      }
      case "row.comments.deleted": {
        break;
      }
      case "row.comments.reacted": {
        break;
      }
      case "onboarding.started": {
        await NotificationService.sendToRoles({
          channel: "admin-onboarding",
          tenantId,
          notification: {
            message: params.description,
            action: { url: "/admin/onboarding/sessions" },
          },
        });
        break;
      }
      case "onboarding.dismissed": {
        await NotificationService.sendToRoles({
          channel: "admin-onboarding",
          tenantId,
          notification: {
            message: params.description,
            action: { url: "/admin/onboarding/sessions" },
          },
        });
        break;
      }
      case "onboarding.completed": {
        await NotificationService.sendToRoles({
          channel: "admin-onboarding",
          tenantId,
          notification: {
            message: params.description,
            action: { url: "/admin/onboarding/sessions" },
          },
        });
        break;
      }
      default:
        return assertNever(event);
    }
  } catch (e: any) {
    // ignore
  }
}

async function executeWorkflows({ event, tenantId, userId, data }: { event: ApplicationEvent; tenantId: string | null; userId: string | null; data: any }) {
  const liveWorkflows = await WorkflowsService.getAllAppliesToAllTenants({ tenantId });
  const workflowsToExecute: WorkflowDto[] = [];

  liveWorkflows.forEach((liveWorkflow) => {
    const appEventBlock = liveWorkflow.blocks.find((f) => f.type === "event");
    if (!appEventBlock) {
      return;
    }
    if (appEventBlock.input.event !== event) {
      return;
    }

    // if (tenantId === null) {
    //   if (liveWorkflow.tenantId !== null) {
    //     // not for admin
    //     return;
    //   }
    // } else {
    //   if (liveWorkflow.tenantId !== tenantId && !liveWorkflow.appliesToAllTenants) {
    //     // not for this tenant
    //     return;
    //   }
    // }

    if (["row.created", "row.updated", "row.deleted"].includes(event)) {
      if (appEventBlock.input.entity !== data.entity.name) {
        return;
      }
    }
    workflowsToExecute.push(liveWorkflow);
  });

  // eslint-disable-next-line no-console
  console.log("[Events.Workflows]", {
    liveWorkflows: liveWorkflows.map((f) => f.name),
    workflowsToExecute: workflowsToExecute.map((f) => f.name),
  });

  const executed = await Promise.all(
    workflowsToExecute.map((workflowToExecute) => {
      let appliesToAllTenants = true;
      if (workflowToExecute.tenantId === tenantId) {
        // no need to bypass workflow security
        appliesToAllTenants = false;
      }
      return WorkflowsExecutionsService.execute(workflowToExecute.id, {
        type: "manual",
        session: { tenantId, userId },
        input: {
          data,
        },
        appliesToAllTenants,
      });
    })
  );

  // eslint-disable-next-line no-console
  console.log("[Events.Workflows] executed", {
    executed: executed.length,
  });
}

export default {
  create,
};
