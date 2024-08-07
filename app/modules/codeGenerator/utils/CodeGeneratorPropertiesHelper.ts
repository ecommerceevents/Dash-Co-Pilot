import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import { SelectOptionsDisplay } from "~/utils/shared/SelectOptionsUtils";

function type({ code, imports, property }: { code: string[]; imports: string[]; property: PropertyWithDetails }) {
  let type = "";
  if (property.type === PropertyType.TEXT) {
    type = property.isRequired ? "string" : "string | undefined";
  } else if (property.type === PropertyType.NUMBER) {
    type = property.isRequired ? "number" : "number | undefined";
  } else if (property.type === PropertyType.DATE) {
    type = property.isRequired ? "Date" : "Date | undefined";
  } else if (property.type === PropertyType.SELECT) {
    type = property.isRequired ? "string" : "string | undefined";
  } else if (property.type === PropertyType.BOOLEAN) {
    type = property.isRequired ? "boolean" : "boolean | undefined";
  } else if (property.type === PropertyType.MEDIA) {
    imports.push(`import { MediaDto } from "~/application/dtos/entities/MediaDto";`);
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      type = property.isRequired ? "MediaDto" : "MediaDto | undefined";
    } else {
      type = property.isRequired ? "MediaDto[]" : "MediaDto[] | undefined";
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    imports.push(`import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";`);
    type = "RowValueMultipleDto[]";
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    imports.push(`import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";`);
    type = property.isRequired ? "RowValueRangeDto" : "RowValueRangeDto | undefined";
  } else if (property.type === PropertyType.RANGE_DATE) {
    imports.push(`import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";`);
    type = property.isRequired ? "RowValueRangeDto" : "RowValueRangeDto | undefined";
  } else if (property.type === PropertyType.MULTI_TEXT) {
    imports.push(`import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";`);
    type = "RowValueMultipleDto[]";
  } else {
    // eslint-disable-next-line no-console
    console.log(`Unknown property type: ${PropertyType[property.type]}`);
    type = "unknown";
  }

  let comments: string[] = [];
  comments.push(property.isRequired ? "required" : "optional");
  property.attributes
    .filter((f) => f.value)
    .forEach((attribute) => {
      comments.push(`${attribute.name}: ${attribute.value}`);
    });

  code.push(`  ${property.name}: ${type}; // ${comments.join(", ")}`);
}

function rowToDto({ code, property }: { code: string[]; property: PropertyWithDetails }) {
  let propertyCode = "";
  let comments: string[] = [];
  comments.push(property.isRequired ? "required" : "optional");
  if (property.type === PropertyType.TEXT) {
    let fallbackValue = property.isRequired ? ` ?? ""` : ``;
    propertyCode = `${property.name}: RowValueHelper.getText({ entity, row, name: "${property.name}" })${fallbackValue},`;
  } else if (property.type === PropertyType.NUMBER) {
    let fallbackValue = property.isRequired ? ` ?? 0` : ``;
    propertyCode = `${property.name}: RowValueHelper.getNumber({ entity, row, name: "${property.name}" })${fallbackValue},`;
  } else if (property.type === PropertyType.DATE) {
    let fallbackValue = property.isRequired ? ` ?? new Date()` : ``;
    propertyCode = `${property.name}: RowValueHelper.getDate({ entity, row, name: "${property.name}" })${fallbackValue},`;
  } else if (property.type === PropertyType.SELECT) {
    let fallbackValue = property.isRequired ? ` ?? ""` : ``;
    propertyCode = `${property.name}: RowValueHelper.getText({ entity, row, name: "${property.name}" })${fallbackValue},`;
  } else if (property.type === PropertyType.BOOLEAN) {
    propertyCode = `${property.name}: RowValueHelper.getBoolean({ entity, row, name: "${property.name}" }) ?? false,`;
  } else if (property.type === PropertyType.MEDIA) {
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      if (property.isRequired) {
        propertyCode = `${property.name}: RowValueHelper.getFirstMedia({ entity, row, name: "${property.name}" }) as MediaDto,`;
      } else {
        propertyCode = `${property.name}: RowValueHelper.getFirstMedia({ entity, row, name: "${property.name}" }),`;
      }
    } else {
      propertyCode = `${property.name}: RowValueHelper.getMedia({ entity, row, name: "${property.name}" }),`;
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    propertyCode = `${property.name}: RowValueHelper.getMultiple({ entity, row, name: "${property.name}" }),`;
  } else if (property.type === PropertyType.MULTI_TEXT) {
    propertyCode = `${property.name}: RowValueHelper.getMultiple({ entity, row, name: "${property.name}" }),`;
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    propertyCode = `${property.name}: RowValueHelper.getNumberRange({ entity, row, name: "${property.name}" }),`;
  } else if (property.type === PropertyType.RANGE_DATE) {
    propertyCode = `${property.name}: RowValueHelper.getDateRange({ entity, row, name: "${property.name}" }),`;
  }

  if (comments.length > 0) {
    propertyCode = propertyCode + ` // ${comments.join(", ")}`;
  }
  code.push(propertyCode);
}

