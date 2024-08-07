import { Prisma } from "@prisma/client";
import type { TenantWithDetails } from "../db/tenants.db.server";
import type { TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import type { EntityWithDetails } from "../db/entities/entities.db.server";
import RowHelper from "./RowHelper";
import { TFunction } from "i18next";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

const tenantCondition = ({ tenantId, includePublic }: { tenantId: string | null; includePublic?: boolean }): Prisma.RowWhereInput => {
  if (includePublic) {
    return { OR: [{ tenantId }, { permissions: { some: { tenantId } } }, { permissions: { some: { public: true } } }] };
  } else {
    return { OR: [{ tenantId }, { permissions: { some: { tenantId } } }] };
  }
};

function apiFormat({
  tenant,
  subscriptions,
  tenantSettingsEntity,
  t,
}: {
  tenant: TenantWithDetails;
  subscriptions: TenantSubscriptionWithDetails | null;
  tenantSettingsEntity: EntityWithDetails | null;
  t: TFunction;
}) {
  let customRow = undefined;
  if (tenantSettingsEntity) {
    customRow = RowHelper.getProperties(tenantSettingsEntity, tenant.tenantSettingsRow?.row ?? null);
  }
  return {
    id: tenant.id,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    slug: tenant.slug,
    name: tenant.name,
    icon: tenant.icon,
    ...customRow,
    subscription: !subscriptions
      ? null
      : {
          id: subscriptions.id,
          stripeCustomerId: subscriptions.stripeCustomerId,
          products: subscriptions.products.map((f) => {
            return {
              id: f.id,
              product: t(f.subscriptionProduct.title),
              quantity: f.quantity,
              currentPeriodStart: f.currentPeriodStart,
              currentPeriodEnd: f.currentPeriodEnd,
              model: PricingModel[f.subscriptionProduct.model],
              cancelledAt: f.cancelledAt ?? undefined,
              endsAt: f.endsAt ?? undefined,
              stripeId: f.stripeSubscriptionId,
              prices: f.prices.map((p) => {
                return {
                  id: p.id,
                  ...(p.subscriptionPrice
                    ? {
                        stripeId: p.subscriptionPrice.stripeId,
                        type: SubscriptionPriceType[p.subscriptionPrice.type],
                        billingPeriod: SubscriptionBillingPeriod[p.subscriptionPrice.billingPeriod],
                        price: Number(p.subscriptionPrice.price),
                        currency: p.subscriptionPrice.currency,
                      }
                    : p.subscriptionUsageBasedPrice
                    ? {
                        stripeId: p.subscriptionUsageBasedPrice.stripeId,
                        billingPeriod: SubscriptionBillingPeriod[p.subscriptionUsageBasedPrice.billingPeriod],
                        currency: p.subscriptionUsageBasedPrice.currency,
                        unit: p.subscriptionUsageBasedPrice.unit,
                        unitTitle: t(p.subscriptionUsageBasedPrice.unitTitle),
                        unitTitlePlural: t(p.subscriptionUsageBasedPrice.unitTitlePlural),
                        usageType: p.subscriptionUsageBasedPrice.usageType,
                        aggregateUsage: p.subscriptionUsageBasedPrice.aggregateUsage,
                        tiersMode: p.subscriptionUsageBasedPrice.tiersMode,
                        billingScheme: p.subscriptionUsageBasedPrice.billingScheme,
                        tiers: p.subscriptionUsageBasedPrice.tiers.map((t) => {
                          return {
                            id: t.id,
                            from: Number(t.from),
                            to: t.to ? Number(t.to) : null,
                            perUnitPrice: t.perUnitPrice ? Number(t.perUnitPrice) : undefined,
                            flatFeePrice: t.flatFeePrice ? Number(t.flatFeePrice) : undefined,
                          };
                        }),
                      }
                    : undefined),
                };
              }),
            };
          }),
        },
  };
}

export default {
  tenantCondition,
  apiFormat,
};
