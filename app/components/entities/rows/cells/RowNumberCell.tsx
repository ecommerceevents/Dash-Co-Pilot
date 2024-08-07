import RatingBadge from "~/components/ui/badges/RatingBadge";
import NumberUtils, { NumberFormatType } from "~/utils/shared/NumberUtils";

export function getNumberAsStringValue({ value, format, currencySymbol }: { value?: number | null; format?: NumberFormatType; currencySymbol?: string }) {
  if (!value) {
    return "";
  }
  switch (format) {
    case "integer":
      return NumberUtils.intFormat(value);
    case "decimal":
      return NumberUtils.decimalFormat(value);
    case "currency":
      return `${currencySymbol ?? NumberUtils.defaultCurrencySymbol}${NumberUtils.decimalFormat(value)}`;
    case "percentage":
      return `${NumberUtils.decimalFormat(value)}%`;
    default:
      return value.toString();
  }
}
export default function RowNumberCell({ value, format, currencySymbol }: { value?: number | null; format?: NumberFormatType; currencySymbol?: string }) {
  return (
    <>
      {value === null || value === undefined ? (
        <div></div>
      ) : (
        <div>
          {!format ? (
            value
          ) : format === "integer" ? (
            <span>{NumberUtils.intFormat(value)}</span>
          ) : format === "decimal" ? (
            <span>{NumberUtils.decimalFormat(value)}</span>
          ) : format === "currency" ? (
            <span>
              <span>{currencySymbol ?? NumberUtils.defaultCurrencySymbol}</span>
              {NumberUtils.decimalFormat(value)}
            </span>
          ) : format === "percentage" ? (
            <span>{NumberUtils.decimalFormat(value)}%</span>
          ) : format === "rating" ? (
            <span>
              <RatingBadge value={value} />
            </span>
          ) : null}
        </div>
      )}
    </>
  );
}