function formToDto({ code, property }: { code: string[]; property: PropertyWithDetails }) {
  let propertyCode = "";
  let comments: string[] = [];
  comments.push(property.isRequired ? "required" : "optional");
  if (property.type === PropertyType.TEXT) {
    propertyCode = `${property.name}: FormHelper.getText(form, "${property.name}"),`;
  } else if (property.type === PropertyType.NUMBER) {
    propertyCode = `${property.name}: FormHelper.getNumber(form, "${property.name}"),`;
  } else if (property.type === PropertyType.DATE) {
    propertyCode = `${property.name}: FormHelper.getDate(form, "${property.name}"),`;
  } else if (property.type === PropertyType.SELECT) {
    propertyCode = `${property.name}: FormHelper.getText(form, "${property.name}"),`;
  } else if (property.type === PropertyType.BOOLEAN) {
    propertyCode = `${property.name}: FormHelper.getBoolean(form, "${property.name}"),`;
  } else if (property.type === PropertyType.MEDIA) {
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      propertyCode = `${property.name}: FormHelper.getFormFirstMedia(form, "${property.name}"),`;
    } else {
      propertyCode = `${property.name}: FormHelper.getFormMedia(form, "${property.name}"),`;
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    propertyCode = `${property.name}: FormHelper.getMultiple(form, "${property.name}"),`;
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    propertyCode = `${property.name}: FormHelper.getNumberRange(form, "${property.name}"),`;
  } else if (property.type === PropertyType.RANGE_DATE) {
    propertyCode = `${property.name}: FormHelper.getDateRange(form, "${property.name}"),`;
  } else if (property.type === PropertyType.MULTI_TEXT) {
    propertyCode = `${property.name}: FormHelper.getMultiple(form, "${property.name}"),`;
  } else {
    propertyCode = `${property.name}: undefined, // TODO: ${PropertyType[property.type]} not implemented`;
  }

  if (comments.length > 0) {
    propertyCode = propertyCode + ` // ${comments.join(", ")}`;
  }
  code.push(propertyCode);
}

