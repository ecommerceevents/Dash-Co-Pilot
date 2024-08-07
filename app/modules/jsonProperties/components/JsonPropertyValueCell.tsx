import DateCell from "~/components/ui/dates/DateCell";
import { JsonValue } from "../dtos/JsonPropertiesValuesDto";
import { JsonPropertyDto } from "../dtos/JsonPropertyTypeDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";

export default function JsonPropertyValueCell({ property, value }: { property: JsonPropertyDto; value: JsonValue | undefined }) {
  if (value === null || value === undefined) {
    return null;
  }
  switch (property.type) {
    case "string":
      return value as string;
    case "number":
      return value as number;
    case "boolean":
      const booleanValue = value === undefined ? undefined : value === "true" || value === true || value === 1 || value === "1";
      if (value === undefined || value === null) {
        return null;
      }
      if (booleanValue) {
        return <CheckIcon className="h-4 w-4" />;
      } else {
        return <XIcon className="h-4 w-4" />;
      }
    case "image":
      if (!value) {
        return null;
      }
      return <img src={value as string} alt="" className="h-8 w-8 object-cover" />;
    case "date":
      if (!value) {
        return null;
      }
      try {
        const date = new Date(value as string);
        return <div>{<DateCell date={date} />}</div>;
      } catch (e) {
        return <div className="text-muted-foreground">{value?.toString()}</div>;
      }
    case "select":
      if (!property.options) {
        return value as string;
      } else {
        const option = property.options.find((o) => o.value === value);
        return option?.name || (value as string);
      }
    case "multiselect":
      if (!Array.isArray(value)) {
        return null;
      }
      if (!property.options) {
        return <div className="text-muted-foreground">{value.join(", ")}</div>;
      } else {
        const values = value.map((v) => {
          const option = property.options?.find((o) => o.value === v);
          return option?.name || v;
        });
        return values.join(", ");
      }
    default:
      return value as string;
  }
}
