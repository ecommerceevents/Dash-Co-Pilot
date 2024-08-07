import { FeatureFlagWithDetails, getFeatureFlag, getFeatureFlags } from "../db/featureFlags.db.server";
import FeatureFlagsFiltersService from "./FeatureFlagsFiltersService";
import { Params } from "@remix-run/react";
import { FeatureFlagsFilterType } from "../dtos/FeatureFlagsFilterTypes";
import { cachified } from "~/utils/cache.server";

async function getCurrentFeatureFlags({ request, params, userAnalyticsId }: { request: Request; params: Params; userAnalyticsId?: string }): Promise<string[]> {
  let forcedFlags: string[] = [];
  // To force a flag to be enabled
  if (process.env.NODE_ENV === "development") {
    const searchParams = new URL(request.url).searchParams;
    forcedFlags = searchParams.getAll("debugFlag");
  }

  const allFlags = await cachified({
    key: "featureFlags:enabled",
    ttl: 60 * 60,
    getFreshValue: async () => getFeatureFlags({ enabled: true, forcedFlags }),
  });

  const matchedFlagsPromises = allFlags.map(async (flag) => {
    if (await didAllFiltersMatched({ flag, request, params, userAnalyticsId })) {
      return flag;
    }
  });

  const matchedFlags = (await Promise.all(matchedFlagsPromises)).filter(Boolean);

  return matchedFlags.filter((f) => f !== null).map((flag) => flag!.name ?? "");
}

async function hasFeatureFlag({ request, params, flagName }: { request: Request; params: Params; flagName: FeatureFlagsFilterType }): Promise<boolean> {
  const flag = await getFeatureFlag({ name: flagName, enabled: true });
  if (!flag) {
    return false;
  }

  return await didAllFiltersMatched({ flag, request, params });
}

async function getFeatureFlagAction({ request, params, flagName }: { request: Request; params: Params; flagName: string }) {
  const flag = await getFeatureFlag({ name: flagName, enabled: true });
  if (!flag) {
    return null;
  }

  const matchedFilters = await filtersMatched({ flag, request, params });
  if (matchedFilters.length === 0) {
    return null;
  }

  const filter = matchedFilters[0];
  // eslint-disable-next-line no-console
  console.log("[FilterFlagsService] Filter matches", { filter: filter.type, value: filter.value, matches: true, action: filter.action });

  return filter.action;
}

async function didAllFiltersMatched({
  flag,
  request,
  params,
  userAnalyticsId,
}: {
  flag: FeatureFlagWithDetails;
  request: Request;
  params: Params;
  userAnalyticsId?: string;
}) {
  // To force a flag to be enabled
  if (process.env.NODE_ENV === "development") {
    const searchParams = new URL(request.url).searchParams;
    const debugFlags = searchParams.getAll("debugFlag");
    if (debugFlags.includes(flag.name)) {
      return true;
    }
  }

  const matchedFilters = await filtersMatched({ flag, request, params, userAnalyticsId });
  if (flag.filters.length === matchedFilters.length) {
    return true;
  }
  return false;
}

async function filtersMatched({
  flag,
  request,
  params,
  userAnalyticsId,
}: {
  flag: FeatureFlagWithDetails;
  request: Request;
  params: Params;
  userAnalyticsId?: string;
}): Promise<{ type: string; value: string | null; action: string | null }[]> {
  const matched: { type: string; value: string | null; action: string | null }[] = [];
  for (const filter of flag.filters) {
    const filterMatches = await FeatureFlagsFiltersService.matches({ request, params, userAnalyticsId, filter });
    if (filterMatches) {
      matched.push({ type: filter.type, value: filter.value, action: filter.action });
    }
  }
  return matched;
}

export default {
  getCurrentFeatureFlags,
  hasFeatureFlag,
  getFeatureFlagAction,
};
