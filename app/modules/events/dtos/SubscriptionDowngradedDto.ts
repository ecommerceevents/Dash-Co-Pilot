export type SubscriptionDowngradedDto = {
  user: {
    id: string;
    email: string;
  } | null;
  tenant: {
    id: string;
    name: string;
  };
  // to: {
  //   price: {
  //     id: string;
  //     billingPeriod: SubscriptionBillingPeriod;
  //     amount: number;
  //   };
  //   product: {
  //     id: string;
  //     title: string;
  //   };
  // };
  // from: {
  //   price: {
  //     id: string;
  //     billingPeriod: SubscriptionBillingPeriod;
  //     amount: number;
  //   };
  //   product: {
  //     id: string;
  //     title: string;
  //   };
  // };
  subscription: {
    product: {
      id: string;
      title: string;
    };
    session?: string;
  };
};
