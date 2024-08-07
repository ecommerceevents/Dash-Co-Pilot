import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RowEditFetcher from "~/modules/rows/fetchers/RowEditFetcher";
import RowNewFetcher from "~/modules/rows/fetchers/RowNewFetcher";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowHelper from "~/utils/helpers/RowHelper";
import { Rows_List } from "../routes/Rows_List.server";
import RowsViewRoute from "./RowsViewRoute";
import { getEntityPermission, getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useTypedLoaderData } from "remix-typedjson";

export default function RowsAllInOneRoute() {
  const data = useTypedLoaderData<Rows_List.LoaderData>();
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<RowWithDetails>();
  const [rows, setRows] = useState<RowWithDetails[]>([]);

  useEffect(() => {
    setRows(data.rowsData.items);
  }, [data.rowsData.items]);

  function onCreated(row: RowWithDetails) {
    setRows([row, ...rows]);
    setAdding(false);
  }
  function onUpdated(row: RowWithDetails) {
    setRows(rows.map((r) => (r.id === row.id ? row : r)));
    setEditing(undefined);
  }
  function onDeleted(row: RowWithDetails | undefined) {
    if (row) {
      setRows(rows.filter((r) => r.id !== row.id));
      setEditing(undefined);
    }
  }

  return (
    <div>
      <RowsViewRoute
        key={data.rowsData.entity.id}
        rowsData={data.rowsData}
        items={rows}
        routes={data.routes}
        onNewRow={() => setAdding(true)}
        onEditRow={(row) => setEditing(row)}
        saveCustomViews={true}
        permissions={{
          create: getUserHasPermission(appOrAdminData, getEntityPermission(data.rowsData.entity, "create")),
        }}
        currentSession={{
          user: appOrAdminData.user,
          isSuperAdmin: appOrAdminData.isSuperAdmin,
        }}
      />
      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <RowNewFetcher
          url={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity })?.new ?? ""}
          onCreated={onCreated}
          allEntities={appOrAdminData.entities}
        />
      </SlideOverWideEmpty>

      <SlideOverWideEmpty
        title={editing ? RowHelper.getRowFolio(data.rowsData?.entity, editing) : ""}
        className="max-w-md"
        open={!!editing}
        onClose={() => setEditing(undefined)}
        buttons={
          <>
            <Link
              to={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity, item: editing })?.overview ?? ""}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close panel</span>
              <ExternalLinkEmptyIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
          </>
        }
      >
        <RowEditFetcher
          url={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity, item: editing })?.edit ?? ""}
          allEntities={appOrAdminData.entities}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(editing)}
        />
      </SlideOverWideEmpty>
    </div>
  );
}
