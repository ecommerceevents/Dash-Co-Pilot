import { Campaign, EmailSender } from "@prisma/client";
import { EntityViewsApi } from "~/utils/api/.server/EntityViewsApi";
import { sendBroadcast } from "~/utils/email.server";
import CrmService, { ContactDto } from "~/modules/crm/services/CrmService";
import { createCampaign, CampaignWithDetails, updateCampaign } from "../db/campaigns.db.server";
import { getAllOutboundEmails, createOutboundEmailTest, updateOutboundEmail, createOutboundEmail } from "../db/outboundEmails.db.server";

export type EmailMarketingSummaryDto = {
  avgOpenRate: number;
  avgClickRate: number;
  outboundEmails: {
    sent: number;
    delivered: number;
  };
};
async function getSummary(tenantId: string | null): Promise<EmailMarketingSummaryDto> {
  const allOutboundEmails = await getAllOutboundEmails(tenantId, {
    pagination: { page: 1, pageSize: 1000000 },
  });
  const outboundEmailsWithClicks = allOutboundEmails.items.filter((o) => o.clicks.length > 0).length;
  const outboundEmailsWithOpens = allOutboundEmails.items.filter((o) => o.opens.length > 0).length;
  const avgOpenRate = allOutboundEmails.items.length > 0 ? (outboundEmailsWithOpens / allOutboundEmails.items.length) * 100 : 0;
  const avgClickRate = allOutboundEmails.items.length > 0 ? (outboundEmailsWithClicks / allOutboundEmails.items.length) * 100 : 0;
  return {
    avgOpenRate,
    avgClickRate,
    outboundEmails: {
      sent: allOutboundEmails.items.filter((f) => f.sentAt).length,
      delivered: allOutboundEmails.items.filter((f) => f.deliveredAt).length,
    },
  };
}

async function sendPreview({
  from,
  email,
}: {
  from: { tenantId: string | null; sender: EmailSender };
  email: { to: string; subject: string; htmlBody: string; textBody: string; track: true };
}): Promise<boolean> {
  const outbountEmail = await createOutboundEmailTest({
    tenantId: from.tenantId,
    email: email.to,
    fromSenderId: from.sender.id,
  });
  try {
    email.htmlBody = replaceVariables(email.htmlBody, undefined);
    email.textBody = replaceVariables(email.textBody, undefined);
    email.subject = replaceVariables(email.subject, undefined);
    await sendBroadcast({
      sender: from.sender,
      to: email.to,
      subject: email.subject,
      htmlBody: email.htmlBody,
      textBody: email.textBody,
      track: email.track,
      metadata: { outboundEmailId: outbountEmail.id },
    });
    await updateOutboundEmail(outbountEmail.id, {
      sentAt: new Date(),
    });
    return true;
  } catch (e: any) {
    await updateOutboundEmail(outbountEmail.id, {
      error: e.message,
    });

    throw e;
  }
}

async function sendContactPreview({
  contactRowId,
  from,
  email,
}: {
  contactRowId: string;
  from: { tenantId: string | null; sender: EmailSender };
  email: { to: string; subject: string; htmlBody: string; textBody: string; track: boolean };
}): Promise<boolean> {
  const contact = await CrmService.getContact(contactRowId);
  if (!contact) {
    throw Error("Contact not found: " + contactRowId);
  }
  const outbountEmail = await createOutboundEmail({
    tenantId: from.tenantId,
    contactRowId,
    email: email.to,
    fromSenderId: from.sender.id,
  });
  try {
    if (!contact.marketingSubscriber) {
      throw new Error(`Contact ${contact.email} is not a marketing subscriber`);
    }
    email.htmlBody = replaceVariables(email.htmlBody, contact);
    email.textBody = replaceVariables(email.textBody, contact);
    email.subject = replaceVariables(email.subject, contact);
    await sendBroadcast({
      sender: from.sender,
      to: email.to,
      subject: email.subject,
      htmlBody: email.htmlBody,
      textBody: email.textBody,
      track: email.track,
      metadata: { outboundEmailId: outbountEmail.id },
    });
    await updateOutboundEmail(outbountEmail.id, {
      sentAt: new Date(),
    });
    return true;
  } catch (e: any) {
    await updateOutboundEmail(outbountEmail.id, {
      error: e.message,
    });

    throw e;
  }
}

function replaceVariables(value: string, contact?: ContactDto): string {
  value = value.replace(/{{firstName}}/g, contact?.firstName ?? "");
  value = value.replace(/{{lastName}}/g, contact?.lastName ?? "");
  value = value.replace(/{{email}}/g, contact?.email ?? "");
  value = value.replace(/{{job_title}}/g, contact?.jobTitle ?? "");
  value = value.replace(/{{company_name}}/g, contact?.company?.name ?? "");
  return value;
}

