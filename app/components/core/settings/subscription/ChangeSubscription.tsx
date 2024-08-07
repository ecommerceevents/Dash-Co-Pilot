import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import clsx from "~/utils/shared/ClassesUtils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation, useSubmit } from "@remix-run/react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionPriceDto } from "~/application/dtos/subscriptions/SubscriptionPriceDto";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import InputNumber from "~/components/ui/input/InputNumber";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import Modal from "~/components/ui/modals/Modal";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import NumberUtils from "~/utils/shared/NumberUtils";

interface Props {
  current: TenantSubscriptionWithDetails | null;
  items: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
  billingPeriod: SubscriptionBillingPeriod;
  currency: string;
  canSubscribe: boolean;
}
export default function ChangeSubscription({ items, current, billingPeriod, currency, canSubscribe }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const submit = useSubmit();

  const confirmModal = useRef<RefConfirmModal>(null);

  const [showQuantityModal, setShowQuantityModal] = useState(false);

  const [products] = useState(items.filter((f) => f.public));
  const [quantity, setQuantity] = useState<number>(1);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionProductDto>();

  useEffect(() => {
    setQuantity(1);
  }, [current]);

  function getPrice(product: SubscriptionProductDto): SubscriptionPriceDto | undefined {
    const prices = product.prices.find(
      (f) => (f.billingPeriod === billingPeriod || f.billingPeriod === SubscriptionBillingPeriod.ONCE) && f.currency === currency && f.active
    );
    return prices;
  }
  function getPriceAmount(product: SubscriptionProductDto) {
    return NumberUtils.intFormat(Number(getPrice(product)?.price ?? 0));
  }

  function selectPrice(product: SubscriptionProductDto) {
    const price = getPrice(product);
    if (!price || !price.id) {
      return;
    }
    setSelectedPlan(product);
    if (product.model === PricingModel.PER_SEAT) {
      setShowQuantityModal(true);
    } else if (!isCurrent(product)) {
      const form = new FormData();
      form.set("action", "subscribe");
      form.set("product-id", product?.id?.toString() ?? "");
      form.set("billing-period", billingPeriod.toString());
      form.set("currency", currency);
      submit(form, {
        method: "post",
      });
    } else {
      cancel();
    }
  }

  function confirmedQuantity() {
    if (!selectedPlan) {
      return;
    }
    const price = getPrice(selectedPlan);
    if (!price || !price.id) {
      return;
    }
    const form = new FormData();
    form.set("action", "subscribe");
    form.set("quantity", quantity.toString());
    form.set("price-id", price.id);
    submit(form, {
      method: "post",
    });
  }

  function isCurrent(plan: SubscriptionProductDto) {
    return current?.products.find((f) => f.subscriptionProductId === plan.id) !== undefined;
  }
  function getButtonTitle(plan: SubscriptionProductDto, withSeats: boolean = false) {
    if (isCurrent(plan)) {
      return t("shared.subscribed");
    }
    const subscriptionPrice = getPrice(plan);
    if (withSeats && plan.model === PricingModel.PER_SEAT && subscriptionPrice) {
      const billingPeriodDescription = billingPeriod === 3 ? t("pricing.MONTHLYShort") : t("pricing.YEARLYShort");
      return t("pricing.subscribe") + " " + t(plan.title) + " $" + Number(subscriptionPrice.price) * quantity + "/" + billingPeriodDescription;
    }
    // if (current?.subscriptionPrice) {
    //   return isUpgrade(plan) ? t("shared.upgrade") : t("shared.downgrade");
    // }
    return t("pricing.subscribe");
  }

  // function isDowngrade(plan: SubscriptionProductDto) {
  //   if (current) {
  //     return plan.order < (current.subscriptionPrice?.subscriptionProduct.order ?? 0);
  //   }
  //   return false;
  // }

  // function isUpgrade(plan: SubscriptionProductDto) {
  //   if (!current) {
  //     return true;
  //   }
  //   return plan.order > (current.subscriptionPrice?.subscriptionProduct.order ?? 0);
  // }

  function cancel() {
    confirmModal.current?.show(t("settings.subscription.confirmCancel"));
  }
  function confirmCancel() {
    const form = new FormData();
    form.set("action", "cancel");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <div className="container mx-auto mt-6 antialiased">
        <main className="">
          <div className="space-y-2">
            <div className={clsx("mt-6 grid gap-4 lg:gap-2", products.length === 2 && "lg:grid-cols-2", products.length > 2 && "lg:grid-cols-3")}>
              {products
                .filter((f) => f.public)
                .map((plan, index) => {
                  return (
                    <div key={index}>
                      <section
                        className={clsx(
                          "relative flex w-full flex-col rounded-md p-6 shadow-sm",
                          !isCurrent(plan) && "border border-teal-800",
                          isCurrent(plan) && "border-2 border-teal-600"
                        )}
                      >
                        {isCurrent(plan) && (
                          <div className="absolute top-0 -translate-y-1/2 transform rounded-full bg-teal-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                            {t("shared.current")}
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          {/* Price */}
                          <div className="flex-shrink-0 truncate">
                            <span className="text-2xl font-medium tracking-tight">${getPriceAmount(plan)}</span>
                            {plan.model === PricingModel.PER_SEAT && <span className="text-gray-500">/{t("pricing.seat").toLowerCase()}</span>}
                            {(() => {
                              if (getPrice(plan)?.billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
                                return <span className="lowercase text-gray-500">/{t("pricing.MONTHLYShort")}</span>;
                              } else if (getPrice(plan)?.billingPeriod === SubscriptionBillingPeriod.YEARLY) {
                                return <span className="lowercase text-gray-500">/{t("pricing.YEARLYShort")}</span>;
                              } else if (getPrice(plan)?.billingPeriod === SubscriptionBillingPeriod.ONCE) {
                                return <span className="lowercase text-gray-500">/{t("pricing.once")}</span>;
                              }
                            })()}
                          </div>

                          {/* Badge */}
                          <div className="flex-shrink-0 space-y-2 border-b pb-3">
                            <h2 className="text-lg font-normal">{t(plan.title)}</h2>
                          </div>

                          {/* Features */}
                          <ul className="flex-1 space-y-1">
                            {plan.features
                              .sort((a, b) => (a.order > b.order ? 1 : -1))
                              .map((feature, idxFeature) => {
                                return (
                                  <li key={idxFeature}>
                                    <div className="flex items-center">
                                      {feature.type !== SubscriptionFeatureLimitType.NOT_INCLUDED ? (
                                        <svg
                                          className="text-theme-500 h-4 w-4 opacity-70"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-gray-300 opacity-70"
                                          viewBox="0 0 20 20"
                                          stroke="#FFFFF"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                      <span className="ml-3 truncate text-sm">
                                        <span>{t(feature.title, { 0: feature.value })}</span>
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                          </ul>

                          {/* Button */}
                          <div className="flex-shrink-0 space-y-2 pt-4">
                            <button
                              disabled={loading || isCurrent(plan) || !getPrice(plan)?.stripeId || !canSubscribe}
                              type="button"
                              onClick={() => selectPrice(plan)}
                              className={clsx(
                                "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                                loading || isCurrent(plan) || !getPrice(plan)?.stripeId || !canSubscribe
                                  ? "cursor-not-allowed opacity-80"
                                  : "border-slate-800 hover:bg-gray-100"
                                // isUpgrade(plan) && canSubscribe && "hover:text-teal-600",
                                // isDowngrade(plan) && canSubscribe && "hover:text-red-600"
                              )}
                            >
                              {getButtonTitle(plan)}
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>
                  );
                })}
            </div>
          </div>
        </main>
      </div>

      <Modal className="sm:max-w-xs" open={showQuantityModal} setOpen={setShowQuantityModal}>
        <InputNumber name="quantity" title={t("pricing.seats")} value={quantity} setValue={(e) => setQuantity(Number(e))} required min={1} />
        {selectedPlan && (
          <LoadingButton disabled={quantity <= 0} className="mt-2 w-full text-center" type="button" onClick={confirmedQuantity}>
            {getButtonTitle(selectedPlan, true)}
          </LoadingButton>
        )}
      </Modal>
      <ConfirmModal ref={confirmModal} onYes={confirmCancel} />
    </div>
  );
}
