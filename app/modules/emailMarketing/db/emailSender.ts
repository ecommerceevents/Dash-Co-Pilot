import { EmailSender } from "@prisma/client";
import { db } from "~/utils/db.server";

export type EmailSenderWithoutApiKey = Omit<EmailSender, "apiKey">;
export async function getAllEmailSenders(tenantId: string | null): Promise<EmailSenderWithoutApiKey[]> {
  return await db.emailSender.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      provider: true,
      stream: true,
      fromName: true,
      fromEmail: true,
      replyToEmail: true,
    },
    orderBy: [
      {
        fromName: "asc",
      },
    ],
  });
}

export async function getEmailSender(id: string, tenantId: string | null): Promise<EmailSender | null> {
  return await db.emailSender.findFirst({
    where: {
      id,
      tenantId,
    },
  });
}

export async function getEmailSenderWithoutApiKey(id: string, tenantId: string | null): Promise<EmailSenderWithoutApiKey | null> {
  return await db.emailSender.findFirst({
    where: {
      id,
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      provider: true,
      stream: true,
      fromName: true,
      fromEmail: true,
      replyToEmail: true,
    },
  });
}

export async function createEmailSender(data: {
  tenantId: string | null;
  provider: string;
  stream: string;
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  replyToEmail?: string;
}): Promise<EmailSender> {
  const item = await db.emailSender.create({
    data,
  });

  return item;
}

export async function updateEmailSender(
  id: string,
  data: {
    provider: string;
    stream: string;
    fromEmail: string;
    fromName?: string;
    replyToEmail?: string;
  }
): Promise<EmailSender> {
  const item = await db.emailSender.update({
    where: { id },
    data,
  });

  return item;
}

export async function deleteEmailSender(id: string): Promise<EmailSender> {
  await db.outboundEmail.deleteMany({
    where: { fromSenderId: id },
  });
  const item = await db.emailSender.delete({
    where: { id },
  });

  return item;
}
