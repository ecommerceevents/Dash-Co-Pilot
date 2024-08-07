import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputSelector from "~/components/ui/input/InputSelector";
import { maxWidths, SizeBlockDto } from "./SizeBlockUtils";

export default function SizeBlockForm({ item, onUpdate }: { item?: SizeBlockDto; onUpdate: (item: SizeBlockDto) => void }) {
  const { t } = useTranslation();
  const [maxWidth, setMaxWidth] = useState(item?.maxWidth);
  useEffect(() => {
    onUpdate({ maxWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidth]);
  return (
    <div className="space-y-1">
      <label className="flex w-full justify-between space-x-2 text-xs font-medium text-gray-600">
        <div className=" flex items-center space-x-1">Size</div>
        {maxWidth && (
          <button
            type="button"
            onClick={() => {
              setMaxWidth(undefined);
            }}
          >
            {t("shared.remove")}
          </button>
        )}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <InputSelector
          withSearch={false}
          value={maxWidth}
          options={maxWidths.map((e) => ({ name: e, value: e }))}
          setValue={(e) => setMaxWidth(e as (typeof maxWidths)[number])}
        />
      </div>
    </div>
  );
}
