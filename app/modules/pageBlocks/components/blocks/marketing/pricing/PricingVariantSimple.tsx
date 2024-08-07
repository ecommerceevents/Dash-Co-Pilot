import { useSearchParams } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import PlansGrouped from "~/components/core/settings/subscription/plans/PlansGrouped";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useRootData } from "~/utils/data/useRootData";
import { PricingBlockDto } from "./PricingBlockUtils";
import PricingContactUs from "./shared/PricingContactUs";
import clsx from "clsx";

export default function PricingVariantSimple({ item }: { item: PricingBlockDto }) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const [searchParams, setSearchParams] = useSearchParams();
  const confirmModal = useRef<RefConfirmModal>(null);
  // function onShowCoupon() {
  //   confirmModal.current?.show(t("pricing.coupons.object"));
  // }
  function onApplyCoupon(coupon: string) {
    setSearchParams({ coupon });
  }
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {(item.headline || item.subheadline) && (
          <div
            className={clsx(
              "space-y-5",
              (!item.position || item.position === "center") && "text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl",
              item.position === "left" && "text-left",
              item.position === "right" && "text-right"
            )}
          >
            <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
              {item.headline && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
              {item.subheadline && <p className="text-muted-foreground text-xl">{t(item.subheadline)}</p>}
            </div>
          </div>
        )}

        <div className="container mx-auto antialiased">
          {item.allowCoupons && (
            <>
              {/* <div className="text-center">
                {!item.data?.coupon && (
                  <button type="button" onClick={onShowCoupon} className="mt-2 text-base leading-6 text-muted-foreground hover:underline dark:text-gray-400">
                    {t("pricing.coupons.iHaveACoupon")}.
                  </button>
                )}
              </div> */}
              {item.data?.coupon && (
                <div className="mt-10">
                  {item.data?.coupon.error ? (
                    <WarningBanner title="Invalid coupon" text={item.data?.coupon.error} />
                  ) : (
                    <InfoBanner title={<>{t("pricing.coupons.applied")}</>} text={""}>
                      <div>
                        {t("pricing.coupons.success")}:{" "}
                        <span className="font-medium">{item.data?.coupon.stripeCoupon?.name ?? item.data?.coupon.stripeCoupon?.id}</span>
                      </div>
                    </InfoBanner>
                  )}
                </div>
              )}
            </>
          )}
          {item.data && (
            <main className="py-10 lg:mx-4">
              <PlansGrouped
                items={item.data?.items}
                canSubmit={!rootData.authenticated && rootData.appConfiguration.subscription.allowSubscribeBeforeSignUp}
                stripeCoupon={item.data.coupon?.stripeCoupon || null}
                currenciesAndPeriod={item.data.currenciesAndPeriod}
              />
            </main>
          )}
          {item.contactUs && !searchParams.get("plan") && <PricingContactUs item={item.contactUs} />}
          <ConfirmModal ref={confirmModal} onYes={onApplyCoupon} inputType="string" placeholder={t("pricing.coupons.typeCode")} />
        </div>
      </div>
    </>
  );
}
