import { useEffect, useState } from "react";
import { saasrockOnboardingStepBlocks } from "~/modules/onboarding/blocks/defaultOnboarding/saasrockOnboarding";
import OnboardingBlock from "~/modules/onboarding/blocks/OnboardingBlock";
import { OnboardingBlockDto } from "~/modules/onboarding/blocks/OnboardingBlockUtils";
import ButtonPrimary from "../buttons/ButtonPrimary";

export default function DocOnboardingDemo() {
  const [open, setOpen] = useState(false);
  const [onboardingBlock, setOnboardingBlock] = useState<OnboardingBlockDto>();

  useEffect(() => {
    setOnboardingBlock({
      style: "modal",
      title: "Onboarding Demo",
      canBeDismissed: true,
      steps: saasrockOnboardingStepBlocks,
      height: "lg",
    });
  }, []);
  return (
    <div>
      <ButtonPrimary onClick={() => setOpen(true)}>Open Onboarding Demo</ButtonPrimary>
      {onboardingBlock && <OnboardingBlock open={open} onClose={() => setOpen(false)} item={onboardingBlock} />}
      {/* <OnboardingBlockForm item={onboardingBlock} onUpdate={onUpdateOnboardingBlock} /> */}
    </div>
  );
}
