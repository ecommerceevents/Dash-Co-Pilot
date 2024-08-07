import { AccountCreatedDto } from "../dtos/AccountCreatedDto";
import { AccountDeletedDto } from "../dtos/AccountDeletedDto";
import { AccountUpdatedDto } from "../dtos/AccountUpdatedDto";
import { ApiKeyCreatedDto } from "../dtos/ApiKeyCreatedDto";
import { ApiKeyDeletedDto } from "../dtos/ApiKeyDeletedDto";
import { ApiKeyUpdatedDto } from "../dtos/ApiKeyUpdatedDto";
import { EmailReceivedDto } from "../dtos/EmailReceivedDto";
import { MemberDeletedDto } from "../dtos/MemberDeletedDto";
import { MemberInvitationAcceptedDto } from "../dtos/MemberInvitationAcceptedDto";
import { MemberInvitationCreatedDto } from "../dtos/MemberInvitationCreatedDto";
import { RoleAssignedDto } from "../dtos/RoleAssignedDto";
import { RoleUnassignedDto } from "../dtos/RoleUnassignedDto";
import { RowCreatedDto } from "../dtos/RowCreatedDto";
import { RowDeletedDto } from "../dtos/RowDeletedDto";
import { RowSharedDto } from "../dtos/RowSharedDto";
import { RowUpdatedDto } from "../dtos/RowUpdatedDto";
import { SubscriptionCancelledDto } from "../dtos/SubscriptionCancelledDto";
import { SubscriptionEndedDto } from "../dtos/SubscriptionEndedDto";
import { SubscriptionSubscribedDto } from "../dtos/SubscriptionSubscribedDto";
import { SubscriptionUpgradedDto } from "../dtos/SubscriptionUpgradedDto";
import { UserPasswordUpdatedDto } from "../dtos/UserPasswordUpdatedDto";
import { UserPreferencesUpdatedDto } from "../dtos/UserPreferencesUpdatedDto";
import { UserProfileDeletedDto } from "../dtos/UserProfileDeletedDto";
import { UserProfileUpdatedDto } from "../dtos/UserProfileUpdatedDto";
import { ApplicationEvent, ApplicationEvents } from "../types/ApplicationEvent";
import { Event } from "@prisma/client";
import { RowTasksCreatedDto } from "../dtos/RowTasksCreatedDto";
import { RowTasksUpdatedDto } from "../dtos/RowTasksUpdatedDto";
import { RowTasksDeletedDto } from "../dtos/RowTasksDeletedDto";
import { RowCommentsCreatedDto } from "../dtos/RowCommentsCreatedDto";
import { RowCommentsDeletedDto } from "../dtos/RowCommentsDeletedDto";
import { RowCommentsReactedDto } from "../dtos/RowCommentsReactedDto";
import { OnboardingStartedDto } from "../dtos/OnboardingStartedDto";
import { OnboardingDismissedDto } from "../dtos/OnboardingDismissedDto";
import { OnboardingCompletedDto } from "../dtos/OnboardingCompletedDto";
import { SubscriptionDowngradedDto } from "../dtos/SubscriptionDowngradedDto";

function parseDescription(event: Event) {
  if (event.description) {
    return event.description;
  }
  try {
    const data = JSON.parse(event.data);
    return getDescription(event.name as ApplicationEvent, data);
  } catch (e) {
    return "Unknown event: " + event.name;
  }
}

