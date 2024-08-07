import { Params } from "react-router";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getTranslations } from "~/locale/i18next.server";
import { EmailWithSimpleDetails, getAllEmails } from "~/utils/db/email/emails.db.server";
import { getPostmarkServer } from "~/utils/email.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantDefaultInboundAddress } from "~/utils/services/emailService";

export type LoaderDataEmails = {
  title: string;
  items: EmailWithSimpleDetails[];
  inboundEmailAddress?: any;
  error?: string;
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  tenantId: string | null;
};
export const loaderEmails = async (request: Request, params: Params, tenantId: string | null) => {
  const { t } = await getTranslations(request);

  let error = "";
  let inboundEmailAddress = "";
  const server = await getPostmarkServer();
  if (server?.InboundAddress) {
    if (!server.InboundDomain) {
      if (tenantId !== null) {
        error = `Invalid inbound domain`;
      } else {
        inboundEmailAddress = `${server.InboundAddress}`;
      }
    } else {
      if (tenantId === null) {
        inboundEmailAddress = `support@${server.InboundDomain}`;
      } else {
        const address = await getTenantDefaultInboundAddress(tenantId);
        if (address) {
          inboundEmailAddress = `${address}@${server.InboundDomain}`;
        } else {
          error = `Invalid account address`;
        }
      }
    }
  }

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "fromName",
      title: "models.email.fromName",
    },
    {
      name: "fromEmail",
      title: "models.email.fromEmail",
    },
    {
      name: "toName",
      title: "models.email.toName",
    },
    {
      name: "toEmail",
      title: "models.email.toEmail",
    },
    {
      name: "subject",
      title: "models.email.subject",
    },
    {
      name: "textBody",
      title: "models.email.textBody",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);

  const { items, pagination } = await getAllEmails("inbound", currentPagination, filters, tenantId);

  const data: LoaderDataEmails = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
    items,
    inboundEmailAddress,
    error,
    pagination,
    filterableProperties,
    tenantId,
  };
  return data;
};
