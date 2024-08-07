import { TFunction } from "i18next";
import { json } from "@remix-run/node";
import { OnboardingBlockDto } from "../blocks/OnboardingBlockUtils";
import { OnboardingWithDetails, updateOnboarding } from "../db/onboarding.db.server";
import { deleteOnboardingSessions } from "../db/onboardingSessions.db.server";

async function setSteps({ item, form, t }: { item: OnboardingWithDetails; form: FormData; t: TFunction }) {
  const block: OnboardingBlockDto = JSON.parse(form.get("block")?.toString() ?? "{}");
  if (!block) {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
  await updateOnboarding(item.id, {
    type: block.style as "modal" | "page",
    height: block.height,
    canBeDismissed: block.canBeDismissed,
    steps: block.steps.map((f, idx) => {
      return { order: idx + 1, block: JSON.stringify(f) };
    }),
  });
  await deleteOnboardingSessions(item.id);
}
export default {
  setSteps,
};
