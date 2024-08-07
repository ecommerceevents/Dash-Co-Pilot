import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithValues } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";

export default function RowTitle({ entity, item }: { entity: EntityWithDetails; item: RowWithValues }) {
  const { t } = useTranslation();
  const [folio, setFolio] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);

  useEffect(() => {
    setFolio(RowHelper.getRowFolio(entity, item));
    let description = RowHelper.getTextDescription({ entity, item, t }) ?? "";
    if (description.length > 160) {
      description = description.substring(0, 160) + "...";
    }
    setDescription(description);
  }, [entity, item, t]);

  return (
    <Fragment>
      {!description || folio === description ? (
        <div className="truncate">{RowHelper.getRowFolio(entity, item)}</div>
      ) : (
        <div className="flex items-baseline space-x-1 truncate">
          <div className="truncate">
            {description} <span className="text-xs font-medium uppercase text-gray-500">({RowHelper.getRowFolio(entity, item)})</span>
          </div>
        </div>
      )}
    </Fragment>
  );
}
