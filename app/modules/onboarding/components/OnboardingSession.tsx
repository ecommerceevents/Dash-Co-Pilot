import { useEffect, useState } from "react";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import OnboardingBlock from "../blocks/OnboardingBlock";
import { OnboardingBlockDto, OnboardingBlockStyle, OnboardingHeightDto, OnboardingStepBlockDto } from "../blocks/OnboardingBlockUtils";

export default function OnboardingSession({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const appOrAdminData = useAppOrAdminData();
  const [onboardingBlock, setOnboardingBlock] = useState<OnboardingBlockDto>();

  useEffect(() => {
    if (appOrAdminData.onboardingSession && !onboardingBlock) {
      const onboarding = appOrAdminData.onboardingSession.onboarding;
      setOnboardingBlock({
        style: onboarding.type as OnboardingBlockStyle,
        title: onboarding.title,
        canBeDismissed: onboarding.canBeDismissed,
        height: (onboarding.height ?? "md") as OnboardingHeightDto,
        steps: appOrAdminData.onboardingSession.sessionSteps.map((f) => {
          const block = JSON.parse(f.step.block) as OnboardingStepBlockDto;
          block.completedAt = f.completedAt;
          return block;
        }),
      });
      if (onboarding.type === "modal") {
        setOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOrAdminData.onboardingSession]);
  return (
    <>{onboardingBlock && <OnboardingBlock session={appOrAdminData.onboardingSession} item={onboardingBlock} open={open} onClose={() => setOpen(false)} />}</>
  );
}
