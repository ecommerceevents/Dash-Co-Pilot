import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import RowDateCell from "./RowDateCell";
import { DateFormatType } from "~/utils/shared/DateUtils";

interface Props {
  value: RowValueRangeDto;
  format?: DateFormatType;
}
export default function RowRangeDateCell({ value, format }: Props) {
  return (
    <div className="flex items-center space-x-1">
      <RowDateCell value={value?.dateMin ?? undefined} format={format} />
      <div className="text-gray-400">-</div>
      <RowDateCell value={value?.dateMax ?? undefined} format={format} />
    </div>
  );
}
