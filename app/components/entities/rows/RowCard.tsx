import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";

interface Props {
  entity: EntityWithDetails;
  item: RowWithDetails;
  layout: string;
  columns?: ColumnDto[];
  allEntities: EntityWithDetails[];
  routes?: EntitiesApi.Routes;
  actions?: (row: RowWithDetails) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
}
export default function RowCard({ entity, item, columns, layout, allEntities, routes, actions }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders({ entity, columns, layout, allEntities: allEntities, t, routes }));
  }, [entity, columns, layout, allEntities, t, routes]);

  return (
    <div className="flex flex-col space-y-2 whitespace-nowrap text-sm text-gray-600">
      {headers.map((header, idx) => {
        return (
          <div key={idx} className={clsx("flex flex-col", header.className)}>
            <div className="text-xs font-medium text-gray-400">{t(header.title)}</div>
            <div>{RowDisplayValueHelper.displayRowValue(t, header, item, idx)}</div>
          </div>
        );
      })}
      {actions && (
        <div className="flex flex-col space-y-2">
          {actions(item).map((action, idx) => {
            return (
              <Fragment key={idx}>
                {action.render ?? (
                  <ButtonSecondary
                    className="w-full"
                    to={action.href}
                    isLoading={action.isLoading}
                    onClick={(e) => {
                      if (action.onClick) {
                        e.stopPropagation();
                        e.preventDefault();
                        action.onClick();
                      }
                    }}
                  >
                    <div className="flex w-full justify-center">{action.title}</div>
                  </ButtonSecondary>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