function createDtoToRow({ code, property }: { code: string[]; property: PropertyWithDetails }) {
  const optionalChaining = property.isRequired ? "" : "?";
  let propertyCode = ``;
  if (property.type === PropertyType.TEXT) {
    propertyCode = `{ name: "${property.name}", value: data.${property.name} },`;
  } else if (property.type === PropertyType.NUMBER) {
    propertyCode = `{ name: "${property.name}", value: data.${property.name}${optionalChaining}.toString() },`;
  } else if (property.type === PropertyType.DATE) {
    propertyCode = `{ name: "${property.name}", value: data.${property.name}${optionalChaining}.toISOString() },`;
  } else if (property.type === PropertyType.SELECT) {
    propertyCode = `{ name: "${property.name}", value: data.${property.name} },`;
  } else if (property.type === PropertyType.BOOLEAN) {
    propertyCode = `{ name: "${property.name}", value: data.${property.name}${optionalChaining}.toString() },`;
  } else if (property.type === PropertyType.MEDIA) {
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      propertyCode = `{ name: "${property.name}", media: data.${property.name} ? [data.${property.name}] : [] },`;
    } else {
      propertyCode = `{ name: "${property.name}", media: data.${property.name} },`;
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    propertyCode = `{ name: "${property.name}", multiple: data.${property.name} },`;
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    propertyCode = `{ name: "${property.name}", range: data.${property.name} },`;
  } else if (property.type === PropertyType.RANGE_DATE) {
    propertyCode = `{ name: "${property.name}", range: data.${property.name} },`;
  } else if (property.type === PropertyType.MULTI_TEXT) {
    propertyCode = `{ name: "${property.name}", multiple: data.${property.name} },`;
  }
  code.push(propertyCode);
}

function updateDtoToRow({ code, property }: { code: string[]; property: PropertyWithDetails }) {
  let propertyCode = `if (data.${property.name} !== undefined) {\n`;

  if (property.type === PropertyType.TEXT) {
    propertyCode += `values.push({ name: "${property.name}", textValue: data.${property.name} });`;
  } else if (property.type === PropertyType.NUMBER) {
    propertyCode += `values.push({ name: "${property.name}", numberValue: data.${property.name} });`;
  } else if (property.type === PropertyType.DATE) {
    propertyCode += `values.push({ name: "${property.name}", dateValue: data.${property.name} });`;
  } else if (property.type === PropertyType.SELECT) {
    propertyCode += `values.push({ name: "${property.name}", textValue: data.${property.name} });`;
  } else if (property.type === PropertyType.BOOLEAN) {
    propertyCode += `values.push({ name: "${property.name}", booleanValue: data.${property.name} });`;
  } else if (property.type === PropertyType.MEDIA) {
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      propertyCode += `values.push({ name: "${property.name}", media: data.${property.name} ? [data.${property.name} as RowMedia] : [] });`;
    } else {
      propertyCode += `values.push({ name: "${property.name}", media: data.${property.name} ? data.${property.name} as RowMedia[] : [] });`;
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    propertyCode += `values.push({ name: "${property.name}", multiple: data.${property.name} });`;
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    propertyCode += `values.push({ name: "${property.name}", range: data.${property.name} });`;
  } else if (property.type === PropertyType.RANGE_DATE) {
    propertyCode += `values.push({ name: "${property.name}", range: data.${property.name} });`;
  } else if (property.type === PropertyType.MULTI_TEXT) {
    propertyCode += `values.push({ name: "${property.name}", multiple: data.${property.name} });`;
  }

  propertyCode = propertyCode + `\n}`;

  code.push(propertyCode);
}

function getColor(color: number) {
  return "Colors." + Colors[color];
}

