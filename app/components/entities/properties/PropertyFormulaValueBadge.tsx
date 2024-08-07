import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { DateFormatType } from "~/utils/shared/DateUtils";
import { NumberFormatType } from "~/utils/shared/NumberUtils";
import RowNumberCell from "../rows/cells/RowNumberCell";
import RowDateCell from "../rows/cells/RowDateCell";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { FormulaValueType } from "~/modules/formulas/dtos/FormulaDto";
import { BooleanFormatType } from "~/utils/shared/BooleanUtils";
import RowBooleanCell from "../rows/cells/RowBooleanCell";

interface Props {
  property: PropertyWithDetails;
  value: FormulaValueType;
}
export default function PropertyFormulaValueBadge({ property, value }: Props) {
  const getNumberFormat = () => {
    return property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value as NumberFormatType;
  };
  const getBooleanFormat = () => {
    return property.attributes.find((f) => f.name === PropertyAttributeName.FormatBoolean)?.value as BooleanFormatType;
  };
  const getDateFormat = () => {
    return property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value as DateFormatType;
  };
  return (
    <div className="flex space-x-1">
      {/* <div>
        <div>[resultAs:{property.formula?.resultAs}]</div>
        <div>[calculationTrigger:{property.formula?.calculationTrigger}]</div>
        <div>value: {JSON.stringify(value)}</div>
      </div> */}
      {property.formula?.resultAs === "number" ? (
        <RowNumberCell value={Number(value) ?? undefined} format={getNumberFormat()} />
      ) : property.formula?.resultAs === "boolean" ? (
        <RowBooleanCell value={Boolean(value) ?? undefined} format={getBooleanFormat()} />
      ) : property.formula?.resultAs === "date" ? (
        <RowDateCell value={value ? (value as Date) : undefined} format={getDateFormat()} />
      ) : (
        <div>{value?.toString()}</div>
      )}
    </div>
  );
}
