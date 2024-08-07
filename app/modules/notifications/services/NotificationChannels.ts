import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";

const NotificationChannelTypes = [
  "admin-accounts",
  "admin-users",
  "admin-subscriptions",
  "admin-api-keys",
  "admin-emails",
  "admin-groups",
  "admin-linked-accounts",
  "admin-account-members",
  "admin-onboarding",
  "admin-rows",
  "roles",
  "my-rows",
] as const;
export type NotificationChannel = typeof NotificationChannelTypes[number];

export interface NotificationChannelDto {
  name: NotificationChannel;
  description: string;
  roles?: string[];
}

export const NotificationChannels: NotificationChannelDto[] = [
  {
    name: "admin-accounts",
    description: "accounts.created",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-users",
    description: "users.profile.updated",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-subscriptions",
    description: "subscriptions.created, subscriptions.cancelled",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-api-keys",
    description: "🚀 apiKeys.created, apiKeys.updated, apiKeys.deleted",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-emails",
    description: "🚀 emails.received",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-groups",
    description: "🚀 groups.created, groups.updated, groups.deleted",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-linked-accounts",
    description: "🚀 inkedAccounts.created, linkedAccounts.accepted, linkedAccounts.rejected, linkedAccounts.deleted",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-account-members",
    description: "🚀 accountMembers.created, accountMembers.accepted, accountMembers.updated, accountMembers.deleted",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-onboarding",
    description: "🚀 onboarding.started, onboarding.dismissed, onboarding.completed",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "admin-rows",
    description: "🚀 row.created, row.updated, row.deleted, row.workflow.transition",
    roles: [DefaultAdminRoles.SuperAdmin],
  },
  {
    name: "roles",
    description: "roles.assigned",
    roles: [DefaultAppRoles.SuperUser],
  },
  {
    name: "my-rows",
    description: "Send activity notifications to row creators: comment, edit",
  },
];
