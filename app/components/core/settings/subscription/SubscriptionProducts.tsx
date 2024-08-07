import { useTranslation } from "react-i18next";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

interface Props {
  products: SubscriptionProductDto[];
  subscription: TenantSubscriptionWithDetails | null;
  canCancel: boolean;
  onCancel: () => void;
}

export default function SubscriptionProducts({ products, subscription, canCancel, onCancel }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  return (
    <div>
      {products.length === 0 ? (
        <>
          {appOrAdminData.user.admin ? (
            <WarningBanner redirect="/admin/settings/pricing" title={t("shared.warning")} text={t("admin.pricing.noPricesInDatabase")} />
          ) : (
            <WarningBanner title={t("shared.warning")} text={t("admin.pricing.noPricesConfigured")} />
          )}
        </>
      ) : (
        <>
          {products.map((product, idx) => {
            return <div key={idx}>{t(product.title)}</div>;
          })}
        </>
      )}
    </div>
  );
}
