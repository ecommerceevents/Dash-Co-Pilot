import DateUtils, { DateFormatType } from "~/utils/shared/DateUtils";

export function getDateAsString({ value, format }: { value?: Date | null; format?: DateFormatType }) {
  if (!value) {
    return "";
  }
  if (!format) {
    try {
      const date = new Date(value);
      return date.toISOString().split("T")[0];
    } catch (e: any) {
      return value.toISOString().split("T")[0];
    }
  }
  switch (format) {
    case "YYYY-MM-DD":
      return DateUtils.dateYMD(value);
    case "DD-MM-YYYY":
      return DateUtils.dateDMY(value);
    case "MM-DD-YYYY":
      return DateUtils.dateMDY(value);
    case "diff":
      return DateUtils.dateAgo(value);
    default:
      return value.toString();
  }
}

export default function RowDateCell({ value, format }: { value?: Date | null; format?: DateFormatType }) {
  function getText() {
    if (!value) {
      return "";
    }
    try {
      const date = new Date(value);
      return date.toISOString().split("T")[0];
    } catch (e: any) {
      return value.toISOString().split("T")[0];
    }
  }
  return (
    <>
      {!value ? (
        <div></div>
      ) : (
        <div>
          {!format ? (
            getText()
          ) : format === "YYYY-MM-DD" ? (
            <span>{DateUtils.dateYMD(value)}</span>
          ) : format === "DD-MM-YYYY" ? (
            <span>{DateUtils.dateDMY(value)}</span>
          ) : format === "MM-DD-YYYY" ? (
            <span>{DateUtils.dateMDY(value)}</span>
          ) : format === "diff" ? (
            <span>{DateUtils.dateAgo(value)}</span>
          ) : null}
        </div>
      )}
    </>
  );
}
