import { db } from "~/utils/db.server";
import { FeatureFlagsFilterType } from "../dtos/FeatureFlagsFilterTypes";
import { AnalyticsEvent, FeatureFlag, FeatureFlagFilter } from "@prisma/client";
import { clearCacheKey } from "~/utils/cache.server";

export type FeatureFlagWithDetails = FeatureFlag & {
  filters: FeatureFlagFilter[];
};

export type FeatureFlagWithEvents = FeatureFlagWithDetails & {
  events: AnalyticsEvent[];
};

export async function getFeatureFlag(where: { name?: string; id?: string; description?: string; enabled?: boolean | undefined }) {
  return db.featureFlag.findFirst({
    where,
    include: {
      filters: true,
    },
  });
}

export async function getAllFeatureFlags(): Promise<FeatureFlagWithDetails[]> {
  return db.featureFlag.findMany({
    include: {
      filters: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFeatureFlags(where: { enabled?: boolean | undefined; forcedFlags?: string[] }): Promise<FeatureFlagWithDetails[]> {
  return db.featureFlag.findMany({
    where: {
      OR: [{ enabled: where.enabled }, { name: { in: where.forcedFlags ?? [] } }],
    },
    include: {
      filters: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFeatureFlagsWithEvents(where: { enabled: boolean | undefined }): Promise<FeatureFlagWithEvents[]> {
  return db.featureFlag.findMany({
    where: {
      enabled: where.enabled,
    },
    include: {
      filters: true,
      events: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createFeatureFlag(data: {
  name: string;
  description: string;
  enabled: boolean;
  filters: {
    type: FeatureFlagsFilterType;
    value: string | null;
    action?: string | null;
  }[];
}) {
  return await db.featureFlag
    .create({
      data: {
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        filters: {
          create: data.filters.map((f) => ({
            type: f.type.toString(),
            value: f.value ?? null,
            action: f.action ?? null,
          })),
        },
      },
    })
    .then((item) => {
      clearCacheKey(`featureFlags:enabled`);
      return item;
    });
}

export async function updateFeatureFlag(
  id: string,
  {
    name,
    description,
    filters,
    enabled,
  }: {
    name?: string;
    description?: string;
    filters?: { type: FeatureFlagsFilterType; value: string | null; action?: string | null }[];
    enabled?: boolean;
  }
) {
  return await db.featureFlag
    .update({
      where: { id },
      data: {
        name,
        description,
        enabled,
        filters: !filters
          ? undefined
          : {
              deleteMany: {},
              create: filters.map((f) => ({
                type: f.type.toString(),
                value: f.value ?? null,
                action: f.action ?? null,
              })),
            },
      },
    })
    .then((flag) => {
      clearCacheKey(`featureFlags:enabled`);
      return flag;
    });
}

export async function deleteFeatureFlag(id: string) {
  return await db.featureFlag
    .delete({
      where: { id },
    })
    .then((item) => {
      clearCacheKey(`featureFlags:enabled`);
      return item;
    });
}
