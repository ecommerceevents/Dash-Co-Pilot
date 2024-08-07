import { OnboardingFilterType } from "./OnboardingFilterTypes";

export interface OnboardingFilterDto {
  type: OnboardingFilterType;
  value: string | null;
}
