import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputSelector from "~/components/ui/input/InputSelector";
import { MarginBlockDto, marginX, marginY } from "./MarginBlockUtils";

export default function MarginBlockForm({ item, onUpdate }: { item?: MarginBlockDto; onUpdate: (item: MarginBlockDto) => void }) {
  const { t } = useTranslation();
  const [x, setX] = useState(item?.x);
  const [y, setY] = useState(item?.y);
  useEffect(() => {
    onUpdate({ x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);
  return (
    <div className="space-y-1">
      <label className="flex w-full justify-between space-x-2 text-xs font-medium text-gray-600">
        <div className=" flex items-center space-x-1">Margin</div>
        {(x || y) && (
          <button
            type="button"
            onClick={() => {
              setX(undefined);
              setY(undefined);
            }}
          >
            {t("shared.remove")}
          </button>
        )}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <InputSelector
          withSearch={false}
          value={x}
          options={marginX.map((e) => ({ name: e, value: e }))}
          setValue={(e) => setX(e as (typeof marginX)[number])}
        />
        <InputSelector
          withSearch={false}
          value={y}
          options={marginY.map((e) => ({ name: e, value: e }))}
          setValue={(e) => setY(e as (typeof marginY)[number])}
        />
      </div>
    </div>
  );
}
