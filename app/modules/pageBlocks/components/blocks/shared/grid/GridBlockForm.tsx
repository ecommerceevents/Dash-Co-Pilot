import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputSelector from "~/components/ui/input/InputSelector";
import { gaps, GridBlockDto, gridCols } from "./GridBlockUtils";

export default function GridBlockForm({ item, onUpdate }: { item?: GridBlockDto; onUpdate: (item: GridBlockDto) => void }) {
  const { t } = useTranslation();
  const [columns, setColumns] = useState(item?.columns);
  const [gap, setGap] = useState(item?.gap);
  useEffect(() => {
    onUpdate({
      columns,
      gap,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, gap]);
  return (
    <div className="space-y-1">
      <label className="flex w-full justify-between space-x-2 text-xs font-medium text-gray-600">
        <div className=" flex items-center space-x-1">Grid</div>
        {(gap || columns) && (
          <button
            type="button"
            onClick={() => {
              setGap(undefined);
              setColumns(undefined);
            }}
          >
            {t("shared.remove")}
          </button>
        )}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <InputSelector
          withSearch={false}
          value={columns}
          options={gridCols.map((e) => ({ name: e + " column(s)", value: e }))}
          setValue={(e) => setColumns((e as any) ?? "4")}
          selectPlaceholder="Columns..."
        />
        <InputSelector
          withSearch={false}
          value={gap}
          options={gaps.map((e) => ({ name: e + " gap", value: e }))}
          setValue={(e) => setGap((e as any) ?? "sm")}
          selectPlaceholder="Gap..."
        />
      </div>
    </div>
  );
}
