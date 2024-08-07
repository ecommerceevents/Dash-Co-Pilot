export const ApplicationEvents = [
  { adminOnly: false, value: "row.created", name: "Row created" },
  { adminOnly: false, value: "row.updated", name: "Row updated" },
  { adminOnly: false, value: "row.deleted", name: "Row deleted" },
  { adminOnly: true, value: "user.profile.updated", name: "User profile updated" },
  { adminOnly: true, value: "user.profile.deleted", name: "User profile deleted" },
  { adminOnly: true, value: "user.password.updated", name: "User password updated" },
  { adminOnly: true, value: "user.preferences.updated", name: "User preferences updated" },
  { adminOnly: false, value: "account.created", name: "Account created" },
  { adminOnly: false, value: "account.updated", name: "Account updated" },
  { adminOnly: true, value: "account.deleted", name: "Account deleted" },
  { adminOnly: false, value: "member.invitation.created", name: "Member invitation created" },
  { adminOnly: false, value: "member.invitation.accepted", name: "Member invitation accepted" },
  { adminOnly: false, value: "member.deleted", name: "Member deleted" },
  { adminOnly: false, value: "role.assigned", name: "Role assigned" },
  { adminOnly: false, value: "role.unassigned", name: "Role unassigned" },
  { adminOnly: false, value: "subscription.subscribed", name: "Subscribed" },
  { adminOnly: false, value: "subscription.upgraded", name: "Subscription upgraded" },
  { adminOnly: false, value: "subscription.downgraded", name: "Subscription downgraded" },
  { adminOnly: false, value: "subscription.cancelled", name: "Subscription cancelled" },
  { adminOnly: false, value: "subscription.ended", name: "Subscription ended" },
  { adminOnly: false, value: "api_key.created", name: "API key created" },
  { adminOnly: false, value: "api_key.updated", name: "API key updated" },
  { adminOnly: false, value: "api_key.deleted", name: "API key deleted" },
  { adminOnly: false, value: "email.received", name: "Email received" },
  { adminOnly: false, value: "row.shared", name: "Row shared" },
  { adminOnly: false, value: "row.tasks.created", name: "Row task created" },
  { adminOnly: false, value: "row.tasks.updated", name: "Row task updated" },
  { adminOnly: false, value: "row.tasks.deleted", name: "Row task deleted" },
  { adminOnly: false, value: "row.comments.created", name: "Row comment created" },
  { adminOnly: false, value: "row.comments.deleted", name: "Row comment deleted" },
  { adminOnly: false, value: "row.comments.reacted", name: "Row comment reacted" },
  { adminOnly: true, value: "onboarding.started", name: "Onboarding started" },
  { adminOnly: true, value: "onboarding.dismissed", name: "Onboarding dismissed" },
  { adminOnly: true, value: "onboarding.completed", name: "Onboarding completed" },
] as const;

export type ApplicationEvent = (typeof ApplicationEvents)[number]["value"];
