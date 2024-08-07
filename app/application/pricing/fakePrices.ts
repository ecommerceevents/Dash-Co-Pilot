import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { DefaultFeatures } from "../dtos/shared/DefaultFeatures";
import { SubscriptionPriceDto } from "../dtos/subscriptions/SubscriptionPriceDto";
import { SubscriptionProductDto } from "../dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionUsageBasedPriceDto } from "../dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import { SubscriptionUsageBasedTierDto } from "../dtos/subscriptions/SubscriptionUsageBasedTierDto";
import { PricingModel } from "../enums/subscriptions/PricingModel";
import { SubscriptionFeatureLimitType } from "../enums/subscriptions/SubscriptionFeatureLimitType";
import { UNIT_API_CALL, UNIT_EMPLOYEE } from "./usageBasedUnits";

function generatePrice(currency: string, price: number, billingPeriod: SubscriptionBillingPeriod): SubscriptionPriceDto {
  return {
    stripeId: "",
    subscriptionProductId: "",
    type: billingPeriod === SubscriptionBillingPeriod.ONCE ? SubscriptionPriceType.ONE_TIME : SubscriptionPriceType.RECURRING,
    billingPeriod,
    price: Math.round(price * 100) / 100,
    currency,
    trialDays: 0,
    active: true,
    usageBasedPrices: [],
  };
}

function generateUsageBasedPrice(
  currency: string,
  unit: {
    name: string;
    title: string;
    titlePlural: string;
  },
  usageType: "licensed" | "metered",
  aggregateUsage: "last_during_period" | "last_ever" | "max" | "sum",
  tiersMode: "graduated" | "volume",
  billingScheme: "per_unit" | "tiered",
  tiers: {
    from: number;
    to: undefined | number;
    perUnitPrice: number | undefined;
    flatFeePrice: number | undefined;
  }[]
): SubscriptionUsageBasedPriceDto {
  const usageBasedPriceTiers: SubscriptionUsageBasedTierDto[] = [];
  tiers.forEach((tier) => {
    usageBasedPriceTiers.push({
      id: "",
      subscriptionUsageBasedPriceId: "",
      ...tier,
    });
  });
  return {
    id: "",
    stripeId: "",
    subscriptionProductId: "",
    billingPeriod: SubscriptionBillingPeriod.MONTHLY,
    currency,
    unit: unit.name,
    unitTitle: unit.title,
    unitTitlePlural: unit.titlePlural,
    usageType,
    aggregateUsage,
    tiersMode,
    billingScheme,
    tiers: usageBasedPriceTiers,
  };
}

function generateCommonPlan(order: number, model: PricingModel) {
  if (order === 1) {
    return {
      stripeId: "",
      order,
      title: "pricing.products.plan1.title",
      description: "pricing.products.plan1.description",
      model,
      public: true,
      features: [
        {
          order: 1,
          title: "pricing.features.users.max",
          name: DefaultFeatures.Users,
          value: 2,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 3,
          title: "pricing.features.apiCalls.units",
          name: DefaultFeatures.API,
          value: 0,
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          accumulate: false,
        },
        {
          order: 4,
          title: "pricing.features.prioritySupport.none",
          name: DefaultFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          accumulate: false,
        },
      ],
      badge: "",
      active: true,
      prices: [],
    };
  } else if (order === 2) {
    return {
      stripeId: "",
      order,
      title: "pricing.products.plan2.title",
      description: "pricing.products.plan2.description",
      public: true,
      model,
      features: [
        {
          order: 1,
          title: "pricing.features.users.max",
          name: DefaultFeatures.Users,
          value: 5,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 3,
          title: "pricing.features.apiCalls.monthly",
          name: DefaultFeatures.API,
          value: 100,
          type: SubscriptionFeatureLimitType.MONTHLY,
          accumulate: false,
        },
        {
          order: 4,
          title: "pricing.features.prioritySupport.basic",
          name: DefaultFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.INCLUDED,
          accumulate: false,
        },
      ],
      badge: "pricing.recommended",
      active: true,
    };
  } else if (order === 3) {
    return {
      stripeId: "",
      order,
      title: "pricing.products.plan3.title",
      description: "pricing.products.plan3.description",
      public: true,
      model,
      features: [
        {
          order: 1,
          title: "pricing.features.users.max",
          name: DefaultFeatures.Users,
          value: 12,
          type: SubscriptionFeatureLimitType.MAX,
          accumulate: false,
        },
        {
          order: 3,
          title: "pricing.features.apiCalls.unlimited",
          name: DefaultFeatures.API,
          value: 0,
          type: SubscriptionFeatureLimitType.UNLIMITED,
          accumulate: false,
        },
        {
          order: 4,
          title: "pricing.features.prioritySupport.priority",
          name: DefaultFeatures.PrioritySupport,
          value: 0,
          type: SubscriptionFeatureLimitType.INCLUDED,
          accumulate: false,
        },
      ],
      badge: "",
      active: true,
    };
  }

  return {
    stripeId: "",
    order,
    title: "pricing.products.plan1.title",
    description: "pricing.products.plan1.description",
    model,
    public: true,
    features: [
      {
        order: 1,
        title: "pricing.features.users.one",
        name: DefaultFeatures.Users,
        value: 1,
        type: SubscriptionFeatureLimitType.MAX,
        accumulate: false,
      },
    ],
    badge: "",
    active: true,
  };
}

