import { json } from "@remix-run/node";
import { createEmail, EmailWithSimpleDetails, getAllEmails, getEmailByMessageId } from "~/utils/db/email/emails.db.server";
import { Params } from "react-router";
import { getTranslations } from "~/locale/i18next.server";
import { getPostmarkInboundMessages, getPostmarkInboundMessage } from "~/utils/email.server";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

export type ActionDataEmails = {
  error?: string;
  items?: EmailWithSimpleDetails[];
};
const badRequest = (data: ActionDataEmails) => json(data, { status: 400 });
export const actionInboundEmails = async (request: Request, params: Params, tenantId: string | null) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();

  const action = form.get("action");
  if (action === "sync") {
    const allEmails = await getPostmarkInboundMessages();
    await Promise.all(
      allEmails.map(async (newEmail) => {
        const messageId = newEmail.MessageID.toString();
        const existing = await getEmailByMessageId(messageId);
        if (existing) {
          return;
        }
        const email = await getPostmarkInboundMessage(messageId);
        if (!email) {
          return;
        }

        await createEmail({
          tenantInboundAddressId: null,
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
          // attachments:
          //   attachmentsWithContent.length > 0
          //     ? {
          //         create: attachmentsWithContent.map((attachment: any) => ({
          //           name: attachment.Name,
          //           content: attachment.Content,
          //           type: attachment.ContentType,
          //           length: attachment.ContentLength,
          //         })),
          //       }
          //     : undefined,
        });
      })
    );

    const urlSearchParams = new URL(request.url).searchParams;
    const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
    const items = await getAllEmails("inbound", currentPagination, undefined, tenantId);
    return json({
      items,
    });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};