function getDescription(event: ApplicationEvent, data: any) {
  const eventDescription = ApplicationEvents.find((f) => f.value === event)?.name;
  if (!eventDescription) {
    return "Unknown event";
  }
  try {
    switch (event) {
      case "user.profile.updated": {
        const payload = data as UserProfileUpdatedDto;
        return `${payload.email} updated their profile`;
      }
      case "user.profile.deleted": {
        const payload = data as UserProfileDeletedDto;
        return `${payload.email} deleted their profile`;
      }
      case "user.password.updated": {
        const payload = data as UserPasswordUpdatedDto;
        if (payload.fromUser) {
          return `${payload.fromUser.email} updated ${payload.user.email}'s password`;
        }
        return `${payload.user.email} updated their password`;
      }
      case "user.preferences.updated": {
        const payload = data as UserPreferencesUpdatedDto;
        return `${payload.user.email} updated their language: ${payload.old.locale} -> ${payload.new.locale}`;
      }
      case "account.created": {
        const payload = data as AccountCreatedDto;
        return `Account created: ${payload.tenant.name}`;
      }
      case "account.updated": {
        const payload = data as AccountUpdatedDto;
        return `${payload.user.email} updated account: ${payload.old.name} (/${payload.old.slug}) -> ${payload.new.name} (/${payload.new.slug})`;
      }
      case "account.deleted": {
        const payload = data as AccountDeletedDto;
        let subscription = "";
        if (payload.subscription) {
          subscription = `, ${payload.subscription.product.title} - $${payload.subscription.price.amount}`;
        }
        return `${payload.user.email} deleted the account '${payload.tenant.name}'${subscription}.`;
      }
      case "member.invitation.created": {
        const payload = data as MemberInvitationCreatedDto;
        return `${payload.fromUser.email} invited ${payload.user.email} to ${payload.tenant.name}`;
      }
      case "member.invitation.accepted": {
        const payload = data as MemberInvitationAcceptedDto;
        let prefix = payload.newUser ? "(New user) " : "";
        if (payload.fromUser) {
          return `${prefix}${payload.user.email} accepted the invitation to ${payload.tenant.name} from user ${payload.fromUser.email}`;
        }
        return `${prefix}${payload.user.email} accepted the invitation to ${payload.tenant.name}`;
      }
      case "member.deleted": {
        const payload = data as MemberDeletedDto;
        return `${payload.fromUser.email} deleted ${payload.user.email} from ${payload.tenant.name}`;
      }
      case "role.assigned": {
        const payload = data as RoleAssignedDto;
        return `${payload.fromUser.email} assigned the role "${payload.role.name}" to ${payload.toUser.email}`;
      }
      case "role.unassigned": {
        const payload = data as RoleUnassignedDto;
        return `${payload.fromUser.email} unassigned the role "${payload.role.name}" from ${payload.toUser.email}`;
      }
      case "subscription.subscribed": {
        const payload = data as SubscriptionSubscribedDto;
        if (payload.user) {
          return `${payload.user.email} subscribed ${payload.tenant.name} to ${payload.subscription.product.title}`;
        }
        return `${payload.tenant.name} subscribed to ${payload.subscription.product.title}`;
      }
      case "subscription.upgraded": {
        const payload = data as SubscriptionUpgradedDto;
        if (payload.user) {
          return `Subscription upgraded: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""}), by ${payload.user.email}`;
        }
        return `Subscription upgraded: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""})`;
      }
      case "subscription.downgraded": {
        const payload = data as SubscriptionDowngradedDto;
        if (payload.user) {
          return `Subscription downgraded: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""}), by ${payload.user.email}`;
        }
        return `Subscription downgraded: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""})`;
      }
      case "subscription.cancelled": {
        const payload = data as SubscriptionCancelledDto;
        if (payload.user) {
          return `Subscription cancelled: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""}), by ${payload.user.email}`;
        }
        return `Subscription cancelled: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""})`;
      }
      case "subscription.ended": {
        const payload = data as SubscriptionEndedDto;
        return `Subscription ended: ${payload.tenant.name} (${payload.subscription?.product.title ?? ""})`;
      }
      case "api_key.created": {
        const payload = data as ApiKeyCreatedDto;
        return `${payload.user.email} created API key: ${payload.alias}`;
      }
      case "api_key.updated": {
        const payload = data as ApiKeyUpdatedDto;
        return `${payload.user.email} updated API key: ${payload.old.alias} -> ${payload.new.alias}`;
      }
      case "api_key.deleted": {
        const payload = data as ApiKeyDeletedDto;
        return `${payload.user.email} deleted API key: ${payload.alias}`;
      }
      case "email.received": {
        const payload = data as EmailReceivedDto;
        return `New email from ${payload.fromEmail}: ${payload.subject}`;
      }
      case "row.created": {
        const payload = data as RowCreatedDto;
        return `New ${payload.entity.name}: ${payload.title}, by ${getUserOrApiKey(payload)}`;
      }
      case "row.updated": {
        const payload = data as RowUpdatedDto;
        return `Updated ${payload.entity.name}: ${payload.title}, by ${getUserOrApiKey(payload)}`;
      }
      case "row.deleted": {
        const payload = data as RowDeletedDto;
        return `Deleted ${payload.entity.name}: ${payload.title}, by ${getUserOrApiKey(payload)}`;
      }
      case "row.shared": {
        const payload = data as RowSharedDto;
        return `${payload.entity.name}: ${payload.title} shared with ${payload.type} "${payload.to}" (${payload.access}) by ${getUserOrApiKey(payload)}`;
      }
      case "row.tasks.created": {
        const payload = data as RowTasksCreatedDto;
        return `Row ${payload.rowId} task created '${payload.task.name}' by ${
          payload.user ? `${payload.user.email}` : payload.apiKey ? `API Key ${payload.apiKey.alias}` : ""
        }`;
      }
      case "row.tasks.updated": {
        const payload = data as RowTasksUpdatedDto;
        let change = "";
        if (payload.new.completedAt) {
          change = `completed at ${payload.new.completedAt}`;
        } else {
          change = `set as incomplete`;
        }
        return `Row ${payload.rowId} task updated '${payload.new.name}', ${change}, by ${
          payload.user ? `${payload.user.email}` : payload.apiKey ? `API Key ${payload.apiKey.alias}` : ""
        }`;
      }
      case "row.tasks.deleted": {
        const payload = data as RowTasksDeletedDto;
        return `Row ${payload.rowId} task deleted '${payload.task.name}' by ${
          payload.user ? `${payload.user.email}` : payload.apiKey ? `API Key ${payload.apiKey.alias}` : ""
        }`;
      }
      case "row.comments.created": {
        const payload = data as RowCommentsCreatedDto;
        return `Row ${payload.rowId} commented '${payload.comment.text}' by ${payload.user ? `${payload.user.email}` : ""}`;
      }
      case "row.comments.deleted": {
        const payload = data as RowCommentsDeletedDto;
        return `Row ${payload.rowId} comment deleted '${payload.comment.text}' by ${payload.user ? `${payload.user.email}` : ""}`;
      }
      case "row.comments.reacted": {
        const payload = data as RowCommentsReactedDto;
        return `Row ${payload.rowId} comment reaction (${payload.reaction}) '${payload.comment.text}' by ${payload.user ? `${payload.user.email}` : ""}`;
      }
      case "onboarding.started": {
        const payload = data as OnboardingStartedDto;
        return `Onboarding started by ${payload.user.email}: ${payload.onboarding.title}`;
      }
      case "onboarding.dismissed": {
        const payload = data as OnboardingDismissedDto;
        return `Onboarding dismissed by ${payload.user.email}: ${payload.onboarding.title}`;
      }
      case "onboarding.completed": {
        const payload = data as OnboardingCompletedDto;
        return `Onboarding completed by ${payload.user.email}: ${payload.onboarding.title}`;
      }
      default:
        return assertNever(event);
    }
  } catch (e) {
    return eventDescription;
  }
}

function assertNever(x: never): never {
  throw new Error("Unexpected event: " + x);
}

function getUserOrApiKey(item: { user?: { id: string; email: string }; apiKey?: { id: string; alias: string } }) {
  if (item.user) {
    return item.user.email + " ";
  } else if (item.apiKey) {
    return "API Key " + item.apiKey.alias + " ";
  }
  return "";
}

export default {
  parseDescription,
  getDescription,
};
