import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import { getAllFeatureFlags } from "~/modules/featureFlags/db/featureFlags.db.server";
import { db } from "~/utils/db.server";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  summary: {
    flagsTotal: number;
    flagsEnabled: number;
    triggersTotal: number;
  };
};
export const loader = async () => {
  const items = await getAllFeatureFlags();
  const triggersTotal = await db.analyticsEvent.count({
    where: { featureFlagId: { not: null } },
  });
  const data: LoaderData = {
    summary: {
      flagsTotal: items.length,
      flagsEnabled: items.filter((f) => f.enabled).length,
      triggersTotal,
    },
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-gray-500">
            <ColorBadge color={Colors.GREEN} />
            <div>{t("featureFlags.plural")}</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-gray-900">
            <div>
              {NumberUtils.numberFormat(data.summary.flagsEnabled)}/{NumberUtils.numberFormat(data.summary.flagsTotal)}
            </div>
            <div className="text-xs font-normal lowercase text-gray-500">{t("featureFlags.enabled")}</div>
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>{t("featureFlags.triggers")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.triggersTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
