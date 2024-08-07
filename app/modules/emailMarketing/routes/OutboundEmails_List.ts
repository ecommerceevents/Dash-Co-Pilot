import { json, LoaderFunctionArgs } from "@remix-run/node";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getAllCampaigns } from "../db/campaigns.db.server";
import { getAllEmailSenders } from "../db/emailSender";
import { OutboundEmailWithDetails, getAllOutboundEmails } from "../db/outboundEmails.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

export namespace OutboundEmails_List {
  export type LoaderData = {
    items: OutboundEmailWithDetails[];
    pagination: PaginationDto;
    filterableProperties: FilterablePropertyDto[];
    allEntities: EntityWithDetails[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const emailSenders = await getAllEmailSenders(tenantId);
    const campaigns = await getAllCampaigns(tenantId);
    const filterableProperties: FilterablePropertyDto[] = [
      {
        name: "senderId",
        title: "Sender",
        options: [
          ...emailSenders.map((i) => {
            return {
              value: i.id,
              name: i.fromEmail + " (" + i.provider + ")",
            };
          }),
        ],
      },
      {
        name: "campaignId",
        title: "Campaign",
        options: [
          { name: "{Preview}", value: "null" },
          ...campaigns.map((i) => {
            return {
              value: i.id,
              name: i.name,
            };
          }),
        ],
      },
    ];
    const filters = getFiltersFromCurrentUrl(request, filterableProperties);
    const urlSearchParams = new URL(request.url).searchParams;
    const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
    const fromSenderId = filters.properties.find((f) => f.name === "senderId")?.value ?? undefined;
    const campaignId = filters.properties.find((f) => f.name === "campaignId")?.value;
    const { items, pagination } = await getAllOutboundEmails(tenantId, {
      where: {
        fromSenderId,
        campaignId: campaignId === "null" ? null : campaignId ?? undefined,
      },
      pagination: currentPagination,
    });
    const data: LoaderData = {
      items,
      pagination,
      filterableProperties,
      allEntities: await getAllEntities({ tenantId, active: true }),
    };
    return json(data);
  };
}
