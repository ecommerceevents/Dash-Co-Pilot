import { TFunction } from "i18next";
import { SubscriptionPriceDto } from "~/application/dtos/subscriptions/SubscriptionPriceDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import billingPeriods from "~/application/pricing/billingPeriods";
import currencies from "~/application/pricing/currencies";

export function getUsageBasedUnitTitle(t: TFunction, name: string) {
  if (name === "api") {
    return t("models.apiCall.object");
  }
  return t(`models.${name}.object`);
}

export function getUsageBasedUnitTitlePlural(t: TFunction, name: string) {
  if (name === "api") {
    return t("models.apiCall.plural");
  }
  return t(`models.${name}.plural`);
}

export function getYearlyDiscount(prices: SubscriptionPriceDto[], currency: string) {
  const priceYearly = prices.find((f) => f.billingPeriod === SubscriptionBillingPeriod.YEARLY && Number(f.price) > 0 && f.currency === currency);
  const priceMonthly = prices.find((f) => f.billingPeriod === SubscriptionBillingPeriod.MONTHLY && Number(f.price) > 0 && f.currency === currency);
  if (priceYearly?.price && priceMonthly?.price) {
    const discount = 100 - (Number(priceYearly.price) * 100) / (Number(priceMonthly.price) * 12);
    if (discount !== 0) {
      return "-" + discount.toFixed(0) + "%";
    }
  }
  return undefined;
}

export function getSortedBillingPeriods(items: SubscriptionBillingPeriod[]) {
  const sorted: SubscriptionBillingPeriod[] = [];
  billingPeriods.forEach((billingPeriod) => {
    if (items.includes(billingPeriod.value) && !sorted.includes(billingPeriod.value)) {
      sorted.push(billingPeriod.value);
    }
  });
  return sorted;
}

export function getSortedCurrencies(items: string[]) {
  const sorted: string[] = [];
  currencies
    .filter((f) => !f.disabled)
    .forEach((currency) => {
      if (items.includes(currency.value) && !sorted.includes(currency.value)) {
        sorted.push(currency.value);
      }
    });
  return sorted;
}

export function getPossibleBillingPeriods(prices: SubscriptionPriceDto[]) {
  let periods = prices.filter((f) => f.price).flatMap((f) => f.billingPeriod);
  // remove duplicates
  periods = periods.filter((v, i, a) => a.indexOf(v) === i);
  return getSortedBillingPeriods(periods);
}

export function getPossibleCurrencies(prices: SubscriptionPriceDto[]) {
  let currencies = prices.filter((f) => f.price).flatMap((f) => f.currency);
  // remove duplicates
  currencies = currencies.filter((v, i, a) => a.indexOf(v) === i);
  return getSortedCurrencies(currencies);
}

export function getCurrenciesAndPeriods(prices: SubscriptionPriceDto[], defaultCurrency?: string, defaultBillingPeriod?: SubscriptionBillingPeriod) {
  if (!defaultCurrency) {
    defaultCurrency = currencies.find((f) => f.default)?.value ?? "usd";
  }
  if (!defaultBillingPeriod) {
    defaultBillingPeriod = billingPeriods.find((f) => f.default)?.value ?? SubscriptionBillingPeriod.MONTHLY;
  }

  const currencyState: { value: string; options: string[] } = { value: defaultCurrency, options: getPossibleCurrencies(prices) };
  if (!currencyState.options.includes(defaultCurrency) && currencyState.options.length > 0) {
    currencyState.value = currencyState.options[0];
  }
  const billingPeriodState: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] } = {
    value: defaultBillingPeriod,
    options: getPossibleBillingPeriods(prices).filter((f) => f !== SubscriptionBillingPeriod.ONCE),
  };
  if (!billingPeriodState.options.includes(defaultBillingPeriod) && billingPeriodState.options.length > 0) {
    billingPeriodState.value = billingPeriodState.options[0];
  }

  return {
    currencies: currencyState,
    billingPeriods: billingPeriodState,
  };
}

