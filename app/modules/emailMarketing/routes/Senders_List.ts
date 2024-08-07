import { LoaderFunctionArgs, ActionFunction, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { sendBroadcast } from "~/utils/email.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { EmailSenderWithoutApiKey, getAllEmailSenders, getEmailSender } from "../db/emailSender";
import { createOutboundEmailTest, findOutboundEmails, updateOutboundEmail } from "../db/outboundEmails.db.server";
export namespace Senders_List {
  export type LoaderData = {
    items: EmailSenderWithoutApiKey[];
    hasSetWebhooks: boolean;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const items = await getAllEmailSenders(tenantId);
    const deliveredEmails = await findOutboundEmails(tenantId, {
      where: {
        deliveredAt: { not: null },
      },
    });
    const data: LoaderData = {
      items,
      hasSetWebhooks: deliveredEmails.length > 0,
    };
    return json(data);
  };

  export type ActionData = {
    error?: string;
    success?: string;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const email = form.get("email")?.toString() ?? "";
    const senderId = form.get("senderId")?.toString() ?? "";
    if (action === "send-test") {
      const sender = await getEmailSender(senderId, tenantId);
      if (!sender) {
        return json({ error: "Invalid sender" }, { status: 400 });
      }
      const outbountEmail = await createOutboundEmailTest({
        tenantId,
        email,
        fromSenderId: senderId,
      });
      try {
        await sendBroadcast({
          sender,
          to: email,
          subject: "Test email",
          htmlBody: `This is a test email with a link: 
Link: <a href='https://www.google.com'>Google</a> <br/>
Custom unsubscribe link: <a href="{{{ pm:unsubscribe }}}">Unsubscribe from this list</a> </br>
`,
          textBody: `This is a test email with a link: https://www.saasrock.com.
`,
          track: true,
          metadata: {
            outboundEmailId: outbountEmail.id,
          },
        });
        await updateOutboundEmail(outbountEmail.id, {
          sentAt: new Date(),
        });
        return json({ success: t("shared.sent") }, { status: 200 });
      } catch (e: any) {
        await updateOutboundEmail(outbountEmail.id, {
          error: e.message,
        });
        return json({ error: e.message }, { status: 400 });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
