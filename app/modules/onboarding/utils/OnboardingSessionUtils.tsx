import { TFunction } from "i18next";
import { OnboardingSessionWithDetails } from "../db/onboardingSessions.db.server";
import { OnboardingFilterMetadataDto } from "../dtos/OnboardingFilterMetadataDto";
import OnboardingFilterUtils from "./OnboardingFilterUtils";
import OnboardingStepUtils from "./OnboardingStepUtils";

export type OnboardingSessionActivityDto = {
  type: "created-manually" | "created-realtime" | "started" | "click" | "input" | "seen" | "dismissed" | "completed" | "step-seen" | "step-completed";
  createdAt: Date | null;
  description: string;
};
function getActivity({ t, item, metadata }: { t: TFunction; item: OnboardingSessionWithDetails; metadata: OnboardingFilterMetadataDto }) {
  const items: OnboardingSessionActivityDto[] = [];
  const matchingFilters = OnboardingFilterUtils.getStepMatches({ t, matches: item.matches, metadata })
    .map((f) => f.filter + (f.value ? `: ${f.value}` : ""))
    .join(", ");
  if (item.createdRealtime) {
    items.push({
      type: "created-realtime",
      createdAt: item.createdAt,
      description: `${t("onboarding.filter.matching")}: ${matchingFilters}`,
    });
  } else {
    items.push({
      type: "created-manually",
      createdAt: item.createdAt,
      description: "Matching filters: " + OnboardingFilterUtils.getStepMatches({ t, matches: item.matches, metadata }),
    });
  }
  if (item.startedAt) {
    items.push({ type: "started", createdAt: item.startedAt, description: "Started" });
  }
  if (item.dismissedAt) {
    items.push({ type: "dismissed", createdAt: item.dismissedAt, description: "Dismissed" });
  }
  if (item.completedAt) {
    items.push({ type: "completed", createdAt: item.completedAt, description: "Completed" });
  }

  item.actions.forEach((action) => {
    items.push({ type: action.type as "click" | "input", createdAt: action.createdAt, description: "[" + action.name + "] " + action.value });
  });

  item.sessionSteps.forEach((step) => {
    const stepBlock = OnboardingStepUtils.parseStepToBlock(step.step);
    if (step.seenAt) {
      items.push({ type: "step-seen", createdAt: step.seenAt, description: `Step #${step.step.order} seen: ${stepBlock.title}` });
    }
    if (step.completedAt) {
      items.push({ type: "step-completed", createdAt: step.completedAt, description: `Step #${step.step.order} completed: ${stepBlock.title}` });
    }
  });

  return items.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt > a.createdAt ? 1 : -1;
    }
    return 1;
  });
}

export default {
  getActivity,
};
