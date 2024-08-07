import { useTranslation } from "react-i18next";
import { OnboardingBlockDto } from "./OnboardingBlockUtils";

export default function OnboardingVariantPage({ item }: { item: OnboardingBlockDto }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  return <div>Onboarding VARIANT 2 BLOCK</div>;
}
