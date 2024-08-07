import { ReactNode } from "react";
import { useParams } from "@remix-run/react";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import UrlUtils from "~/utils/app/UrlUtils";
import { useTranslation } from "react-i18next";

interface Props {
  item: PlanFeatureUsageDto | undefined;
  children: ReactNode;
  hideContent?: boolean;
  showRemaining?: boolean;
}
export default function CheckPlanFeatureLimit({ item, children, hideContent = true, showRemaining }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  function getTitle() {
    if (item?.entity) {
      return t(item.entity.titlePlural);
    }
    return item?.name ?? "";
  }
  return (
    <div>
      {item && !item.enabled ? (
        <div className="space-y-2">
          <WarningBanner redirect={UrlUtils.currentTenantUrl(params, `settings/subscription`)} title={getTitle().toUpperCase()} text={``}>
            <div className="mt-2">
              <span>{t(item.message)}</span>
            </div>
          </WarningBanner>

          {!hideContent && children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
