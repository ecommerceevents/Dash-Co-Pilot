import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getOnboardingSession, OnboardingSessionWithDetails } from "~/modules/onboarding/db/onboardingSessions.db.server";
import { OnboardingSessionActionDto } from "~/modules/onboarding/dtos/OnboardingSessionActionDto";
import OnboardingSessionService from "~/modules/onboarding/services/OnboardingSessionService";

type LoaderData = {
  item: OnboardingSessionWithDetails | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getOnboardingSession(params.id!);
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const formData = await request.formData();
  const actionName = formData.get("action");
  const sessionId = params.id!;
  const session = await getOnboardingSession(sessionId);
  if (!session) {
    return json({ error: "Session not found" }, { status: 404 });
  }
  const actions = formData.getAll("actions[]").map((action: FormDataEntryValue) => {
    return JSON.parse(action.toString()) as OnboardingSessionActionDto;
  });
  switch (actionName) {
    case "started": {
      await OnboardingSessionService.started({ session, request });
      break;
    }
    case "dismissed": {
      await OnboardingSessionService.dismissed({ session, request });
      break;
    }
    case "add-actions": {
      await OnboardingSessionService.addActions(session, { actions });
      break;
    }
    case "set-step": {
      await OnboardingSessionService.setStep(session, {
        fromIdx: Number(formData.get("fromIdx")),
        toIdx: Number(formData.get("toIdx")),
        actions,
      });
      break;
    }
    case "complete": {
      await OnboardingSessionService.complete({
        session,
        data: { fromIdx: Number(formData.get("fromIdx")), actions },
        request,
      });
      break;
    }
    default: {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  }
  return json({});
};
