export interface OnboardingSessionActionDto {
  type: "click" | "input";
  name: string;
  value: string;
  createdAt?: Date;
}
