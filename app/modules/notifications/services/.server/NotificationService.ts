import { Novu } from "@novu/node";
// import { IPreferenceChannels } from "@novu/notification-center";
import { ChannelTypeEnum } from "@novu/shared";
import { getRolesByName } from "~/utils/db/permissions/roles.db.server";
import { getUsersRolesInTenant } from "~/utils/db/permissions/userRoles.db.server";
import { getAdminUsersInRoles } from "~/utils/db/users.db.server";
import { NotificationIntegrationDto } from "../../dtos/NotificationIntegrationDto";
import { NotificationMessageDto } from "../../dtos/NotificationMessageDto";
import { NotificationSubscriberDto } from "../../dtos/NotificationSubscriberDto";
import { NotificationTemplateDto } from "../../dtos/NotificationTemplateDto";
import { NotificationChannel, NotificationChannels } from "../NotificationChannels";

function getClient() {
  try {
    if (!process.env.NOTIFICATIONS_NOVU_API_KEY) {
      return null;
    }
    return new Novu(process.env.NOTIFICATIONS_NOVU_API_KEY?.toString() ?? "");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Error creating novu client", e);
    return null;
  }
}

export interface IGetSubscribersData {
  page: number;
  totalCount: number;
  pageSize: number;
  data: NotificationSubscriberDto[];
}
async function getSubscribers({ page }: { page?: number }): Promise<IGetSubscribersData | null> {
  const novu = getClient();
  if (!novu) {
    return null;
  }
  const response = await novu.subscribers.list((page ?? 1) - 1);
  return response.data as IGetSubscribersData;
}

export interface IGetMessagesData {
  page: number;
  totalCount: number;
  pageSize: number;
  data: NotificationMessageDto[];
}
async function getMessages({ channel, subscriberId, limit, page }: { channel?: string; subscriberId?: string; limit?: number; page?: number }) {
  const novu = getClient();
  if (!novu) {
    return null;
  }
  let query = new URLSearchParams();
  if (channel) {
    query.append("channel", channel);
  }
  if (subscriberId) {
    query.append("subscriberId", subscriberId);
  }
  if (limit) {
    query.append("limit", limit.toString());
  }
  if (page === undefined) {
    page = 1;
  }
  if (page) {
    query.append("page", (page - 1).toString());
  }
  const url = "https://api.novu.co/v1/messages?" + query;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${process.env.NOTIFICATIONS_NOVU_API_KEY}`,
    },
  });
  const data = await response.json();
  return data as IGetMessagesData;
}

export interface IGetTemplatesData {
  page: number;
  totalCount: number;
  pageSize: number;
  data: NotificationTemplateDto[];
}
async function getNotificationTemplates({ limit, page }: { limit?: number; page?: number }) {
  const novu = getClient();
  if (!novu) {
    return null;
  }
  const response = await novu.notificationTemplates.getAll(page, limit);
  return response.data as IGetTemplatesData;
}

// interface ICreateNotificationTemplateArgs {
//   name: string;
//   notificationGroupId: string;
//   tags?: string[];
//   description?: string;
//   steps?: {
//     template: {
//       type: "in_app" | "email" | "sms" | "chat" | "push" | "digest" | "trigger" | "delay";
//       variables: {
//         type: "String";
//         name: string;
//         defaultValue: string;
//         required: boolean;
//       }[];
//       content: string;
//     };
//   }[];
//   active?: boolean;
//   draft?: boolean;
//   critical?: boolean;
//   preferenceSettings?: IPreferenceChannels;
// }
// async function createNotificationTemplate(data: ICreateNotificationTemplateArgs) {
//   const novu = getClient();
//   if (!novu) {
//     return;
//   }
//   const response = await novu.notificationTemplates.create(data);
//   return response.data as NotificationTemplateDto;
// }

export interface IGetIntegrationsData {
  data: NotificationIntegrationDto[];
}
async function getIntegrations() {
  const novu = getClient();
  if (!novu) {
    return null;
  }
  const response = await fetch("https://api.novu.co/v1/integrations", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${process.env.NOTIFICATIONS_NOVU_API_KEY}`,
    },
  });
  const data = await response.json();
  return data as IGetIntegrationsData;
}

