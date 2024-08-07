import { useTranslation } from "react-i18next";
import { RowWithCreatedBy } from "~/utils/db/entities/rows.db.server";

interface Props {
  row: RowWithCreatedBy;
  withEmail?: boolean;
}
export default function RowCreatedByBadge({ row, withEmail = true }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center space-x-1">
      {row.createdByUser && (
        <div className="flex items-baseline space-x-1 text-xs text-gray-500">
          <div className="font-normal">
            {t("shared.by")} {row.createdByUser.firstName} {row.createdByUser.lastName}
          </div>{" "}
          {withEmail && <span className="italic">({row.createdByUser.email})</span>}
        </div>
      )}{" "}
      {row.createdByApiKey && (
        <div className="flex items-baseline space-x-1 text-gray-500">
          <div className="font-normal">
            {t("shared.by")} {t("models.apiKey.object")}
          </div>{" "}
          <span className="text-xs italic">({row.createdByApiKey.alias})</span>
        </div>
      )}
    </div>
  );
}
