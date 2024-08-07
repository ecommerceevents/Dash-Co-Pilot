import { LoaderFunctionArgs, redirect, ActionFunction, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { createEmailSender } from "../db/emailSender";

export namespace Senders_New {
  export type LoaderData = {
    title: string;
  };
  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const data: LoaderData = {
      title: `${t("emailMarketing.senders.plural")} | ${process.env.APP_NAME}`,
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

    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    if (action === "create") {
      try {
        const provider = form.get("provider")?.toString() ?? "";
        const stream = form.get("stream")?.toString() ?? "";
        const apiKey = form.get("apiKey")?.toString() ?? "";
        const fromEmail = form.get("fromEmail")?.toString() ?? "";
        const fromName = form.get("fromName")?.toString() ?? "";
        const replyToEmail = form.get("replyToEmail")?.toString() ?? "";

        await createEmailSender({
          tenantId,
          provider,
          stream,
          apiKey,
          fromEmail,
          fromName,
          replyToEmail,
        });
        return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
      } catch (e: any) {
        return badRequest({ error: e.message });
      }
    } else {
      return badRequest({ error: t("shared.invalidForm") });
    }
  };
}
