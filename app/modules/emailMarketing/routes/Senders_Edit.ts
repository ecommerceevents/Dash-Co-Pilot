import { LoaderFunctionArgs, redirect, ActionFunction, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { EmailSenderWithoutApiKey, getEmailSenderWithoutApiKey, getEmailSender, updateEmailSender, deleteEmailSender } from "../db/emailSender";

export namespace Senders_Edit {
  export type LoaderData = {
    item: EmailSenderWithoutApiKey;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const item = await getEmailSenderWithoutApiKey(params.id!, tenantId);
    if (!item) {
      return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
    }
    const data: LoaderData = {
      item,
    };
    return json(data);
  };

  export type ActionData = {
    error?: string;
  };
  const badRequest = (data: ActionData) => json(data, { status: 400 });
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });

    const existing = await getEmailSender(params.id ?? "", tenantId);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }

    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";

    if (action === "edit") {
      try {
        const provider = form.get("provider")?.toString() ?? "";
        const stream = form.get("stream")?.toString() ?? "";
        const fromEmail = form.get("fromEmail")?.toString() ?? "";
        const fromName = form.get("fromName")?.toString() ?? "";
        const replyToEmail = form.get("replyToEmail")?.toString() ?? "";

        await updateEmailSender(existing.id, {
          provider,
          stream,
          fromEmail,
          fromName,
          replyToEmail,
        });
        return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
      } catch (e: any) {
        return badRequest({ error: e.message });
      }
    } else if (action === "delete") {
      await deleteEmailSender(existing.id);
      return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
    }
    return badRequest({ error: t("shared.invalidForm") });
  };
}
