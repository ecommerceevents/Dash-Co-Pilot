import { useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputFilters from "~/components/ui/input/InputFilters";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowNewFetcher from "./RowNewFetcher";
import RowsList from "~/components/entities/rows/RowsList";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import Loading from "~/components/ui/loaders/Loading";
import { useTypedFetcher } from "remix-typedjson";

interface Props {
  currentView: EntityViewWithDetails | null;
  listUrl: string;
  newUrl: string;
  parentEntity?: EntityWithDetails;
  onSelected: (rows: RowWithDetails[]) => void;
  multipleSelection?: boolean;
  allEntities: EntityWithDetails[];
}
export default function RowListFetcher({ currentView, listUrl, newUrl, parentEntity, onSelected, multipleSelection, allEntities }: Props) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [data, setData] = useState<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<RowWithDetails[]>([]);
  const [selectedRows, setSelectedRows] = useState<RowWithDetails[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetcher.load(listUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  useEffect(() => {
    if (currentView) {
      searchParams.set("v", currentView.name);
    }
    fetcher.load(listUrl + "?" + searchParams.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentView]);

  useEffect(() => {
    if (fetcher.data) {
      const data: { rowsData: RowsApi.GetRowsData } = fetcher.data;
      setData(fetcher.data);
      setRows(data.rowsData.items);
    }
  }, [fetcher.data]);

  function onRowsSelected(rows: RowWithDetails[]) {
    setSelectedRows(rows);
  }

  function onCreated(row: RowWithDetails) {
    setRows([row, ...rows]);
    setSelectedRows([row, ...selectedRows]);
    setAdding(false);
  }

  function onConfirm(rows: RowWithDetails[]) {
    onSelected(rows);
  }

  return (
    <div>
      {!fetcher.data ? (
        <Loading small loading />
      ) : !data?.rowsData?.entity ? (
        <div className="relative block w-full cursor-not-allowed rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
          {t("shared.loading")}...
        </div>
      ) : !data?.rowsData ? (
        <div>No data</div>
      ) : data?.rowsData ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            {/* <div className="text-lg font-bold text-gray-800">{t(data.rowsData?.entity.titlePlural)}</div> */}
            <ButtonPrimary type="button" onClick={() => onConfirm(selectedRows)} disabled={selectedRows.length > 1 && !multipleSelection}>
              {selectedRows.length === 1 ? (
                <div className="flex space-x-1">
                  <div>{t("shared.select")} 1</div>
                  <div className="lowercase">{t(data.rowsData?.entity.title)}</div>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <div>
                    {t("shared.select")} {selectedRows.length}
                  </div>
                  <div className="lowercase">{t(data.rowsData?.entity.titlePlural)}</div>
                </div>
              )}
            </ButtonPrimary>
            <div className="flex space-x-2">
              <InputFilters filters={EntityHelper.getFilters({ t, entity: data.rowsData.entity })} />
              <ButtonSecondary type="button" onClick={() => setAdding(true)}>
                +
                {/* {t("shared.new")}
              <span className="ml-1 lowercase">{t(data.rowsData?.entity.title)}</span> */}
              </ButtonSecondary>
            </div>
          </div>
          <RowsList
            view={(currentView?.layout ?? "table") as "table" | "board" | "grid" | "card"}
            currentView={currentView}
            entity={data.rowsData.entity}
            items={rows}
            pagination={data.rowsData.pagination}
            selectedRows={selectedRows}
            onSelected={onRowsSelected}
            readOnly={true}
            // routes={data.routes}
            ignoreColumns={[RowDisplayDefaultProperty.FOLIO]}
          />
        </div>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data?.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <RowNewFetcher url={newUrl} parentEntity={parentEntity} onCreated={onCreated} allEntities={allEntities} />
      </SlideOverWideEmpty>
    </div>
  );
}
