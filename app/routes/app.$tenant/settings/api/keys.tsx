import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { ApiKeyWithDetails, getApiKeys } from "~/utils/db/apiKeys.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getPlanFeatureUsage } from "~/utils/services/.server/subscriptionService";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  const apiKeys = await getApiKeys(tenantId);
  const featurePlanUsage = await getPlanFeatureUsage(tenantId, DefaultFeatures.API);
  const data: LoaderData = {
    apiKeys,
    featurePlanUsage,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appData = useAppData();
  const params = useParams();
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("shared.overview"),
            routePath: UrlUtils.getModulePath(params, "api"),
          },
          {
            name: t("models.apiCall.plural"),
            routePath: UrlUtils.getModulePath(params, "api/logs"),
          },
          {
            name: t("models.apiKey.plural"),
            routePath: UrlUtils.getModulePath(params, "api/keys"),
          },
          {
            name: "Docs",
            routePath: UrlUtils.getModulePath(params, "api/docs"),
          },
        ]}
      >
        <CheckPlanFeatureLimit item={data.featurePlanUsage} hideContent={false}>
          <div className="space-y-2">
            <ApiKeysTable
              entities={appData.entities}
              items={data.apiKeys}
              withTenant={false}
              canCreate={getUserHasPermission(appData, "app.settings.apiKeys.create")}
            />
            {data.featurePlanUsage?.enabled && (
              <InfoBanner title="API usage" text="API calls remaining: ">
                {data.featurePlanUsage?.remaining === "unlimited" ? (
                  <span>{t("shared.unlimited")}</span>
                ) : (
                  <span>
                    <b>
                      {t("shared.remaining")} {data.featurePlanUsage.remaining}
                    </b>
                  </span>
                )}
              </InfoBanner>
            )}
          </div>
          <Outlet />
        </CheckPlanFeatureLimit>
      </IndexPageLayout>
    </>
  );
}
