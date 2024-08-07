import {
  Onboarding,
  OnboardingFilter,
  OnboardingSession,
  OnboardingSessionAction,
  OnboardingSessionFilterMatch,
  OnboardingSessionStep,
  OnboardingStep,
  Prisma,
  Tenant,
} from "@prisma/client";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import { UserSimple } from "~/utils/db/users.db.server";
import { OnboardingSessionActionDto } from "../dtos/OnboardingSessionActionDto";
import { OnboardingSessionStatus } from "../dtos/OnboardingSessionStatus";

export type OnboardingSessionWithDetails = OnboardingSession & {
  onboarding: Onboarding;
  user: UserSimple;
  tenant: Tenant | null;
  sessionSteps: (OnboardingSessionStep & {
    step: OnboardingStep;
  })[];
  actions: OnboardingSessionAction[];
  matches: (OnboardingSessionFilterMatch & { onboardingFilter: OnboardingFilter })[];
};

export async function getOnboardingSessions({
  onboardingId,
  userId,
  tenantId,
  status,
  hasBeenStarted,
  hasBeenCompleted,
  hasBeenDismissed,
}: {
  onboardingId?: string;
  userId?: string;
  tenantId?: string | null;
  status?: OnboardingSessionStatus;
  hasBeenStarted?: boolean;
  hasBeenCompleted?: boolean;
  hasBeenDismissed?: boolean;
}): Promise<OnboardingSessionWithDetails[]> {
  const where: Prisma.OnboardingSessionWhereInput = {
    onboardingId,
    userId,
    tenantId,
    status: status ? status.toString() : undefined,
  };
  if (hasBeenStarted !== undefined) {
    where.startedAt = hasBeenStarted ? { not: null } : null;
  }
  if (hasBeenCompleted !== undefined) {
    where.completedAt = hasBeenCompleted ? { not: null } : null;
  }
  if (hasBeenDismissed !== undefined) {
    where.dismissedAt = hasBeenDismissed ? { not: null } : null;
  }
  return await db.onboardingSession.findMany({
    where,
    include: {
      onboarding: true,
      user: true,
      tenant: true,
      sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
      actions: true,
      matches: { include: { onboardingFilter: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOnboardingSessionsWithPagination({
  where,
  pagination,
}: {
  where?: Prisma.OnboardingSessionWhereInput;
  pagination: { page: number; pageSize: number };
}): Promise<{ items: OnboardingSessionWithDetails[]; pagination: PaginationDto }> {
  const items = await db.onboardingSession.findMany({
    where,
    take: pagination.pageSize,
    skip: (pagination.page - 1) * pagination.pageSize,
    include: {
      onboarding: true,
      user: true,
      tenant: true,
      sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
      actions: true,
      matches: { include: { onboardingFilter: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const totalItems = await db.onboardingSession.count({
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

export async function getOnboardingSession(id: string): Promise<OnboardingSessionWithDetails | null> {
  return await db.onboardingSession.findUnique({
    where: { id },
    include: {
      onboarding: true,
      user: true,
      tenant: true,
      sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
      actions: true,
      matches: { include: { onboardingFilter: true } },
    },
  });
}

export async function getOnboardingSessionsByUser({
  userId,
  tenantId,
  status,
}: {
  userId: string;
  tenantId: string | null;
  status?: OnboardingSessionStatus;
}): Promise<OnboardingSessionWithDetails[]> {
  return await db.onboardingSession.findMany({
    where: { userId, tenantId, status },
    include: {
      onboarding: true,
      user: true,
      tenant: true,
      sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
      actions: true,
      matches: { include: { onboardingFilter: true } },
    },
    orderBy: { onboarding: { createdAt: "asc" } },
  });
}

export async function updateOnboardingSession(
  id: string,
  data: { status?: OnboardingSessionStatus; startedAt?: Date; completedAt?: Date; dismissedAt?: Date }
) {
  return await db.onboardingSession.update({
    where: { id },
    data,
  });
}

export async function setOnboardingSessionActions(id: string, data: { actions: OnboardingSessionActionDto[] }) {
  await db.onboardingSessionAction.deleteMany({
    where: { onboardingSessionId: id },
  });
  return await db.onboardingSessionAction.createMany({
    data: data.actions.map((action) => ({
      onboardingSessionId: id,
      type: action.type.toString(),
      name: action.name,
      value: action.value,
      createdAt: action.createdAt,
    })),
  });
}

export async function updateOnboardingSessions(ids: string[], data: { status?: OnboardingSessionStatus }) {
  return await db.onboardingSession.updateMany({
    where: { id: { in: ids } },
    data,
  });
}

export async function deleteOnboardingSession(id: string) {
  return await db.onboardingSession.delete({
    where: { id },
  });
}

export async function deleteOnboardingSessions(onboardingId: string) {
  return await db.onboardingSession.deleteMany({
    where: { onboardingId },
  });
}

export async function groupOnboardingSessionsByUser() {
  return await db.onboardingSession.groupBy({
    by: ["userId"],
    _count: {
      _all: true,
    },
  });
}
