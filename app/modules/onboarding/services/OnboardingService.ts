import { OnboardingFilter, OnboardingSession } from "@prisma/client";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { adminGetAllTenants, getAllTenantUsers } from "~/utils/db/tenants.db.server";
import { adminGetAllUsers, UserSimple } from "~/utils/db/users.db.server";
import { createOnboardingSession, getOnboarding, getOnboardings, OnboardingWithDetails, updateOnboarding } from "../db/onboarding.db.server";
import { getOnboardingSession, getOnboardingSessionsByUser, OnboardingSessionWithDetails } from "../db/onboardingSessions.db.server";
import { OnboardingCandidateDto } from "../dtos/OnboardingCandidateDto";
import { OnboardingFilterMetadataDto } from "../dtos/OnboardingFilterMetadataDto";
import { OnboardingFilterType } from "../dtos/OnboardingFilterTypes";
import OnboardingFiltersService from "./OnboardingFiltersService";
import OnboardingSessionService from "./OnboardingSessionService";

async function getUserActiveOnboarding({
  userId,
  tenantId,
  request,
}: {
  userId: string;
  tenantId: string | null;
  request: Request;
}): Promise<OnboardingSessionWithDetails | null> {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.onboarding.enabled) {
    return null;
  }
  let currentSession: OnboardingSessionWithDetails | null = null;

  const allUserOnboardings = await getOnboardingSessionsByUser({ userId, tenantId });
  const activeOnboardings = allUserOnboardings.filter((f) => f.status === "active" || f.status === "started");
  // If there is an active onboarding, return it
  if (activeOnboardings.length > 0) {
    currentSession = activeOnboardings[0];
    if (currentSession.status === "active") {
      await OnboardingSessionService.started({ session: currentSession, request });
    }
  }
  // If there is no active onboarding, check if this user belongs to an active onboarding
  else {
    const onboardingSessions = await generateMatchingOnboardings({ userId, tenantId });
    await Promise.all(
      onboardingSessions.map(async (session) => {
        if (!currentSession && (session?.status === "active" || session?.status === "started")) {
          currentSession = await getOnboardingSession(session.id);
          if (currentSession && currentSession.status === "active") {
            await OnboardingSessionService.started({ session: currentSession, request });
          }
        }
      })
    );
  }

  if (!currentSession?.onboarding.active) {
    return null;
  }
  return currentSession;
}

async function generateMatchingOnboardings({ userId, tenantId }: { userId: string; tenantId: string | null }): Promise<(OnboardingSession | undefined)[]> {
  const allOnboardings = await getOnboardings({
    realtime: true,
    active: true,
  });
  return await Promise.all(
    allOnboardings.map(async (onboarding) => {
      const existingSession = onboarding.sessions.find((f) => f.userId === userId);
      if (existingSession) {
        return;
      }
      if (onboarding.filters.length === 0) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId, tenantId, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        return await createOnboardingSession(onboarding, {
          userId,
          tenantId,
          status: "active",
          matchingFilters,
          createdRealtime: true,
        });
      }
    })
  );
}

async function getMatchingFilters({
  userId,
  tenantId,
  filters,
}: {
  userId: string;
  tenantId: string | null;
  filters: OnboardingFilter[];
}): Promise<OnboardingFilter[]> {
  const matchedFilters: OnboardingFilter[] = [];
  await Promise.all(
    filters.map(async (filter) => {
      if (await OnboardingFiltersService.matches({ userId, tenantId, filter })) {
        matchedFilters.push(filter);
      }
    })
  );
  return matchedFilters;
}

async function setOnboardingStatus(id: string, active: boolean): Promise<void> {
  const onboarding = await getOnboarding(id);
  if (!onboarding || onboarding.active === active) {
    return;
  }
  await updateOnboarding(id, { active });
  // await updateOnboardingSessions(
  //   onboarding.sessions.map((m) => m.id),
  //   { status: "active" }
  // );
}

async function getCandidates(onboarding: OnboardingWithDetails): Promise<OnboardingCandidateDto[]> {
  if (onboarding.filters.length === 0) {
    return [];
  }
  const candidates: OnboardingCandidateDto[] = [];
  const allUsers = await adminGetAllUsers();
  const allTenantUsers = await getAllTenantUsers();
  const allTenants = await adminGetAllTenants();
  await Promise.all(
    allUsers.items.map(async (user) => {
      if (!user.admin) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId: user.id, tenantId: null, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        candidates.push({
          user: user as UserSimple,
          tenant: null,
          matchingFilters: matchingFilters.map((m) => {
            return {
              type: m.type as OnboardingFilterType,
              value: m.value,
            };
          }),
        });
      }
    })
  );

  await Promise.all(
    allTenantUsers.map(async (tenantUser) => {
      const tenant = allTenants.find((f) => f.id === tenantUser.tenantId);
      if (!tenant) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId: tenantUser.userId, tenantId: tenantUser.tenantId, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        candidates.push({
          user: tenantUser.user as UserSimple,
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          matchingFilters: matchingFilters.map((m) => {
            return {
              type: m.type as OnboardingFilterType,
              value: m.value,
            };
          }),
        });
      }
    })
  );

  return candidates.sort((a, b) => {
    if (a.tenant && !b.tenant) {
      return 1;
    }
    if (!a.tenant && b.tenant) {
      return -1;
    }
    if (a.tenant && b.tenant) {
      return a.tenant.name.localeCompare(b.tenant.name);
    }
    return a.user.email.localeCompare(b.user.email);
  });
}

async function getMetadata(): Promise<OnboardingFilterMetadataDto> {
  return {
    users: (await adminGetAllUsers()).items,
    tenants: await adminGetAllTenants(),
    entities: await getAllEntities({ tenantId: null }),
    subscriptionProducts: await getAllSubscriptionProducts(),
    roles: await getAllRoles(),
  };
}

export type OnboardingSummaryDto = {
  onboardings: { all: number; active: number };
  sessions: { all: number; active: number; dismissed: number; completed: number };
};
async function getSummary(): Promise<OnboardingSummaryDto> {
  const allOnboardings = await getOnboardings({});
  const summary: OnboardingSummaryDto = {
    onboardings: { all: 0, active: 0 },
    sessions: { all: 0, active: 0, dismissed: 0, completed: 0 },
  };
  allOnboardings.forEach((onboarding) => {
    summary.onboardings.all++;
    if (onboarding.active) {
      summary.onboardings.active++;
    }
    onboarding.sessions.forEach((session) => {
      summary.sessions.all++;
      if (session.status === "active" || session.status === "started") {
        summary.sessions.active++;
      } else if (session.status === "completed") {
        summary.sessions.completed++;
      } else if (session.status === "dismissed") {
        summary.sessions.dismissed++;
      }
    });
  });
  return summary;
}

export default {
  getUserActiveOnboarding,
  getMatchingFilters,
  setOnboardingStatus,
  getCandidates,
  getMetadata,
  getSummary,
};
