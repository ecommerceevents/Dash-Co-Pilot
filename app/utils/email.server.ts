import postmark from "postmark";
import { EmailSender } from "@prisma/client";
import { EmailTemplate } from "~/application/dtos/email/EmailTemplate";
import { InboundEmailDetailsDto } from "~/application/dtos/email/InboundEmailDetailsDto";
import { InboundEmailDto } from "~/application/dtos/email/InboundEmailDto";
import { getBaseURL } from "./url.server";

interface Template {
  TemplateType: TemplateTypes;
  Name: string;
  TemplateId: number;
  Alias: string | null;
  Subject: string;
  HtmlBody: string | null;
  TextBody: string | null;
  Active: boolean;
  AssociatedServerId: number;
  LayoutTemplate: string | null;
}

type TemplateInList = {
  TemplateType: TemplateTypes;
  Active: boolean;
  TemplateId: number;
  Name: string;
  Alias: string | null;
  LayoutTemplate: string | null;
};
enum TemplateTypes {
  Standard = "Standard",
  Layout = "Layout",
}
enum LinkTrackingOptions {
  TextOnly = "TextOnly",
  HtmlOnly = "HtmlOnly",
  HtmlAndText = "HtmlAndText",
  None = "None",
}

function getClient(apiKey?: string) {
  try {
    return new postmark.ServerClient(apiKey ?? process.env.POSTMARK_SERVER_TOKEN?.toString() ?? "");
  } catch (e) {
    return null;
  }
}

function getBaseTemplateModel(request: Request) {
  const currentTenantUrl = getBaseURL(request)?.toString();
  return {
    product_url: currentTenantUrl,
    login_url: currentTenantUrl + "/login",
    product_name: process.env.APP_NAME,
    support_email: process.env.SUPPORT_EMAIL,
    sender_name: process.env.APP_NAME,
    company_name: process.env.COMPANY_NAME,
    company_address: process.env.COMPANY_ADDRESS,
  };
}

export async function sendEmail({
  request,
  to,
  alias,
  data,
  Attachments,
}: {
  request: Request;
  to: string;
  alias: string;
  data: any;
  Attachments?: { Name: string; Content: string; ContentType: string; ContentID: string }[];
}) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[SENDING EMAIL]", data);
  }
  var client = getClient();
  if (!client) {
    return;
  }
  await client.sendEmailWithTemplate({
    From: process.env.POSTMARK_FROM_EMAIL ?? "",
    To: to,
    TemplateAlias: alias,
    TemplateModel: {
      ...getBaseTemplateModel(request),
      ...data,
    },
    Attachments: Attachments || [],
  });
}

export async function getPostmarkTemplates(): Promise<EmailTemplate[]> {
  const client = getClient();
  if (!client) {
    return [];
  }
  const items: TemplateInList[] = (await client.getTemplates()).Templates;
  const templatesPromises = items.map(async (item: TemplateInList) => {
    const postmarkTemplate: Template = await client.getTemplate(item.Alias ?? "");
    const template: EmailTemplate = {
      type: item.TemplateType === TemplateTypes.Standard ? "standard" : "layout",
      name: postmarkTemplate.Name,
      alias: postmarkTemplate.Alias ?? "",
      subject: postmarkTemplate.Subject ?? "",
      htmlBody: postmarkTemplate.HtmlBody ?? "",
      active: postmarkTemplate.Active,
      associatedServerId: postmarkTemplate.AssociatedServerId,
      templateId: postmarkTemplate.TemplateId,
    };
    return template;
  });
  const templates = await Promise.all(templatesPromises);
  return templates;
}

export async function createPostmarkTemplate(template: EmailTemplate, layoutTemplate?: string | undefined) {
  const client = getClient();
  if (!client) {
    // throw Error("Undefined Postmark client");
    return;
  }
  return client.createTemplate({
    LayoutTemplate: layoutTemplate,
    TemplateType: template.alias.startsWith("layout-") ? TemplateTypes.Layout : TemplateTypes.Standard,
    Alias: template.alias,
    Name: template.name,
    Subject: template.subject,
    HtmlBody: template.htmlBody,
  });
}

export async function deletePostmarkTemplate(alias: string) {
  const client = getClient();
  if (!client) {
    return;
    // throw Error("Undefined Postmark client");
  }
  return client.deleteTemplate(alias);
}

export async function getPostmarkServer() {
  const client = getClient();
  if (!client) {
    return;
  }
  return await client.getServer();
}

export async function getPostmarkInboundMessageStreams(): Promise<
  {
    ID: string;
    ServerID: number;
    Name: string;
    Description: string;
    MessageStreamType: string;
    CreatedAt: string;
    UpdatedAt?: string;
    ArchivedAt?: string;
    ExpectedPurgeDate?: string;
    SubscriptionManagementConfiguration: any;
  }[]
> {
  const client = getClient();
  if (!client) {
    return [];
  }
  return (
    (
      await client.getMessageStreams({
        messageStreamType: "inbound",
      })
    ).MessageStreams ?? []
  );
}

export async function getPostmarkInboundMessages(): Promise<InboundEmailDto[]> {
  const client = getClient();
  if (!client) {
    return [];
  }
  return (await client.getInboundMessages()).InboundMessages ?? [];
}

export async function getPostmarkInboundMessage(messageId: string): Promise<InboundEmailDetailsDto | null> {
  const client = getClient();
  if (!client) {
    return null;
  }
  return await client.getInboundMessageDetails(messageId);
}

export async function sendBroadcast({
  sender,
  to,
  subject,
  htmlBody,
  textBody,
  track,
  metadata,
}: {
  sender: EmailSender;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  track: boolean;
  metadata: { [key: string]: string };
}) {
  const client = getClient(sender.apiKey);
  if (!client) {
    throw Error("Invalid Postmark API key");
  }
  return await client.sendEmail({
    From: sender.fromEmail,
    MessageStream: sender.stream,
    To: to,
    Subject: subject,
    HtmlBody: htmlBody,
    TextBody: textBody,
    TrackOpens: track,
    TrackLinks: track ? LinkTrackingOptions.HtmlAndText : LinkTrackingOptions.None,
    Metadata: metadata,
  });
}
