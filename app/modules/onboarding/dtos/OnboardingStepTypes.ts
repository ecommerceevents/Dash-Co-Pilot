export const OnboardingStepTypes = ["text", "gallery", "form"] as const;
export type OnboardingStepType = (typeof OnboardingStepTypes)[number];