async function createCampaignDraft({
  name,
  contactViewId,
  from,
  email,
}: {
  name: string;
  contactViewId: string | undefined;
  from: { tenantId: string | null; sender: EmailSender };
  email: {
    subject: string;
    htmlBody: string;
    textBody: string | undefined;
    track: boolean;
  };
}): Promise<Campaign> {
  const contacts = await getContactMarketingSubscribersFromView({ contactViewId, tenantId: from.tenantId });
  if (contacts.length === 0) {
    throw new Error("No contacts found that are marketing subscribers");
  }
  const campaign = await createCampaign(
    {
      emailSenderId: from.sender.id,
      tenantId: from.tenantId,
      name,
      subject: email.subject,
      htmlBody: email.htmlBody,
      textBody: email.textBody,
      track: email.track,
    },
    contacts.map((contact) => {
      return { contactRowId: contact.id, email: contact.email, fromSenderId: from.sender.id };
    })
  );

  if (!campaign) {
    throw new Error("Failed to create campaign");
  }
  return campaign;
}

async function getContactMarketingSubscribersFromView({
  contactViewId,
  tenantId,
}: {
  contactViewId: string | undefined;
  tenantId: string | null;
}): Promise<ContactDto[]> {
  const contactView = await EntityViewsApi.get(contactViewId, {
    tenantId,
    entityName: "contact",
    pageSize: -1,
  });
  if (!contactView) {
    if (contactViewId) {
      throw new Error("Contact view not found: " + contactViewId);
    } else {
      throw Error("Contact default view not found");
    }
  }
  if (contactView.rowsData.items.length === 0) {
    throw Error("No contacts found");
  }
  const contacts = await CrmService.getContactsInRowIds(contactView.rowsData.items.map((i) => i.id));
  if (contacts.length === 0) {
    if (contactView.rowsData.currentView) {
      throw Error("No contacts found in view: " + contactView.rowsData.currentView.name);
    } else {
      throw Error("No contacts found in default view");
    }
  }
  const notMarketingSubscribers = contacts.filter((c) => !c.marketingSubscriber);
  if (notMarketingSubscribers.length > 0) {
    throw Error(
      `${notMarketingSubscribers.length}/${contacts.length} contacts are not marketing subscribers: ${notMarketingSubscribers.map((c) => c.email).join(", ")}`
    );
  }
  return contacts;
}

async function sendCampaignTest(campaign: CampaignWithDetails, email: string): Promise<boolean> {
  if (campaign.recipients.length === 0) {
    throw new Error("No recipients found");
  }
  const notContacts = campaign.recipients.filter((r) => !r.contactRowId);
  if (notContacts.length > 0) {
    throw new Error("Campaign has non-contact recipients: " + notContacts.map((r) => r.email).join(", "));
  }
  let maxTests = 5;
  let recipients = campaign.recipients.slice(0, maxTests);
  await Promise.all(
    recipients.map(async (recipient, idx) => {
      await sendContactPreview({
        contactRowId: recipient.contactRowId ?? "",
        from: {
          tenantId: campaign.tenantId,
          sender: campaign.emailSender,
        },
        email: {
          to: email,
          subject: `Test email ${idx + 1}/${campaign.recipients.length} - ${campaign.subject}`,
          htmlBody: campaign.htmlBody,
          textBody: campaign.textBody ?? "",
          track: campaign.track,
        },
      });
    })
  );
  return true;
}

async function sendCampaign(campaign: CampaignWithDetails): Promise<boolean> {
  if (campaign.recipients.length === 0) {
    throw new Error("No recipients found");
  }

  const notContacts = campaign.recipients.filter((r) => !r.contactRowId);
  if (notContacts.length > 0) {
    throw new Error("Campaign has non-contact recipients: " + notContacts.map((r) => r.email).join(", "));
  }
  await updateCampaign(campaign.id, {
    status: "sending",
  });
  let totalSent = 0;
  await Promise.all(
    campaign.recipients.map(async (recipient) => {
      try {
        if (!recipient.contactRow) {
          throw new Error("Contact not found: " + recipient.email);
        }
        const contact = await CrmService.getContact(recipient.contactRow.id);
        if (!contact) {
          throw new Error("Could not parse contact not found: " + recipient.email);
        }
        await updateOutboundEmail(recipient.id, {
          sentAt: new Date(),
          error: undefined,
        });
        await sendBroadcast({
          sender: campaign.emailSender,
          to: recipient.email,
          subject: replaceVariables(campaign.subject, contact),
          htmlBody: replaceVariables(campaign.htmlBody, contact),
          textBody: replaceVariables(campaign.textBody ?? "", contact),
          track: campaign.track,
          metadata: { outboundEmailId: recipient.id },
        });
        totalSent++;
      } catch (e: any) {
        await updateOutboundEmail(recipient.id, {
          error: e.message,
        });
      }
    })
  );

  if (totalSent === campaign.recipients.length) {
    await updateCampaign(campaign.id, {
      status: "completed",
    });
  } else {
    await updateCampaign(campaign.id, {
      status: "incomplete",
    });
  }
  return true;
}

export default {
  getSummary,
  getContactMarketingSubscribersFromView,
  sendPreview,
  sendContactPreview,
  createCampaignDraft,
  sendCampaignTest,
  sendCampaign,
};
