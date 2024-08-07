import { Onboarding } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

export default function OnboardingBadge({ item }: { item: Onboarding }) {
  const { t } = useTranslation();
  return (
    <>
      {item.active && <SimpleBadge title={t("shared.active")} color={Colors.GREEN} />}
      {!item.active && <SimpleBadge title={t("shared.inactive")} color={Colors.GRAY} />}
    </>
  );
}
