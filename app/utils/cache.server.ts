import { LRUCache } from "lru-cache";
import { cachified as originalCachified, CacheEntry, CachifiedOptions, verboseReporter } from "@epic-web/cachified";

const lru = new LRUCache<string, CacheEntry>({ max: 1000 });

// replace this with redisCacheAdapter(redis) if you need to: https://github.com/epicweb-dev/cachified#adapter-for-redis
export const cache = lru;

const CACHE_ENABLED = true;
const CACHE_LOGGING_ENABLED = false;

export async function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, "cache"> & {
    disabled?: boolean;
  }
): Promise<Value> {
  if (!CACHE_ENABLED || options.disabled) {
    // @ts-ignore
    return options.getFreshValue(options);
  }
  return originalCachified({
    ...options,
    cache,
    reporter: CACHE_LOGGING_ENABLED ? verboseReporter() : undefined,
  });
}

export function clearCacheKey(key: string): void {
  cache.delete(key);
}