const FLAT_RATE_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.FLAT_RATE),
    prices: [
      generatePrice("usd", 9, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("usd", 90, SubscriptionBillingPeriod.YEARLY),
      generatePrice("mxn", 199, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("mxn", 1990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(2, PricingModel.FLAT_RATE),
    prices: [
      generatePrice("usd", 199, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("usd", 1990, SubscriptionBillingPeriod.YEARLY),
      generatePrice("mxn", 3999, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("mxn", 39990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(3, PricingModel.FLAT_RATE),
    prices: [
      generatePrice("usd", 399, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("usd", 3990, SubscriptionBillingPeriod.YEARLY),
      generatePrice("mxn", 7999, SubscriptionBillingPeriod.MONTHLY),
      generatePrice("mxn", 79990, SubscriptionBillingPeriod.YEARLY),
    ],
    usageBasedPrices: [],
  },
];

const PER_SEAT_PRICES: SubscriptionProductDto[] = [
  ...FLAT_RATE_PRICES.map((item) => {
    return { ...item, model: PricingModel.PER_SEAT };
  }),
];

const USAGE_BASED_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice("usd", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 0.02, flatFeePrice: 5 },
        { from: 21, to: undefined, perUnitPrice: 0.01, flatFeePrice: 10 },
      ]),
      generateUsageBasedPrice("mxn", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 0.4, flatFeePrice: 100 },
        { from: 21, to: undefined, perUnitPrice: 0.2, flatFeePrice: 200 },
      ]),
      generateUsageBasedPrice("usd", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 1, flatFeePrice: undefined },
      ]),
      generateUsageBasedPrice("mxn", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 20, flatFeePrice: undefined },
      ]),
      // generateUsageBasedPrice("usd", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 2, flatFeePrice: undefined },
      // ]),
      // generateUsageBasedPrice("mxn", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 40, flatFeePrice: undefined },
      // ]),
    ],
  },
  {
    ...generateCommonPlan(2, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice("usd", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 0.04, flatFeePrice: 10 },
        { from: 21, to: undefined, perUnitPrice: 0.02, flatFeePrice: 20 },
      ]),
      generateUsageBasedPrice("mxn", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 0.8, flatFeePrice: 200 },
        { from: 21, to: undefined, perUnitPrice: 0.4, flatFeePrice: 400 },
      ]),
      generateUsageBasedPrice("usd", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 1, flatFeePrice: undefined },
      ]),
      generateUsageBasedPrice("mxn", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 20, flatFeePrice: undefined },
      ]),
      // generateUsageBasedPrice("usd", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 2, flatFeePrice: undefined },
      // ]),
      // generateUsageBasedPrice("mxn", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 40, flatFeePrice: undefined },
      // ]),
    ],
  },
  {
    ...generateCommonPlan(3, PricingModel.USAGE_BASED),
    prices: [],
    usageBasedPrices: [
      generateUsageBasedPrice("usd", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 0.06, flatFeePrice: 15 },
        { from: 21, to: undefined, perUnitPrice: 0.03, flatFeePrice: 30 },
      ]),
      generateUsageBasedPrice("mxn", UNIT_API_CALL, "metered", "sum", "volume", "tiered", [
        { from: 0, to: 10, perUnitPrice: 0.0, flatFeePrice: undefined },
        { from: 11, to: 20, perUnitPrice: 1.2, flatFeePrice: 300 },
        { from: 21, to: undefined, perUnitPrice: 0.6, flatFeePrice: 600 },
      ]),
      generateUsageBasedPrice("usd", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 1, flatFeePrice: undefined },
      ]),
      generateUsageBasedPrice("mxn", UNIT_EMPLOYEE, "metered", "sum", "volume", "tiered", [
        { from: 0, to: undefined, perUnitPrice: 20, flatFeePrice: undefined },
      ]),
      // generateUsageBasedPrice("usd", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 2, flatFeePrice: undefined },
      // ]),
      // generateUsageBasedPrice("mxn", UNIT_CONTRACT, "metered", "sum", "volume", "tiered", [
      //   { from: 0, to: undefined, perUnitPrice: 40, flatFeePrice: undefined },
      // ]),
    ],
  },
];

const FLAT_RATE_PLUS_USAGE_BASED_PRICES: SubscriptionProductDto[] = [
  ...FLAT_RATE_PRICES.map((flatRate) => {
    const usageBasedPrices = USAGE_BASED_PRICES.find((f) => f.order === flatRate.order)?.usageBasedPrices ?? [];
    return {
      ...flatRate,
      usageBasedPrices,
      model: PricingModel.FLAT_RATE_USAGE_BASED,
    };
  }),
];

const ONE_TIME_PRICES: SubscriptionProductDto[] = [
  {
    ...generateCommonPlan(1, PricingModel.ONCE),
    prices: [generatePrice("usd", 99 * 2, SubscriptionBillingPeriod.ONCE), generatePrice("mxn", 1999 * 2, SubscriptionBillingPeriod.ONCE)],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(2, PricingModel.ONCE),
    prices: [generatePrice("usd", 499 * 2, SubscriptionBillingPeriod.ONCE), generatePrice("mxn", 9999 * 2, SubscriptionBillingPeriod.ONCE)],
    usageBasedPrices: [],
  },
  {
    ...generateCommonPlan(3, PricingModel.ONCE),
    prices: [generatePrice("usd", 1999 * 2, SubscriptionBillingPeriod.ONCE), generatePrice("mxn", 4999 * 2, SubscriptionBillingPeriod.ONCE)],
    usageBasedPrices: [],
  },
];

export const fakePrices = {
  FLAT_RATE_PRICES,
  PER_SEAT_PRICES,
  USAGE_BASED_PRICES,
  FLAT_RATE_PLUS_USAGE_BASED_PRICES,
  ONE_TIME_PRICES,
};
