import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "../db/entities/entities.db.server";
import { RowValueWithDetails } from "../db/entities/rows.db.server";
import RowHelper from "./RowHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import PropertyFormulaValueBadge from "~/components/entities/properties/PropertyFormulaValueBadge";
import PropertyMultipleValueBadge from "~/components/entities/properties/PropertyMultipleValueBadge";
import RowBooleanCell from "~/components/entities/rows/cells/RowBooleanCell";
import RowDateCell from "~/components/entities/rows/cells/RowDateCell";
import RowMediaCell from "~/components/entities/rows/cells/RowMediaCell";
import RowNumberCell from "~/components/entities/rows/cells/RowNumberCell";
import RowRangeDateCell from "~/components/entities/rows/cells/RowRangeDateCell";
import RowRangeNumberCell from "~/components/entities/rows/cells/RowRangeNumberCell";
import { BooleanFormatType } from "../shared/BooleanUtils";
import { DateFormatType } from "../shared/DateUtils";
import { NumberFormatType } from "../shared/NumberUtils";
import { SelectOptionsDisplay } from "../shared/SelectOptionsUtils";
import PropertyAttributeHelper from "./PropertyAttributeHelper";
import RowSelectedOptionCell from "~/components/entities/rows/cells/RowSelectedOptionCell";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";

interface Props {
  property: PropertyWithDetails;
  value: RowValueWithDetails | null | undefined;
  withTitle?: boolean;
}
export default function RowValueUI({ property, value, withTitle }: Props) {
  const rowValue = value ? RowHelper.getDynamicPropertyValue(value, property.type) : undefined;
  if (rowValue === null || rowValue === undefined) {
    return null;
  }
  if (property.type === PropertyType.BOOLEAN) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatBoolean)?.value;
    return (
      <div className="flex items-center space-x-1">
        <RowBooleanCell value={rowValue as boolean} format={format as BooleanFormatType} />
        {withTitle && <div className="text-xs font-medium">{property.title}</div>}
      </div>
    );
  } else if (property.type === PropertyType.SELECT) {
    const display = property.attributes.find((f) => f.name === PropertyAttributeName.SelectOptions)?.value as SelectOptionsDisplay;
    return <RowSelectedOptionCell value={rowValue as string} options={property.options ?? []} display={display} />;
  } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
    return <PropertyMultipleValueBadge values={rowValue as RowValueMultipleDto[]} options={property.options ?? []} />;
  } else if ([PropertyType.RANGE_NUMBER].includes(property.type)) {
    const range = rowValue as RowValueRangeDto;
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value as NumberFormatType;
    return <RowRangeNumberCell value={range} format={format} currencySymbol={undefined} />;
  } else if ([PropertyType.RANGE_DATE].includes(property.type)) {
    const range = rowValue as RowValueRangeDto;
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value as DateFormatType;
    return <RowRangeDateCell value={range} format={format} />;
  } else if ([PropertyType.FORMULA].includes(property.type)) {
    return <PropertyFormulaValueBadge property={property} value={rowValue} />;
  } else if (property.type === PropertyType.NUMBER) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value;
    return <RowNumberCell value={rowValue as number} format={format as NumberFormatType} />;
  } else if (property.type === PropertyType.DATE) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value;
    return <RowDateCell value={rowValue as Date} format={format as DateFormatType} />;
  } else if (property.type === PropertyType.MEDIA) {
    const media = rowValue as MediaDto[];
    return <RowMediaCell media={media} />;
  } else if (property.type === PropertyType.SELECT && rowValue) {
    const display = property.attributes.find((f) => f.name === PropertyAttributeName.SelectOptions)?.value as SelectOptionsDisplay;
    return <RowSelectedOptionCell value={rowValue as string} options={property.options ?? []} display={display} />;
  }
  let formattedValue = RowHelper.getFormattedValue(rowValue, property.type);
  if (PropertyAttributeHelper.getPropertyAttributeValue_Boolean(property, PropertyAttributeName.Password)) {
    formattedValue = "************************";
  } else if (PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Editor) === "wysiwyg") {
    return <div className="truncate" dangerouslySetInnerHTML={{ __html: formattedValue }} />;
  }
  return formattedValue;
}
