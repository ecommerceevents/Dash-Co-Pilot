import { vi, describe, it, expect } from "vitest";
import SubscriptionUtils from "./SubscriptionUtils";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { Prisma } from "@prisma/client";
import DateUtils from "../shared/DateUtils";

describe("getProductTitle", () => {
  const t = vi.fn().mockImplementation((v: string) => v) as any;
  const item = {
    subscriptionProduct: { title: "Product 1" },
    prices: [{ subscriptionPrice: { price: new Prisma.Decimal(10), billingPeriod: SubscriptionBillingPeriod.MONTHLY } }],
    endsAt: new Date(),
  } as unknown as any;

  it("returns expected product title", () => {
    const expectedTitle = "Product 1 $10.00 - pricing.MONTHLY (ends 1 day ago)";

    DateUtils.dateAgo = vi.fn().mockImplementation(() => "1 day ago");
    const title = SubscriptionUtils.getProductTitle({ t, item });
    expect(title).toEqual(expectedTitle);
  });
});

describe("getPriceDescription", () => {
  const t = vi.fn().mockImplementation((v: string) => v) as any;
  const item = {
    subscriptionProduct: { title: "Product 1" },
    price: new Prisma.Decimal(10),
    billingPeriod: SubscriptionBillingPeriod.MONTHLY,
  } as unknown as any;

  it("returns expected price description", () => {
    const expectedDescription = "Product 1 - $10.00 - pricing.MONTHLY";
    // @ts-ignore
    const description = SubscriptionUtils.getPriceDescription(t, item);
    expect(description).toEqual(expectedDescription);
  });
});

describe("getBillingPeriodDescription", () => {
  const billingPeriod = SubscriptionBillingPeriod.MONTHLY;

  it("returns expected billing period description", () => {
    const expectedDescription = "pricing.MONTHLY";
    const t = vi.fn().mockImplementation((v: string) => v) as any;
    const description = SubscriptionUtils.getBillingPeriodDescription(t, billingPeriod);
    expect(description).toEqual(expectedDescription);
  });
});
