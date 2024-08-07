import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { CampaignWithDetails, getAllCampaigns, groupCampaigns } from "../db/campaigns.db.server";
import { EmailSenderWithoutApiKey, getAllEmailSenders } from "../db/emailSender";

export namespace Campaigns_List {
  export type LoaderData = {
    title: string;
    items: CampaignWithDetails[];
    groupByStatus: {
      status: string;
      count: number;
    }[];
    emailSenders: EmailSenderWithoutApiKey[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const searchParams = new URL(request.url).searchParams;
    const status = searchParams.get("status")?.toString();
    const items = await getAllCampaigns(tenantId, status);
    const campaignsCount = await groupCampaigns(tenantId);
    const groupByStatus = campaignsCount.map((item) => {
      return {
        status: item.status,
        count: item._count._all,
      };
    });
    const data: LoaderData = {
      title: `Campaigns | ${process.env.APP_NAME}`,
      items,
      groupByStatus,
      emailSenders: await getAllEmailSenders(tenantId),
    };
    return json(data);
  };
}
