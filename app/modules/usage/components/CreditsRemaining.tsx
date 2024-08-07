import { Link } from "@remix-run/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import NumberUtils from "~/utils/shared/NumberUtils";

export default function CreditsRemaining({ remaining, redirectTo }: { remaining?: number | "unlimited"; redirectTo: string }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      {!!remaining && (
        <Link
          to={redirectTo}
          className="cursor-pointer select-none rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100"
        >
          {remaining === "unlimited" ? (
            <span>{t("models.credit.unlimited")}</span>
          ) : remaining <= 0 ? (
            <span>{t("models.credit.empty")}</span>
          ) : (
            <span>{t("models.credit.remaining", { 0: NumberUtils.intFormat(remaining) })}</span>
          )}
        </Link>
      )}
    </Fragment>
  );
}
