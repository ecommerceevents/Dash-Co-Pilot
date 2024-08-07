const includeTenantSubscriptionProductDetails = {
  subscriptionProduct: { include: { features: true } },
  prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
};

export default {
  includeTenantSubscriptionProductDetails,
};
