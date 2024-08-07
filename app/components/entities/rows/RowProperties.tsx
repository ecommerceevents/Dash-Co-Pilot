import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import RowValueInput from "./RowValueInput";
import clsx from "clsx";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { useState } from "react";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import RowHelper from "~/utils/helpers/RowHelper";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { getFormProperties } from "~/utils/helpers/PropertyHelper";
import { RowDto } from "~/modules/rows/repositories/RowDto";

export default function RowProperties({
  entity,
  item,
  readOnly,
  properties,
  gridColumns,
}: {
  entity: EntityWithDetails;
  item: RowDto | null;
  readOnly?: boolean;
  properties?: string[];
  gridColumns?: "grid-cols-4" | "grid-cols-3" | "grid-cols-2";
}) {
  const [values, setValues] = useState<RowValueDto[]>(
    getFormProperties({ mode: item ? "edit" : "create", entity, properties }).map((property) => {
      const existing = item?.values.find((f) => f.propertyId === property.id);
      return {
        propertyId: property.id,
        property,
        ...existing,
        textValue: existing?.textValue ?? undefined,
        numberValue: existing?.numberValue ? Number(existing?.numberValue) : undefined,
        dateValue: existing?.dateValue ?? undefined,
        booleanValue: existing ? Boolean(existing?.booleanValue) : undefined,
        selectedOption: existing?.textValue ?? undefined,
        media: existing?.media ?? [],
        multiple: existing?.multiple.sort((a: { order: number }, b: { order: number }) => a.order - b.order) ?? [],
        range: existing?.range ?? undefined,
      };
    })
  );

  function getPropertyColumnSpan(property: PropertyWithDetails) {
    const columns = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Columns);
    if (!columns || columns === undefined) {
      return "col-span-12";
    }
    return `col-span-${columns}`;
  }
  // function getValue(property: PropertyWithDetails) {
  //   return values.find((f) => f.propertyId === property.id);
  // }
  // function getInitialOption(property: PropertyWithDetails) {
  //   const defaultValueString = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
  //   const textValue = getValue(property)?.textValue;
  //   const selectedOption = property.options?.find((f) => f.value === (textValue ?? defaultValueString));
  //   return selectedOption?.value;
  // }
  return (
    <div className={clsx("grid gap-2", gridColumns)}>
      {values.map((detailValue, idxDetailValue) => {
        return (
          <div key={idxDetailValue} className={clsx("w-full", !gridColumns && getPropertyColumnSpan(detailValue.property))}>
            {/* {prop.type === PropertyType.MULTI_SELECT && <>multiple: {JSON.stringify(value?.multiple)}</>} */}
            <RowValueInput
              entity={entity}
              textValue={values[idxDetailValue].textValue}
              numberValue={values[idxDetailValue].numberValue}
              dateValue={values[idxDetailValue].dateValue}
              booleanValue={values[idxDetailValue].booleanValue}
              multiple={values[idxDetailValue].multiple}
              range={values[idxDetailValue].range}
              initialOption={detailValue.selectedOption}
              selected={detailValue.property}
              initialMedia={detailValue.media}
              onChange={(e) => {
                updateItemByIdx(values, setValues, idxDetailValue, RowHelper.updateFieldValueTypeArray(values[idxDetailValue], e));
              }}
              onChangeOption={(e) => {
                updateItemByIdx(values, setValues, idxDetailValue, {
                  textValue: e,
                  selectedOption: e,
                });
              }}
              onChangeMedia={(media) => {
                updateItemByIdx(values, setValues, idxDetailValue, {
                  media,
                });
              }}
              onChangeMultiple={(e) => {
                updateItemByIdx(values, setValues, idxDetailValue, {
                  multiple: e,
                });
              }}
              onChangeRange={(e) => {
                updateItemByIdx(values, setValues, idxDetailValue, {
                  range: e,
                });
              }}
              readOnly={readOnly || detailValue.property.isReadOnly}
              autoFocus={idxDetailValue === 0}
            />
          </div>
        );
      })}
    </div>
  );
}
