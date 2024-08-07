import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowNewFetcher from "./RowNewFetcher";
import InputSelector from "~/components/ui/input/InputSelector";
import RowModel from "../repositories/RowModel";
import { useTypedFetcher } from "remix-typedjson";

interface Props {
  entity: EntityWithDetails;
  // listUrl: string;
  // newUrl: string;
  routes: EntitiesApi.Routes;
  allEntities: EntityWithDetails[];
  initial?: string;
  onSelected: (row: RowWithDetails) => void;
  onClear?: () => void;
  className?: string;
}
export default function RowSelectorFetcher({ entity, routes, allEntities, initial, onSelected, onClear, className }: Props) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();

  const listUrl = EntityHelper.getRoutes({ routes, entity })?.list ?? "";
  const newUrl = EntityHelper.getRoutes({ routes, entity })?.new ?? "";

  const [selected, setSelected] = useState<string | null>(initial ?? null);

  const [data, setData] = useState<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<RowWithDetails[]>([]);

  useEffect(() => {
    const item = rows.find((f) => f.id === selected);
    if (item && item.id !== initial) {
      onSelected(item);
    }
    if (selected === "{new}") {
      setAdding(true);
      // setSelected(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    fetcher.load(listUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  useEffect(() => {
    fetcher.load(listUrl + `?view=null&pageSize=-1`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      const data: { rowsData: RowsApi.GetRowsData } = fetcher.data;
      setData(fetcher.data);
      setRows(data.rowsData.items);
    }
  }, [fetcher.data]);

  function onCreated(row: RowWithDetails) {
    setRows([row, ...rows]);
    setSelected(row.id);
    setAdding(false);
  }

  return (
    <div className={className}>
      <InputSelector
        title={t(entity.title)}
        disabled={!data}
        isLoading={!data || fetcher.state === "loading"}
        options={[
          {
            value: "{new}",
            name: ` - ${t("shared.add")} ${t(entity.title)} - `,
          },
          ...(rows.map((f) => {
            const model = new RowModel(f);
            return {
              value: model.row.id,
              name: model.toString(),
            };
          }) ?? []),
        ]}
        value={selected ?? undefined}
        setValue={(e) => setSelected(e?.toString() ?? "")}
        hint={
          <>
            {onClear && selected && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:underline"
                onClick={() => {
                  setSelected(null);
                  onClear();
                }}
              >
                {t("shared.clear")}
              </button>
            )}
          </>
        }
      />

      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data?.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => {
          setAdding(false);
          if (selected === "{new}") {
            setSelected(null);
          }
        }}
      >
        <RowNewFetcher url={newUrl} parentEntity={entity} onCreated={onCreated} allEntities={allEntities} />
      </SlideOverWideEmpty>
    </div>
  );
}
