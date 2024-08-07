import EventsService from "~/modules/events/services/.server/EventsService";
import { OnboardingSessionWithDetails, setOnboardingSessionActions, updateOnboardingSession } from "../db/onboardingSessions.db.server";
import { updateOnboardingSessionStep } from "../db/onboardingSessionSteps.db.server";
import { OnboardingSessionActionDto } from "../dtos/OnboardingSessionActionDto";
import { OnboardingCompletedDto } from "~/modules/events/dtos/OnboardingCompletedDto";
import { OnboardingStartedDto } from "~/modules/events/dtos/OnboardingStartedDto";
import { OnboardingDismissedDto } from "~/modules/events/dtos/OnboardingDismissedDto";

async function started({ request, session }: { request: Request; session: OnboardingSessionWithDetails }) {
  if (!session.startedAt) {
    await updateOnboardingSession(session.id, {
      status: "started",
      startedAt: new Date(),
    });
    await EventsService.create({
      request,
      event: "onboarding.started",
      tenantId: session.tenantId,
      userId: session.userId,
      data: {
        session: { id: session.id },
        onboarding: { title: session.onboarding.title },
        user: { id: session.userId, email: session.user.email },
      } satisfies OnboardingStartedDto,
    });
  }
}

async function dismissed({ request, session }: { request: Request; session: OnboardingSessionWithDetails }) {
  if (!session.dismissedAt) {
    await updateOnboardingSession(session.id, {
      status: "dismissed",
      dismissedAt: new Date(),
    });
    await EventsService.create({
      request,
      event: "onboarding.dismissed",
      tenantId: session.tenantId,
      userId: session.userId,
      data: {
        session: { id: session.id },
        onboarding: { title: session.onboarding.title },
        user: { id: session.userId, email: session.user.email },
      } satisfies OnboardingDismissedDto,
    });
  }
}

async function setStep(session: OnboardingSessionWithDetails, data: { fromIdx: number; toIdx: number; actions: OnboardingSessionActionDto[] }) {
  const fromStep = session.sessionSteps[data.fromIdx];
  const toStep = session.sessionSteps[data.toIdx];
  if (!fromStep.completedAt) {
    await updateOnboardingSessionStep(fromStep.id, {
      completedAt: new Date(),
    });
  }
  if (!toStep.seenAt) {
    await updateOnboardingSessionStep(toStep.id, {
      seenAt: new Date(),
    });
  }
  await setActions(session, data.actions);
}

async function addActions(session: OnboardingSessionWithDetails, data: { actions: OnboardingSessionActionDto[] }) {
  await setActions(session, data.actions);
}

async function setActions(session: OnboardingSessionWithDetails, actions: OnboardingSessionActionDto[]) {
  const newActions: OnboardingSessionActionDto[] = [
    ...session.actions
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      .map((f) => {
        return {
          type: f.type as "click" | "input",
          name: f.name,
          value: f.value,
        };
      }),
  ];
  actions.forEach((action) => {
    if (action.type === "input") {
      const idx = newActions.findIndex((f) => f.type === "input" && f.name === action.name);
      if (idx >= 0) {
        newActions[idx] = action;
      } else {
        newActions.push(action);
      }
    } else {
      newActions.push(action);
    }
  });
  const startDate = new Date();
  newActions.forEach((newAction, idx) => {
    try {
      // add one second to each action to avoid duplicate keys
      newAction.createdAt = new Date(startDate.getTime() + (idx + 1) * 1000);
    } catch (e: any) {
      //
    }
  });
  if (newActions.length > 0) {
    await setOnboardingSessionActions(session.id, { actions: newActions });
  }
}

async function complete({
  request,
  session,
  data,
}: {
  request: Request;
  session: OnboardingSessionWithDetails;
  data: { fromIdx: number; actions: OnboardingSessionActionDto[] };
}) {
  const fromStep = session.sessionSteps[data.fromIdx];
  if (!fromStep.completedAt) {
    await updateOnboardingSessionStep(fromStep.id, {
      completedAt: new Date(),
    });
  }

  await setActions(session, data.actions);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!session.completedAt) {
    await updateOnboardingSession(session.id, {
      status: "completed",
      completedAt: new Date(),
    });

    await EventsService.create({
      request,
      event: "onboarding.completed",
      tenantId: session.tenantId,
      userId: session.userId,
      data: {
        session: { id: session.id },
        onboarding: { title: session.onboarding.title },
        user: { id: session.userId, email: session.user.email },
      } satisfies OnboardingCompletedDto,
    });
  }
}

export default {
  started,
  dismissed,
  setStep,
  complete,
  addActions,
};