export function getBillingPeriodParams(billingPeriod: SubscriptionBillingPeriod) {
  switch (billingPeriod) {
    case SubscriptionBillingPeriod.ONCE:
      return "o";
    case SubscriptionBillingPeriod.DAILY:
      return "d";
    case SubscriptionBillingPeriod.WEEKLY:
      return "w";
    case SubscriptionBillingPeriod.MONTHLY:
      return "m";
    case SubscriptionBillingPeriod.YEARLY:
      return "y";
    case SubscriptionBillingPeriod.QUARTERLY:
      return "q";
    case SubscriptionBillingPeriod.SEMI_ANNUAL:
      return "s";
    default:
      return "m";
  }
}

// export function findDiscounts({
//   currency,
//   billingPeriods,
//   products,
// }: {
//   currency: string;
//   billingPeriods: SubscriptionBillingPeriod[];
//   products: SubscriptionProductDto[];
// }) {
//   const discounts: { billingPeriod: SubscriptionBillingPeriod; discount: number }[] = [];
//   // iterate each product and find discounts against the highest price
//   products.forEach((product) => {
//     const prices = product.prices.filter((f) => f.currency === currency && billingPeriods.includes(f.billingPeriod));
//     if (prices.length > 0) {
//       const highestPrice = prices.reduce((prev, current) => (prev.price > current.price ? prev : current));
//       console.log("[highestPrice]", highestPrice.price);
//       prices.forEach((price) => {
//         if (price.price < highestPrice.price) {
//           const discount = 100 - (Number(price.price) * 100) / Number(highestPrice.price);
//           if (discount !== 0) {
//             discounts.push({ billingPeriod: price.billingPeriod, discount });
//           }
//         }
//       });
//     }
//   });
//   return discounts;
// }

export function getDefaultCurrency(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  let defaultCurrency = currencies.find((f) => f.default)?.value ?? "";
  if (searchParams.get("c")) {
    defaultCurrency = searchParams.get("c")?.toString() ?? "";
  }
  return defaultCurrency;
}

export function getDefaultBillingPeriod(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  let defaultBillingPeriod = billingPeriods.find((f) => f.default)?.value ?? SubscriptionBillingPeriod.MONTHLY;
  if (searchParams.get("b")) {
    switch (searchParams.get("b")) {
      case "o":
        defaultBillingPeriod = SubscriptionBillingPeriod.ONCE;
        break;
      case "d":
        defaultBillingPeriod = SubscriptionBillingPeriod.DAILY;
        break;
      case "w":
        defaultBillingPeriod = SubscriptionBillingPeriod.WEEKLY;
        break;
      case "m":
        defaultBillingPeriod = SubscriptionBillingPeriod.MONTHLY;
        break;
      case "y":
        defaultBillingPeriod = SubscriptionBillingPeriod.YEARLY;
        break;
      case "q":
        defaultBillingPeriod = SubscriptionBillingPeriod.QUARTERLY;
        break;
      case "s":
        defaultBillingPeriod = SubscriptionBillingPeriod.SEMI_ANNUAL;
        break;
    }
  }
  return defaultBillingPeriod;
}

export function getFormattedPriceInCurrency({
  price,
  currency,
  decimals = 2,
  withSymbol = true,
}: {
  price: number;
  currency: string | undefined;
  decimals?: number;
  withSymbol?: boolean;
}) {
  let currencyDetails = currencies.find((c) => c.value.toLowerCase() === currency?.toLowerCase()) || currencies.find((c) => c.default);
  if (!currencyDetails) {
    // default
    currencyDetails = currencies.find((f) => f.default);
  }
  if (!currencyDetails) {
    return "Currency not supported: " + currency;
  }

  const formattedPrice = formatPrice(price, currencyDetails.thousandSeparator, currencyDetails.decimalSeparator, decimals);
  if (!withSymbol) {
    return formattedPrice;
  }
  return currencyDetails.symbolRight ? `${formattedPrice}${currencyDetails.symbol}` : `${currencyDetails.symbol}${formattedPrice}`;
}

function formatPrice(price: number, thousandSeparator: string = ",", decimalSeparator: string = ".", decimals: number = 2) {
  return price
    .toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .replace(/,/g, thousandSeparator)
    .replace(/\./g, decimalSeparator);
}
