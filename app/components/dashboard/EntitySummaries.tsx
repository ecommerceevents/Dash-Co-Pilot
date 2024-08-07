import { useParams } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { EntitySummaryDto } from "~/utils/services/appDashboardService";
import RowsList from "../entities/rows/RowsList";
import EntityIcon from "../layouts/icons/EntityIcon";
import ButtonSecondary from "../ui/buttons/ButtonSecondary";
import { RowsApi } from "~/utils/api/.server/RowsApi";

export default function EntitySummaries({ items, routes }: { items: EntitySummaryDto[]; routes: EntitiesApi.Routes }) {
  return (
    <Fragment>
      {items
        .sort((a, b) => a.order - b.order)
        .map(({ rowsData }, idx) => {
          return <LatestRows key={idx} rowsData={rowsData} routes={routes} />;
        })}
    </Fragment>
  );
}

function LatestRows({ rowsData, routes }: { rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();

  const [listRoute, setListRoute] = useState<string>();
  useEffect(() => {
    const group = appOrAdminData.entityGroups.find((f) => f.entities.some((g) => g.entityId === rowsData.entity.id));
    if (group) {
      setListRoute(UrlUtils.currentTenantUrl(params, `g/${group.slug}/${rowsData.entity.slug}`));
    } else {
      const entity = appOrAdminData.entities.find((f) => f.id === rowsData.entity.id);
      if (entity) {
        setListRoute(UrlUtils.currentTenantUrl(params, entity.slug));
      }
    }
  }, [appOrAdminData.entityGroups, appOrAdminData.entities, rowsData.entity.id, rowsData.entity.slug, params]);
  return (
    <div className="space-y-3 overflow-hidden p-1">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <EntityIcon className="h-5 w-5" icon={rowsData.entity.icon} />
          <h3 className="flex-grow font-medium leading-4 text-gray-900">Latest {t(rowsData.entity.titlePlural)}</h3>
        </div>
        {listRoute && <ButtonSecondary to={listRoute}>{t("shared.viewAll")}</ButtonSecondary>}
      </div>

      <div className="flex space-x-2 overflow-x-scroll">
        <RowsList entity={rowsData.entity} view={"card"} items={rowsData.items} routes={routes} />
      </div>
    </div>
  );
}
