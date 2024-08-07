import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import NumberUtils from "~/utils/shared/NumberUtils";
import { EmailMarketing_Summary } from "../routes/EmailMarketing_Summary";

export default function EmailMarketingSummaryRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<EmailMarketing_Summary.LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-foreground text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>{t("emailMarketing.overview.avgOpenRate")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.decimalFormat(data.summary.avgOpenRate)}%</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>{t("emailMarketing.overview.avgClickRate")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.decimalFormat(data.summary.avgClickRate)}%</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-gray-500">
            <ColorBadge color={Colors.GREEN} />
            <div>{t("emailMarketing.overview.totalSent")}</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-gray-900">
            <div>
              {NumberUtils.numberFormat(data.summary.outboundEmails.delivered)}/{NumberUtils.numberFormat(data.summary.outboundEmails.sent)}
            </div>
            <div className="text-xs font-normal lowercase text-gray-500">{t("emails.delivered")}</div>
          </dd>
        </div>
      </dl>
    </div>
  );
}
