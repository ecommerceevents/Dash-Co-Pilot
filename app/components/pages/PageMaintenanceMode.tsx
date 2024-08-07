import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export default function PageMaintenanceMode() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-2">
      <h1 className="text-4xl font-bold">{t("shared.maintenance.title")}</h1>
      <p className="text-xl">{t("shared.maintenance.description")}</p>
      <Link to="." className="text-sm text-gray-600 underline dark:text-gray-400">
        {t("shared.clickHereToTryAgain")}
      </Link>
    </div>
  );
}
