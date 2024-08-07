import DateCell from "~/components/ui/dates/DateCell";
import { RowWithCreatedBy } from "~/utils/db/entities/rows.db.server";
import { DateDisplay } from "~/utils/shared/DateUtils";
import RowCreatedByBadge from "./RowCreatedByBadge";

interface Props {
  row: RowWithCreatedBy;
  by?: { withEmail?: boolean };
  date?: { displays?: DateDisplay[] };
}
export default function RowCreatedBadge({ row, by = { withEmail: true }, date = { displays: ["ymd"] } }: Props) {
  return (
    <div className="flex flex-col">
      {date && <DateCell displays={date.displays} date={row.createdAt} />}
      {by && <RowCreatedByBadge row={row} withEmail={by.withEmail} />}
    </div>
  );
}