function uiForm({ code, imports, property, index }: { code: string[]; imports: string[]; property: PropertyWithDetails; index: number }) {
  if (!property.showInCreate) {
    // render if row exists only
    code.push(`{item && (`);
  }

  const props: string[] = [];
  if (property.isRequired) {
    props.push(`required`);
  }
  if (index === 0) {
    props.push(`autoFocus`);
  }
  props.push("disabled={isDisabled()}");

  let min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min) ?? 0;
  let max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) ?? 0;

  if (property.type === PropertyType.TEXT) {
    let defaultValue = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
    let value = `item?.${property.name}`;
    if (defaultValue) {
      value = `item?.${property.name} ?? (!item ? "${defaultValue}" : undefined)`;
    }
    props.push(`defaultValue={${value}}`);
    let placeholder = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Placeholder);
    if (placeholder) {
      props.push(`placeholder="${placeholder}"`);
    }
    if (min > 0) {
      props.push(`minLength={${min}}`);
    }
    if (max > 0) {
      props.push(`maxLength={${max}}`);
    }
    let rows = property.attributes.find((f) => f.name === PropertyAttributeName.Rows);
    if (rows) {
      props.push(`rows={${PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Rows)}}`);
    }
    let pattern = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Pattern);
    if (pattern) {
      props.push(`pattern="${pattern}"`);
    }
    let editor = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Editor);
    if (editor === "monaco") {
      props.push(`editor="monaco" editorLanguage="markdown"`);
    } else if (editor === "wysiwyg") {
      props.push(`editor="wysiwyg" autoFocus={${index === 0}}`);
    }
    if (!property.subtype || property.subtype === "singleLine") {
      imports.push(`import InputText from "~/components/ui/input/InputText";`);
      code.push(`<InputText name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    } else {
      imports.push(`import InputTextSubtype from "~/components/ui/input/subtypes/InputTextSubtype";`);
      code.push(`<InputTextSubtype subtype="${property.subtype}" name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    }
  } else if (property.type === PropertyType.NUMBER) {
    imports.push(`import InputNumber from "~/components/ui/input/InputNumber";`);
    let defaultValue = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.DefaultValue);
    let value = `item?.${property.name}`;
    if (defaultValue) {
      value = `item?.${property.name} ?? (!item ? ${defaultValue} : undefined)`;
    }
    props.push(`defaultValue={${value}}`);
    if (min > 0) {
      props.push(`min={${min}}`);
    }
    if (max > 0) {
      props.push(`max={${max}}`);
    }
    let step = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Step);
    if (step) {
      props.push(`step="${step}"`);
    }
    code.push(`<InputNumber name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
  } else if (property.type === PropertyType.DATE) {
    imports.push(`import InputDate from "~/components/ui/input/InputDate";`);
    code.push(`<InputDate name="${property.name}" title={t("${property.title}")} defaultValue={item?.${property.name}} ${props.join(" ")} />`);
  } else if (property.type === PropertyType.SELECT) {
    let defaultValue = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
    let value = `item?.${property.name}`;
    if (defaultValue) {
      value = `item?.${property.name} ?? (!item ? "${defaultValue}" : undefined)`;
    }
    props.push(`defaultValue={${value}}`);
    const withColors = property.options.filter((f) => f.color).length > 0;

    imports.push(`import { Colors } from "~/application/enums/shared/Colors";`);
    props.push(
      `options={[${property.options.map((option) => {
        return `{ name: ${option.name === null ? `"${option.value}"` : `"${option.name}"`}, value: "${option.value}", color: ${getColor(option.color)} }`;
      })}]}`
    );
    if (!property.subtype || property.subtype === "dropdown") {
      // props.push(`withSearch={false}`);
      props.push(`withColors={${withColors ? "true" : "false"}}`);
      imports.push(`import InputSelect from "~/components/ui/input/InputSelect";`);
      code.push(`<InputSelect name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    } else if (property.subtype === "radioGroupCards") {
      imports.push(`import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";`);
      code.push(`<InputRadioGroupCards name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    }
  } else if (property.type === PropertyType.BOOLEAN) {
    imports.push(`import InputCheckbox from "~/components/ui/input/InputCheckbox";`);
    let defaultValue = PropertyAttributeHelper.getPropertyAttributeValue_Boolean(property, PropertyAttributeName.DefaultValue);
    let value = `item?.${property.name}`;
    if (defaultValue) {
      value = `item?.${property.name} ?? (!item ? ${defaultValue} : undefined)`;
    }
    props.push(`value={${value}}`);
    code.push(`<InputCheckbox name="${property.name}" title={t("${property.title}")} asToggle ${props.join(" ")} />`);
  } else if (property.type === PropertyType.MEDIA) {
    imports.push(`import InputMedia from "~/components/ui/input/InputMedia";`);
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      props.push(`initialMedia={item?.${property.name} ? [item?.${property.name}] : []}`);
    } else {
      props.push(`initialMedia={item?.${property.name}}`);
    }
    let acceptFileTypes = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.AcceptFileTypes);
    if (min > 0) {
      props.push(`min={${min}}`);
    }
    if (max > 0) {
      props.push(`max={${max}}`);
    }
    if (acceptFileTypes) {
      props.push(`accept="${acceptFileTypes}"`);
    }
    let maxSize = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.MaxSize) ?? 0;
    if (maxSize > 0) {
      props.push(`maxSize={${maxSize}}`);
    }
    code.push(`<InputMedia name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
  } else if (property.type === PropertyType.MULTI_SELECT) {
    props.push(`value={item?.${property.name}}`);

    imports.push(`import { Colors } from "~/application/enums/shared/Colors";`);
    props.push(
      `options={[${property.options.map((option) => {
        return `{ name: ${option.name === null ? `"${option.value}"` : `"${option.name}"`}, value: "${option.value}", color: ${getColor(option.color)} }`;
      })}]}`
    );
    if (!property.subtype || property.subtype === "combobox") {
      // imports.push(`import InputCombobox from "~/components/ui/input/InputCombobox";`);
      imports.push(`import PropertyMultiSelector from "~/components/entities/properties/PropertyMultiSelector";`);
      code.push(`<PropertyMultiSelector name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    } else if (property.subtype === "checkboxCards") {
      imports.push(`import PropertyMultiSelector from "~/components/entities/properties/PropertyMultiSelector";`);
      code.push(`<PropertyMultiSelector subtype="checkboxCards" name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
    }
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    imports.push(`import InputRangeNumber from "~/components/ui/input/ranges/InputRangeNumber";`);
    code.push(
      `<InputRangeNumber name="${property.name}" title={t("${property.title}")} ${props.join(" ")} defaultValueMin={item?.${
        property.name
      }?.numberMin ? Number(item.${property.name}.numberMin) : undefined} defaultValueMax={item?.${property.name}?.numberMax ? Number(item.${
        property.name
      }.numberMax) : undefined} />`
    );
  } else if (property.type === PropertyType.RANGE_DATE) {
    imports.push(`import InputRangeDate from "~/components/ui/input/ranges/InputRangeDate";`);
    code.push(
      `<InputRangeDate name="${property.name}" title={t("${property.title}")} ${props.join(" ")} defaultValueMin={item?.${
        property.name
      }?.dateMin} defaultValueMax={item?.${property.name}?.dateMax} />`
    );
  } else if (property.type === PropertyType.MULTI_TEXT) {
    imports.push(`import InputMultiText from "~/components/ui/input/InputMultiText";`);
    let separator = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Separator);
    if (separator) {
      props.push(`separator="${separator}"`);
    }
    props.push(`value={item?.${property.name}}`);
    code.push(`<InputMultiText name="${property.name}" title={t("${property.title}")} ${props.join(" ")} />`);
  } else {
    code.push(`/* TODO: ${property.name} (${PropertyType[property.type]}) */`);
  }

  if (!property.showInCreate) {
    // render if row exists only
    code.push(`)}`);
  }
}

