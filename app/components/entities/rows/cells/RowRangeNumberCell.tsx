import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import { NumberFormatType } from "~/utils/shared/NumberUtils";
import RowNumberCell from "./RowNumberCell";

interface Props {
  value: RowValueRangeDto;
  format?: NumberFormatType;
  currencySymbol?: string;
}
export default function RowRangeNumberCell({ value, format, currencySymbol }: Props) {
  return (
    <div className="flex items-center space-x-1">
      <RowNumberCell value={Number(value?.numberMin) ?? undefined} format={format} currencySymbol={currencySymbol} />
      <div className="text-gray-400">-</div>
      <RowNumberCell value={Number(value?.numberMax) ?? undefined} format={format} currencySymbol={currencySymbol} />
    </div>
  );
}
