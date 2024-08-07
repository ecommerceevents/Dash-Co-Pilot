import { getPlanFeatureUsage } from "./.server/subscriptionService";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { cache } from "../cache.server";
import { TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";

const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;
const DEFAULT_RATE_LIMIT_PER_SECOND = 5;

function getCacheKey(apiKey: string, period: string, timestamp: number): string {
  return `rateLimit:${apiKey}:${period}:${timestamp}`;
}

export async function rateLimitByKey({
  apiKey,
  tenantSubscription,
  tenantId,
  limitByMinute,
  limitBySecond,
}: {
  apiKey: string;
  tenantSubscription: TenantSubscriptionWithDetails | null;
  tenantId: string;
  limitByMinute?: number;
  limitBySecond?: number;
}): Promise<{
  success: boolean;
  error: string | null;
}> {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const minuteTimestamp = Math.floor(currentTimestamp / 60);
  const secondTimestamp = currentTimestamp;

  const minuteKey = getCacheKey(apiKey, "minute", minuteTimestamp);
  const secondKey = getCacheKey(apiKey, "second", secondTimestamp);

  let minuteCount = (cache.get(minuteKey)?.value as number) || 0;
  let secondCount = (cache.get(secondKey)?.value as number) || 0;

  if (limitByMinute === undefined) {
    const feature = await getPlanFeatureUsage(tenantId, DefaultFeatures.RateLimitPerMinute, tenantSubscription);
    if (!feature) {
      limitByMinute = DEFAULT_RATE_LIMIT_PER_MINUTE;
    } else if (feature.type === SubscriptionFeatureLimitType.UNLIMITED) {
      limitByMinute = 0;
    } else {
      limitByMinute = feature.value;
    }
    let resettingIn = 60 - (currentTimestamp % 60);
    // eslint-disable-next-line no-console
    console.log("rateLimit.byMinute", `${minuteCount}/${limitByMinute} req/min, resetting in ${resettingIn} seconds`);
  }

  if (limitBySecond === undefined) {
    const feature = await getPlanFeatureUsage(tenantId, DefaultFeatures.RateLimitPerSecond, tenantSubscription);
    if (!feature) {
      limitBySecond = DEFAULT_RATE_LIMIT_PER_SECOND;
    } else if (feature.type === SubscriptionFeatureLimitType.UNLIMITED) {
      limitBySecond = 0;
    } else {
      limitBySecond = feature.value;
    }
    // eslint-disable-next-line no-console
    console.log("rateLimit.bySecond", `${secondCount}/${limitBySecond} req/sec`);
  }

  minuteCount += 1;
  secondCount += 1;

  if (limitByMinute !== 0 && minuteCount > limitByMinute) {
    let tryAgainIn = 60 - (currentTimestamp % 60);
    return { success: false, error: `You've exceeded the ${limitByMinute} request/min rate limit, try again in ${tryAgainIn} seconds` };
  }

  if (limitBySecond !== 0 && secondCount > limitBySecond) {
    return { success: false, error: `You've exceeded the ${limitBySecond} request/sec rate limit` };
  }

  cache.set(minuteKey, { value: minuteCount, metadata: { createdTime: Date.now() } }, { ttl: 60 * 1000 });
  cache.set(secondKey, { value: secondCount, metadata: { createdTime: Date.now() } }, { ttl: 1000 });

  return { success: true, error: null };
}
