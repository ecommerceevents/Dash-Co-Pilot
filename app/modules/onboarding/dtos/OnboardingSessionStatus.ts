export const OnboardingSessionStatuses = ["active", "started", "dismissed", "completed"] as const;
export type OnboardingSessionStatus = (typeof OnboardingSessionStatuses)[number];
