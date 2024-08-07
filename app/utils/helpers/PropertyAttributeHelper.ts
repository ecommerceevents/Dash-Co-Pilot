import { TFunction } from "i18next";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "../db/entities/entities.db.server";
import { BooleanFormats } from "../shared/BooleanUtils";
import { DateFormats } from "../shared/DateUtils";
import { NumberFormats } from "../shared/NumberUtils";
import { SeparatorFormats } from "../shared/SeparatorUtils";
import { SelectOptionsFormats } from "../shared/SelectOptionsUtils";

function getAttributesByType(type: PropertyType, attributes?: { name: string; value: string | undefined }[]): PropertyAttributeName[] {
  const commonAttributes = [
    PropertyAttributeName.HintText,
    PropertyAttributeName.HelpText,
    PropertyAttributeName.Icon,
    PropertyAttributeName.Columns,
    PropertyAttributeName.Group,
  ];
  switch (type) {
    case PropertyType.TEXT:
      const editor = attributes?.find((f) => f.name === PropertyAttributeName.Editor);
      if (editor?.value === "monaco") {
        return [PropertyAttributeName.Editor, PropertyAttributeName.EditorLanguage];
      } else if (editor?.value === "wysiwyg") {
        return [PropertyAttributeName.Editor, PropertyAttributeName.EditorSize];
      }
      return [
        PropertyAttributeName.DefaultValue,
        PropertyAttributeName.Placeholder,
        PropertyAttributeName.Min,
        PropertyAttributeName.Max,
        PropertyAttributeName.Rows,
        PropertyAttributeName.Pattern,
        PropertyAttributeName.Uppercase,
        PropertyAttributeName.Lowercase,
        PropertyAttributeName.Password,
        PropertyAttributeName.Editor,
        ...commonAttributes,
      ];
    case PropertyType.NUMBER:
      return [
        PropertyAttributeName.DefaultValue,
        PropertyAttributeName.Placeholder,
        PropertyAttributeName.Min,
        PropertyAttributeName.Max,
        PropertyAttributeName.Step,
        PropertyAttributeName.FormatNumber,
        ...commonAttributes,
      ];
    case PropertyType.DATE:
      return [PropertyAttributeName.FormatDate, ...commonAttributes];
    case PropertyType.SELECT:
      return [PropertyAttributeName.SelectOptions, PropertyAttributeName.DefaultValue, PropertyAttributeName.Placeholder, ...commonAttributes];
    case PropertyType.BOOLEAN:
      return [PropertyAttributeName.DefaultValue, PropertyAttributeName.FormatBoolean, ...commonAttributes];
    case PropertyType.MEDIA:
      return [PropertyAttributeName.Min, PropertyAttributeName.Max, PropertyAttributeName.AcceptFileTypes, PropertyAttributeName.MaxSize, ...commonAttributes];
    case PropertyType.MULTI_TEXT:
      return [PropertyAttributeName.Separator, ...commonAttributes];
    case PropertyType.RANGE_NUMBER:
      return [PropertyAttributeName.FormatNumber];
    case PropertyType.RANGE_DATE:
      return [PropertyAttributeName.FormatDate];
    default:
      return [];
  }
}

