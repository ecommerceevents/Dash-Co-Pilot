import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import EmailMarketingService, { EmailMarketingSummaryDto } from "../services/EmailMarketingService";

export namespace EmailMarketing_Summary {
  export type LoaderData = {
    title: string;
    summary: EmailMarketingSummaryDto;
  };

  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const data: LoaderData = {
      title: `${t("emailMarketing.title")} | ${process.env.APP_NAME}`,
      summary: await EmailMarketingService.getSummary(tenantId),
    };
    return json(data);
  };
}
