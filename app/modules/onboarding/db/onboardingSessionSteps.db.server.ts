import { db } from "~/utils/db.server";

export async function updateOnboardingSessionStep(id: string, data: { seenAt?: Date; completedAt?: Date }) {
  return await db.onboardingSessionStep.update({
    where: { id },
    data,
  });
}

export async function deleteOnboardingSessionSteps(ids: string[]) {
  return await db.onboardingSessionStep.deleteMany({
    where: { id: { in: ids } },
  });
}
