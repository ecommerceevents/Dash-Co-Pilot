import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { PortalWithDetails, getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import AnalyticsOverview from "~/components/analytics/AnalyticsOverview";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import AnalyticsService, { AnalyticsOverviewDto } from "~/utils/helpers/.server/AnalyticsService";
import PeriodHelper, { PeriodFilters, defaultPeriodFilter } from "~/utils/helpers/PeriodHelper";
import PortalServer from "~/modules/portals/services/Portal.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import InputSelect from "~/components/ui/input/InputSelect";

type LoaderData = {
  item: PortalWithDetails & { portalUrl?: string };
  overview: AnalyticsOverviewDto;
};
export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.analytics) {
    throw json({ error: "Analytics are not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const item: (PortalWithDetails & { portalUrl?: string }) | null = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  item.portalUrl = PortalServer.getPortalUrl(item);
  const data: LoaderData = {
    item,
    overview: await AnalyticsService.getAnalyticsOverview({
      withUsers: false,
      period: PeriodHelper.getPeriodFromRequest({ request }),
      portalId: item.id,
    }),
  };

  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <EditPageLayout
      title={t("analytics.title")}
      withHome={false}
      // menu={[
      //   // {
      //   //   title: t("models.portal.plural"),
      //   //   routePath: UrlUtils.getModulePath(params, "portals"),
      //   // },
      //   {
      //     title: data.item.title,
      //     routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
      //   },
      //   {
      //     title: "Domain",
      //   },
      // ]}
      buttons={
        <>
          <InputSelect
            className="w-44"
            name="period"
            value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
            options={PeriodFilters.map((f) => {
              return {
                value: f.value,
                name: t(f.name),
              };
            })}
            setValue={(value) => {
              if (value && value !== defaultPeriodFilter) {
                searchParams.set("period", value?.toString() ?? "");
              } else {
                searchParams.delete("period");
              }
              setSearchParams(searchParams);
            }}
          />
          {data.item.portalUrl && (
            <ButtonPrimary to={data.item.portalUrl} target="_blank" disabled={!data.item.isPublished}>
              <div className="flex items-center space-x-2">
                <ExternalLinkEmptyIcon className="h-4 w-4" />
              </div>
            </ButtonPrimary>
          )}
        </>
      }
    >
      <div className="space-y-2 pb-10">
        <AnalyticsOverview overview={data.overview} withUsers={false} />
      </div>
    </EditPageLayout>
  );
}
