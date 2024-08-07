export type OnboardingDismissedDto = {
  session: { id: string };
  onboarding: { title: string };
  user: { id: string; email: string };
};
