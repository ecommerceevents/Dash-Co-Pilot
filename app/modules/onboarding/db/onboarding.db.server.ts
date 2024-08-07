import { Onboarding, OnboardingFilter, OnboardingStep, OnboardingSession, Prisma } from "@prisma/client";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { OnboardingFilterType } from "../dtos/OnboardingFilterTypes";
import { OnboardingSessionStatus } from "../dtos/OnboardingSessionStatus";

export type OnboardingWithDetails = Onboarding & {
  filters: OnboardingFilter[];
  steps: OnboardingStep[];
  sessions: OnboardingSession[];
};

export async function getOnboardings({ active, realtime }: { active?: boolean; realtime?: boolean }): Promise<OnboardingWithDetails[]> {
  return await db.onboarding.findMany({
    where: { active, realtime },
    include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOnboardingsWithPagination({
  where,
  pagination,
}: {
  where?: Prisma.OnboardingWhereInput;
  pagination: { page: number; pageSize: number };
}): Promise<{ items: OnboardingWithDetails[]; pagination: PaginationDto }> {
  const items = await db.onboarding.findMany({
    where,
    take: pagination.pageSize,
    skip: (pagination.page - 1) * pagination.pageSize,
    include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
    orderBy: { createdAt: "desc" },
  });
  const totalItems = await db.onboarding.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function getOnboarding(id: string): Promise<OnboardingWithDetails | null> {
  return await db.onboarding.findUnique({
    where: { id },
    include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
  });
}

export async function createOnboarding(data: {
  title: string;
  type: "modal" | "page";
  active: boolean;
  realtime: boolean;
  canBeDismissed: boolean;
  height: string;
  filters: { type: OnboardingFilterType; value: string | null }[];
  steps: { order: number; block: string }[];
}): Promise<Onboarding> {
  return await db.onboarding.create({
    data: {
      title: data.title,
      type: data.type.toString(),
      active: data.active,
      realtime: data.realtime,
      canBeDismissed: data.canBeDismissed,
      height: data.height,
      filters: { create: data.filters },
      steps: { create: data.steps },
    },
  });
}

export async function updateOnboarding(
  id: string,
  data: {
    title?: string;
    type?: "modal" | "page";
    realtime?: boolean;
    active?: boolean;
    canBeDismissed?: boolean;
    height?: string;
    filters?: {
      type: OnboardingFilterType;
      value: string | null;
    }[];
    steps?: { order: number; block: string }[];
  }
): Promise<Onboarding> {
  const update: Prisma.OnboardingUpdateInput = {
    title: data.title,
    type: data.type?.toString(),
    realtime: data.realtime,
    active: data.active,
    canBeDismissed: data.canBeDismissed,
    height: data.height,
  };
  if (data.filters) {
    update.filters = {
      deleteMany: {},
      create: data.filters,
    };
  }
  if (data.steps) {
    update.steps = {
      deleteMany: {},
      create: data.steps,
    };
  }
  return await db.onboarding.update({
    where: { id },
    data: update,
  });
}

export async function setOnboardingManualSessions(
  id: string,
  data: { userId: string; tenantId: string | null; status: OnboardingSessionStatus }[]
): Promise<Onboarding> {
  const update: Prisma.OnboardingUpdateInput = {
    sessions: {
      deleteMany: {},
      create: data,
    },
  };
  return await db.onboarding.update({
    where: { id },
    data: update,
  });
}

export async function createOnboardingSession(
  onboarding: OnboardingWithDetails,
  session: { userId: string; tenantId: string | null; status: OnboardingSessionStatus; matchingFilters: OnboardingFilter[]; createdRealtime: boolean }
) {
  return await db.onboardingSession.create({
    data: {
      onboardingId: onboarding.id,
      userId: session.userId,
      tenantId: session.tenantId,
      status: session.status,
      createdRealtime: session.createdRealtime,
      sessionSteps: {
        create: onboarding.steps.map((step) => ({
          stepId: step.id,
        })),
      },
      matches: {
        create: session.matchingFilters.map((filter) => ({
          onboardingFilterId: filter.id,
        })),
      },
    },
  });
}

export async function deleteOnboarding(id: string): Promise<Onboarding> {
  return await db.onboarding.delete({
    where: { id },
  });
}