interface IAttachmentOptions {
  mime: string;
  file: Buffer;
  name?: string;
  channels?: ChannelTypeEnum[];
}
interface INotificationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  githubId: string | null;
  googleId: string | null;
}

interface INotification {
  from?: { user?: INotificationUser | null };
  message: string;
  action?: {
    title?: string;
    url: string;
  };
  data?: { [key: string]: string | string[] | boolean | number | undefined | IAttachmentOptions | IAttachmentOptions[] | Record<string, unknown> };
  attachments?: IAttachmentOptions[];
}
async function send({ channel, to, notification }: { channel: string; to: INotificationUser; notification: INotification }) {
  const novu = getClient();
  if (!novu) {
    return;
  }

  if (notification.from?.user?.id === to.id) {
    const isLocalDevelopmentMode = process.env.NODE_ENV === "development";
    if (!isLocalDevelopmentMode) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log("[LOCAL DEV] Skipping sending notification to self.");
    notification.message = `[dev] ${notification.message}`;
  }

  if (notification.from?.user?.email === to.email) {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    // eslint-disable-next-line no-console
    console.log("[LOCAL DEV] Skipping sending notification to self.");
  }
  if (notification.action && !notification.action?.title) {
    notification.action.title = "View";
  }
  // console.log("Sending notification", { eventId, to, notification });
  try {
    return await novu.trigger(channel, {
      to: {
        subscriberId: to.id,
        email: to.email,
        firstName: to.firstName,
        lastName: to.lastName,
        phone: to.phone ?? "",
        data: {
          githubId: to.githubId ?? undefined,
          googleId: to.googleId ?? undefined,
        },
      },
      payload: {
        ...notification.data,
        from: notification.from,
        message: notification.message,
        action: notification.action,
        attachments: notification.attachments,
      },
    });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[NotificationService.send()] Error: " + e.message);
  }
}

async function sendToRoles({ channel, notification, tenantId }: { channel: NotificationChannel; tenantId?: string | null; notification: INotification }) {
  const novu = getClient();
  if (!novu) {
    return;
  }
  const notificationChannel = NotificationChannels.find((f) => f.name === channel);
  if (!notificationChannel?.roles) {
    return;
  }
  const allRoles = await getRolesByName(notificationChannel.roles);
  const adminRoles = allRoles.filter((f) => f.type === "admin");
  const appRoles = allRoles.filter((f) => f.type === "app");

  const sentToUsers: string[] = [];

  const adminUsersInRoles = await getAdminUsersInRoles(adminRoles.map((m) => m.id));
  await Promise.all(
    adminUsersInRoles.map(async (adminUser) => {
      if (sentToUsers.includes(adminUser.id)) {
        return;
      }
      sentToUsers.push(adminUser.id);
      await send({ channel: notificationChannel.name, to: adminUser, notification });
    })
  );

  if (tenantId) {
    const tenantUserRoles = await getUsersRolesInTenant(tenantId);
    await Promise.all(
      appRoles.map(async (role) => {
        const usersInRole = tenantUserRoles.filter((f) => f.roleId === role.id);
        return await Promise.all(
          usersInRole.map(async ({ user }) => {
            if (sentToUsers.includes(user.id)) {
              return;
            }
            sentToUsers.push(user.id);
            return await send({ channel: notificationChannel.name, to: user, notification });
          })
        );
      })
    );
  }
}

async function deleteNotificationTemplate(id: string) {
  const novu = getClient();
  if (!novu) {
    return;
  }
  await novu.notificationTemplates.updateStatus(id, false);
  // console.log({ disableResponse });
  return await novu.notificationTemplates.delete(id);
  // console.log({ deleteResponse });
}

export default {
  getSubscribers,
  getMessages,
  getIntegrations,
  getNotificationTemplates,
  // createNotificationTemplate,
  deleteNotificationTemplate,
  send,
  sendToRoles,
};