function uiCell({ code, imports, property }: { code: string[]; imports: string[]; property: PropertyWithDetails }) {
  const props: string[] = [];
  if (property.type === PropertyType.TEXT) {
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <div className="max-w-sm truncate">{item.${property.name}}</div>,
          },`);
  } else if (property.type === PropertyType.NUMBER) {
    imports.push(`import RowNumberCell from "~/components/entities/rows/cells/RowNumberCell";`);
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.FormatNumber);
    if (format) {
      props.push(`format="${format}"`);
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowNumberCell value={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.DATE) {
    imports.push(`import RowDateCell from "~/components/entities/rows/cells/RowDateCell";`);
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.FormatDate);
    if (format) {
      props.push(`format="${format}"`);
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowDateCell value={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.SELECT) {
    imports.push(`import RowSelectedOptionCell from "~/components/entities/rows/cells/RowSelectedOptionCell";`);
    // const withColors = property.options.filter((f) => f.color).length > 0;
    // if (withColors) {
    imports.push(`import { Colors } from "~/application/enums/shared/Colors";`);
    // }
    props.push(
      `options={[${property.options.map((option) => {
        return `{ name: ${option.name === null ? "null" : `"${option.name}"`}, value: "${option.value}", color: ${getColor(option.color)} }`;
      })}]}`
    );
    let display: SelectOptionsDisplay = "Value";
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.SelectOptions);
    if (format) {
      display = format as SelectOptionsDisplay;
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowSelectedOptionCell value={item?.${property.name}} display="${display}" ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.BOOLEAN) {
    imports.push(`import RowBooleanCell from "~/components/entities/rows/cells/RowBooleanCell";`);
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.FormatBoolean);
    if (format) {
      props.push(`format="${format}"`);
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowBooleanCell value={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.MEDIA) {
    imports.push(`import RowMediaCell from "~/components/entities/rows/cells/RowMediaCell";`);
    if (PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max) === 1) {
      code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowMediaCell media={item.${property.name} ? [item.${property.name}] : []} ${props.join(" ")} />,
          },`);
    } else {
      code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowMediaCell media={item.${property.name}} ${props.join(" ")} />,
          },`);
    }
  } else if (property.type === PropertyType.MULTI_SELECT) {
    imports.push(`import PropertyMultipleValueBadge from "~/components/entities/properties/PropertyMultipleValueBadge";`);
    props.push(
      `options={[${property.options.map((option) => {
        return `{ name: ${option.name === null ? "null" : `"${option.name}"`}, value: "${option.value}" }`;
      })}]}`
    );
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <PropertyMultipleValueBadge values={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    imports.push(`import RowRangeNumberCell from "~/components/entities/rows/cells/RowRangeNumberCell";`);
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.FormatNumber);
    if (format) {
      props.push(`format="${format}"`);
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowRangeNumberCell value={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.RANGE_DATE) {
    imports.push(`import RowRangeDateCell from "~/components/entities/rows/cells/RowRangeDateCell";`);
    let format = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.FormatNumber);
    if (format) {
      props.push(`format="${format}"`);
    }
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <RowRangeDateCell value={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else if (property.type === PropertyType.MULTI_TEXT) {
    imports.push(`import PropertyMultipleValueBadge from "~/components/entities/properties/PropertyMultipleValueBadge";`);
    props.push(
      `options={[${property.options.map((option) => {
        return `{ name: ${option.name === null ? "null" : `"${option.name}"`}, value: "${option.value}" }`;
      })}]}`
    );
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <PropertyMultipleValueBadge values={item.${property.name}} ${props.join(" ")} />,
          },`);
  } else {
    code.push(`{
            name: "${property.name}",
            title: t("${property.title}"),
            value: (item) => <div> /* TODO: ${property.name} (${PropertyType[property.type]}) */</div>,
          },`);
  }
}

function schema({ code, property }: { code: string[]; property: PropertyWithDetails }) {
  const typeMap: Record<PropertyType, string> = {
    [PropertyType.TEXT]: "String",
    [PropertyType.NUMBER]: "Decimal",
    [PropertyType.DATE]: "DateTime",
    [PropertyType.SELECT]: "String",
    [PropertyType.BOOLEAN]: "Boolean",
    [PropertyType.MEDIA]: "TODO",
    [PropertyType.MULTI_SELECT]: "TODO",
    [PropertyType.MULTI_TEXT]: "TODO",
    [PropertyType.RANGE_NUMBER]: "TODO",
    [PropertyType.RANGE_DATE]: "TODO",
    [PropertyType.FORMULA]: "TODO",
  };

  const type = typeMap[property.type as PropertyType];
  if (type === undefined) {
    return;
  }

  const suffix = property.isRequired ? "" : "?";
  const schemaString = `  ${property.name} ${type}${suffix}`;
  code.push(schemaString);
}

export default {
  type,
  rowToDto,
  formToDto,
  createDtoToRow,
  updateDtoToRow,
  uiForm,
  uiCell,
  schema,
};
