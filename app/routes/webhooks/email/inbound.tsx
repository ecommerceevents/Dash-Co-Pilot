import { TenantInboundAddress } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { updateEmailAttachmentFileProvider } from "~/utils/db/email/emailAttachments.db.server";
import { createEmail, getEmail } from "~/utils/db/email/emails.db.server";
import { getTenantInboundAddress } from "~/utils/db/email/tenantInboundAddresses.db.server";
import { createSupabaseFile, getSupabaseAttachmentBucket, getSupabaseAttachmentPath } from "~/utils/integrations/supabaseService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { EmailReceivedDto } from "~/modules/events/dtos/EmailReceivedDto";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const email = await request.json();
      const messageId = email.MessageID.toString();
      const existingMessage = await db.email.findUnique({
        where: { messageId },
      });
      if (existingMessage) {
        return json({ error: "Message already exists" }, { status: 400 });
      }

      const fromInboundAddress = [email.ToFull[0].Email];
      if (email.Bcc) {
        fromInboundAddress.push(...email.Bcc.split(","));
      }
      const tenantWithInboundAddresses = await getTenantInboundAddress(fromInboundAddress.map((f) => f.split("@")[0]));
      let tenantWithInboundAddress: TenantInboundAddress | null = null;
      if (tenantWithInboundAddresses.length === 1) {
        tenantWithInboundAddress = tenantWithInboundAddresses[0];
      } else if (tenantWithInboundAddresses.length > 1) {
        // eslint-disable-next-line no-console
        console.log("[INBOUND EMAIL ERROR] More than 1 address found with subdomains: " + fromInboundAddress.map((f) => f.split("@")[0]));
      }
      const createdEmail = await createEmail({
        tenantInboundAddressId: tenantWithInboundAddress?.id ?? null,
        messageId: email.MessageID,
        type: "inbound",
        date: new Date(email.Date),
        subject: email.Subject,
        fromEmail: email.From,
        fromName: email.FromName,
        toEmail: email.ToFull[0].Email,
        toName: email.ToFull[0].Name,
        textBody: email.TextBody,
        htmlBody: email.HtmlBody,
        cc: { create: email.CcFull.map((cc: any) => ({ toEmail: cc.Email, toName: cc.Name })) },
        attachments: {
          create: email.Attachments.map((attachment: any) => ({
            name: attachment.Name,
            content: `data:${attachment.ContentType};base64,${attachment.Content}`,
            type: attachment.ContentType,
            length: attachment.ContentLength,
          })),
        },
      });
      await EventsService.create({
        request,
        event: "email.received",
        tenantId: tenantWithInboundAddress?.tenantId ?? null,
        userId: null,
        data: {
          fromEmail: createdEmail.fromEmail,
          fromName: createdEmail.fromName ?? undefined,
          toEmail: createdEmail.toEmail,
          toName: createdEmail.toName ?? undefined,
          subject: createdEmail.subject,
        } satisfies EmailReceivedDto,
      });
      const emailWithAttachments = await getEmail(createdEmail.id, tenantWithInboundAddress?.tenantId ?? null);
      if (emailWithAttachments && emailWithAttachments.attachments.length > 0) {
        if (process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY) {
          await Promise.all(
            emailWithAttachments?.attachments.map(async (attachment) => {
              const blob = await (await fetch(attachment.content)).blob();
              const file = new File([blob], attachment.name);

              try {
                const storageBucket = getSupabaseAttachmentBucket();
                const createdFile = await createSupabaseFile(storageBucket, getSupabaseAttachmentPath(attachment), file);
                if (createdFile.publicUrl) {
                  return await updateEmailAttachmentFileProvider(attachment.id, {
                    content: "",
                    publicUrl: createdFile.publicUrl,
                    storageBucket,
                    storageProvider: "supabase",
                  });
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log("Could not create supabase file: " + e);
              }
            })
          );
        }
      }

      return json({}, { status: 201 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};
