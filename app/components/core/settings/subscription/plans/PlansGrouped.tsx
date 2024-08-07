import { Fragment, useState } from "react";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import Plans from "../Plans";
import Stripe from "stripe";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import Modal from "~/components/ui/modals/Modal";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import CreditsTableInfo from "~/modules/usage/components/CreditsTableInfo";

interface Props {
  items: SubscriptionProductDto[];
  tenantSubscription?: TenantSubscriptionWithDetails | null;
  canSubmit?: boolean;
  stripeCoupon: Stripe.Coupon | null;
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
}
export default function PlansGrouped({ items, tenantSubscription, canSubmit, stripeCoupon, currenciesAndPeriod }: Props) {
  const [showFeatureInfoModal, setShowFeatureInfoModal] = useState<boolean>(false);
  const [showFeatureInfo, setShowFeatureInfo] = useState<string | null>(null);
  const groups = () => {
    const groups: { group: { title: string; description: string }; items: SubscriptionProductDto[] }[] = [];
    items.forEach((product) => {
      let found = groups.find((f) => f.group.title === product.groupTitle && f.group.description === product.groupDescription);
      if (!found) {
        found = groups.find((f) => !f.group.title && !f.group.description && !product.groupTitle && !product.groupDescription);
      }
      if (found) {
        found.items.push(product);
      } else {
        groups.push({
          group: {
            title: product.groupTitle ?? "",
            description: product.groupDescription ?? "",
          },
          items: [product],
        });
      }
    });
    return groups;
  };

  return (
    <Fragment>
      <div className="space-y-10">
        {groups().map((group, idx) => {
          return (
            <Fragment key={idx}>
              <div>
                {group.group.title && (
                  <div className="py-4">
                    <div className="py-2">
                      <h2 className="text-2xl font-bold md:text-3xl">{group.group.title}</h2>
                      <p className="text-muted-foreground text-lg">{group.group.description}</p>
                    </div>
                  </div>
                )}
                <Plans
                  key={idx}
                  items={group.items}
                  tenantSubscription={tenantSubscription}
                  canSubmit={canSubmit}
                  className="space-y-4"
                  stripeCoupon={stripeCoupon}
                  currenciesAndPeriod={currenciesAndPeriod}
                  onClickFeature={(name) => {
                    setShowFeatureInfo(name);
                    setShowFeatureInfoModal(true);
                  }}
                />
              </div>
            </Fragment>
          );
        })}
      </div>

      <Modal size="lg" open={showFeatureInfoModal} setOpen={() => setShowFeatureInfoModal(false)}>
        {showFeatureInfo === DefaultFeatures.Credits && (
          <div>
            <CreditsTableInfo />
          </div>
        )}
      </Modal>
    </Fragment>
  );
}
