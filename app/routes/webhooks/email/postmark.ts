import { ActionFunction, json } from "@remix-run/node";
import { clickedOutboundEmail, getOutboundEmail, openedOutboundEmail, updateOutboundEmail } from "~/modules/emailMarketing/db/outboundEmails.db.server";
import CrmService from "~/modules/crm/services/CrmService";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const body = await request.json();
      const RecordType: "Delivery" | "Bounce" | "SpamComplaint" | "Open" | "Click" | "SubscriptionChange" = body.RecordType;
      const Metadata = body.Metadata;
      if (Metadata.example === "value") {
        return json({}, { status: 200 });
      }
      const outboundEmailId = Metadata.outboundEmailId;
      if (!outboundEmailId) {
        return json({ error: "Metadata required: outboundEmailId", body }, { status: 404 });
      }
      const outboundEmail = await getOutboundEmail(outboundEmailId);
      // eslint-disable-next-line no-console
      console.log({ RecordType, outboundEmail });
      if (!outboundEmail) {
        return json({ error: "No outbound email found with ID: " + outboundEmailId, body }, { status: 404 });
      }

      if (RecordType === "Delivery") {
        await updateOutboundEmail(outboundEmail.id, {
          deliveredAt: new Date(body.DeliveredAt),
        });
      } else if (RecordType === "Bounce") {
        await updateOutboundEmail(outboundEmail.id, {
          bouncedAt: new Date(body.DeliveredAt),
        });
      } else if (RecordType === "SpamComplaint") {
        await updateOutboundEmail(outboundEmail.id, {
          spamComplainedAt: new Date(body.DeliveredAt),
        });
      } else if (RecordType === "Open") {
        await openedOutboundEmail(outboundEmail.id, {
          firstOpen: Boolean(body.FirstOpen),
        });
      } else if (RecordType === "Click") {
        await clickedOutboundEmail(outboundEmail.id, {
          link: body.OriginalLink,
        });
      } else if (RecordType === "SubscriptionChange") {
        if (body.SuppressSending) {
          // eslint-disable-next-line no-console
          console.log("Unsubscribed from email: " + outboundEmail.email);
          await updateOutboundEmail(outboundEmail.id, {
            unsubscribedAt: new Date(),
          });
          if (outboundEmail.contactRowId) {
            const contact = await CrmService.getContact(outboundEmail.contactRowId);
            if (contact) {
              await CrmService.updateContact(contact.id, {
                marketingSubscriber: false,
              });
            }
          }
        }
      }
      return json({}, { status: 201 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};
