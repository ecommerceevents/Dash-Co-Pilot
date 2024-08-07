import { LoaderFunctionArgs, redirect, ActionFunction, json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { CampaignWithDetails, getCampaign, deleteCampaign, updateCampaign } from "../db/campaigns.db.server";
import { EmailSenderWithoutApiKey, getAllEmailSenders } from "../db/emailSender";
import EmailMarketingService from "../services/EmailMarketingService";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

export namespace Campaigns_Edit {
  export type LoaderData = {
    title: string;
    item: CampaignWithDetails;
    emailSenders: EmailSenderWithoutApiKey[];
    allEntities: EntityWithDetails[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const item = await getCampaign(params.id!, tenantId);
    if (!item) {
      return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns");
    }
    const emailSenders = await getAllEmailSenders(tenantId);
    const data: LoaderData = {
      title: `${item.name} | ${process.env.APP_NAME}`,
      item,
      emailSenders,
      allEntities: await getAllEntities({ tenantId, active: true }),
    };
    return data;
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
    const item = await getCampaign(params.id!, tenantId);
    if (!item) {
      return json({ error: t("shared.notFound") }, { status: 404 });
    }
    if (action === "delete") {
      try {
        await deleteCampaign(params.id!, tenantId);
        return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns");
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "update") {
      try {
        await updateCampaign(params.id!, {
          name: form.get("name")?.toString(),
          subject: form.get("subject")?.toString(),
          htmlBody: form.get("htmlBody")?.toString(),
          textBody: form.get("textBody")?.toString(),
          // status: form.get("status")?.toString(),
        });
        return json({ success: t("shared.saved") });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "send") {
      try {
        await EmailMarketingService.sendCampaign(item);
        return json({ success: t("shared.sent") }, { status: 200 });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "send-preview") {
      try {
        const email = form.get("email")?.toString() ?? "";
        await EmailMarketingService.sendCampaignTest(item, email);
        return json({ success: t("shared.sent") }, { status: 200 });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
