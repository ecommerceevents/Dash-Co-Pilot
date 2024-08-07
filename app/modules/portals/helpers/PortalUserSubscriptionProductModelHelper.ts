const includePortalUserSubscriptionProductDetails = {
  subscriptionProduct: { include: { features: true } },
  prices: { include: { subscriptionPrice: true } },
};

export default {
  includePortalUserSubscriptionProductDetails,
};
