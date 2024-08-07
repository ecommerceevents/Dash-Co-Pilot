import { OnboardingSession } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

export default function OnboardingSessionBadge({ item }: { item: OnboardingSession }) {
  const { t } = useTranslation();
  return (
    <>
      {item.status === "active" && <SimpleBadge title={t("onboarding.object.sessions.active")} color={Colors.YELLOW} />}
      {item.status === "started" && <SimpleBadge title={t("onboarding.object.sessions.started")} color={Colors.INDIGO} />}
      {item.status === "dismissed" && <SimpleBadge title={t("onboarding.object.sessions.dismissed")} color={Colors.ORANGE} />}
      {item.status === "completed" && <SimpleBadge title={t("onboarding.object.sessions.completed")} color={Colors.GREEN} />}
    </>
  );
}