function getAttributeTitle(t: TFunction, name: PropertyAttributeName) {
  switch (name) {
    case PropertyAttributeName.HintText:
      return t("models.propertyAttribute.hintText");
    case PropertyAttributeName.HelpText:
      return t("models.propertyAttribute.helpText");
    case PropertyAttributeName.Icon:
      return t("models.propertyAttribute.icon");
    case PropertyAttributeName.Pattern:
      return t("models.propertyAttribute.pattern");
    case PropertyAttributeName.Min:
      return t("models.propertyAttribute.min");
    case PropertyAttributeName.Max:
      return t("models.propertyAttribute.max");
    case PropertyAttributeName.Step:
      return t("models.propertyAttribute.step");
    case PropertyAttributeName.Rows:
      return t("models.propertyAttribute.rows");
    case PropertyAttributeName.DefaultValue:
      return t("models.propertyAttribute.defaultValue");
    case PropertyAttributeName.Uppercase:
      return t("models.propertyAttribute.uppercase");
    case PropertyAttributeName.Lowercase:
      return t("models.propertyAttribute.lowercase");
    case PropertyAttributeName.Placeholder:
      return t("models.propertyAttribute.placeholder");
    case PropertyAttributeName.AcceptFileTypes:
      return t("models.propertyAttribute.acceptFileTypes");
    case PropertyAttributeName.MaxSize:
      return t("models.propertyAttribute.maxSize");
    case PropertyAttributeName.Editor:
      return t("models.propertyAttribute.editor");
    case PropertyAttributeName.EditorLanguage:
      return t("models.propertyAttribute.editorLanguage");
    case PropertyAttributeName.EditorSize:
      return t("models.propertyAttribute.editorSize");
    case PropertyAttributeName.Columns:
      return t("models.propertyAttribute.columns");
    case PropertyAttributeName.Group:
      return t("models.propertyAttribute.group");
    case PropertyAttributeName.FormatNumber:
    case PropertyAttributeName.FormatDate:
    case PropertyAttributeName.FormatBoolean:
      return t("models.propertyAttribute.format");
    case PropertyAttributeName.Separator:
      return t("models.propertyAttribute.separator");
    case PropertyAttributeName.SelectOptions:
      return t("models.propertyAttribute.selectOptions");
    case PropertyAttributeName.Password:
      return t("models.propertyAttribute.password");
    default:
      return "Unknown Property Attribute";
  }
}

function getPropertyAttributeValue(property: PropertyWithDetails, name: PropertyAttributeName) {
  const attribute = property.attributes.find((a) => a.name === name);
  if (attribute) {
    return attribute.value;
  }
  return undefined;
}

function getPropertyAttributeValue_String(property: PropertyWithDetails, name: PropertyAttributeName) {
  return getPropertyAttributeValue(property, name);
}

function getPropertyAttributeValue_Number(property: PropertyWithDetails, name: PropertyAttributeName) {
  const value = getPropertyAttributeValue(property, name);
  if (value) {
    return Number(value);
  }
  return undefined;
}

function getPropertyAttributeValue_Boolean(property: PropertyWithDetails, name: PropertyAttributeName) {
  const value = getPropertyAttributeValue(property, name);
  if (value) {
    return value === "true";
  }
  return undefined;
}

function getPropertyAttributeOptions(name: PropertyAttributeName) {
  if (name === PropertyAttributeName.Editor) {
    return [
      { name: "Monaco", value: "monaco" },
      { name: "WYSIWYG", value: "wysiwyg" },
      { name: "iframe", value: "iframe" },
    ];
  } else if (name === PropertyAttributeName.EditorLanguage) {
    return [
      { name: "Markdown", value: "markdown" },
      { name: "TypeScript", value: "typescript" },
      { name: "JavaScript", value: "javascript" },
      { name: "HTML", value: "html" },
      { name: "CSS", value: "css" },
    ];
  } else if (name === PropertyAttributeName.EditorSize) {
    return [
      { name: "Small", value: "sm" },
      { name: "Medium", value: "md" },
      { name: "Large", value: "lg" },
      { name: "Auto", value: "auto" },
      // { name: "Full", value: "full" },
      { name: "Screen", value: "screen" },
    ];
  } else if (name === PropertyAttributeName.FormatNumber) {
    return NumberFormats;
  } else if (name === PropertyAttributeName.FormatDate) {
    return DateFormats;
  } else if (name === PropertyAttributeName.FormatBoolean) {
    return BooleanFormats;
  } else if (name === PropertyAttributeName.Separator) {
    return SeparatorFormats;
  } else if (name === PropertyAttributeName.SelectOptions) {
    return SelectOptionsFormats;
  }
  return [];
}

export default {
  getAttributesByType,
  getAttributeTitle,
  getPropertyAttributeValue_String,
  getPropertyAttributeValue_Number,
  getPropertyAttributeValue_Boolean,
  getPropertyAttributeOptions,
};
