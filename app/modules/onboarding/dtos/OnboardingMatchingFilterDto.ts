import { OnboardingSessionFilterMatch, OnboardingFilter } from "@prisma/client";

export type OnboardingMatchingFilterDto = OnboardingSessionFilterMatch & {
  onboardingFilter: OnboardingFilter;
};
