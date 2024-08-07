/* eslint-disable no-console */
import FormHelper from "~/utils/helpers/FormHelper";
import { JsonPropertiesValuesDto } from "../dtos/JsonPropertiesValuesDto";
import { JsonPropertyDto } from "../dtos/JsonPropertyTypeDto";

function getValuesFromForm({
  properties,
  form,
  prefix = "attributes",
}: {
  properties: JsonPropertyDto[] | undefined;
  form: FormData;
  prefix?: string;
}): JsonPropertiesValuesDto {
  const propertiesValues: JsonPropertiesValuesDto = {};
  if (!properties || properties.length === 0) {
    return propertiesValues;
  }
  properties.forEach((prop) => {
    propertiesValues[prop.name] = getValueFromForm({ property: prop, form, prefix });
  });
  // eslint-disable-next-line no-console
  console.log("properties", propertiesValues);

  return propertiesValues;
}

function getValueFromForm({ property, form, prefix = "properties" }: { property: JsonPropertyDto; form: FormData; prefix?: string }): any {
  switch (property.type) {
    case "string":
    case "wysiwyg":
    case "monaco":
    case "content": {
      const value = FormHelper.getText(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] string`, value);
      return value;
    }
    case "number": {
      const value = FormHelper.getNumber(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] number`, value);
      return value;
    }
    case "boolean": {
      const value = FormHelper.getBoolean(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] boolean`, value);
      return value;
    }
    case "date": {
      const value = FormHelper.getDate(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] date`, value);
      return value;
    }
    case "image": {
      const value = FormHelper.getText(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] image`, value);
      return value;
    }
    case "select": {
      const value = FormHelper.getText(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] select`, value);
      return value;
    }
    case "multiselect": {
      const value = FormHelper.getJsonArray(form, `${prefix}[${property.name}]`);
      console.log(`[${property.name}] multiselect`, value);
      return value;
    }
    default:
      console.warn(`[${property.name}] default`, undefined);
      break;
  }
}

const allProperties: JsonPropertyDto[] = [
  {
    type: "string",
    name: "string",
    title: "String",
    required: true,
    defaultValue: "test",
  },
  {
    type: "string",
    name: "stringNotRequired",
    title: "String Not Required",
    required: false,
    defaultValue: "test2",
  },
  {
    type: "number",
    name: "number",
    title: "Number",
    required: true,
    defaultValue: 10,
  },
  {
    type: "number",
    name: "numberNotRequired",
    title: "Number Not Required",
    required: false,
    defaultValue: 20,
  },
  {
    type: "boolean",
    name: "boolean",
    title: "Boolean",
    required: true,
    defaultValue: true,
  },
  {
    type: "boolean",
    name: "booleanNotRequired",
    title: "Boolean Not Required",
    required: false,
    defaultValue: false,
  },
  {
    type: "date",
    name: "date",
    title: "Date",
    required: true,
    defaultValue: new Date().toISOString(),
  },
  {
    type: "date",
    name: "dateNotRequired",
    title: "Date Not Required",
    required: false,
    defaultValue: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
  },
  {
    type: "image",
    name: "image",
    title: "Image",
    required: true,
    defaultValue: "https://via.placeholder.com/150",
  },
  {
    type: "image",
    name: "imageNotRequired",
    title: "Image Not Required",
    required: false,
    defaultValue: "https://via.placeholder.com/250",
  },
  {
    type: "select",
    name: "select",
    title: "Select",
    required: true,
    defaultValue: "option1",
    options: [
      { name: "Option 1", value: "option1" },
      { name: "Option 2", value: "option2" },
    ],
  },
  {
    type: "select",
    name: "selectNotRequired",
    title: "Select Not Required",
    required: false,
    defaultValue: "option2",
    options: [
      { name: "Option 1", value: "option1" },
      { name: "Option 2", value: "option2" },
    ],
  },
  {
    type: "multiselect",
    name: "multiselect",
    title: "Multi-select",
    required: true,
    defaultValue: ["option1"],
    options: [
      { name: "Option 1", value: "option1" },
      { name: "Option 2", value: "option2" },
    ],
  },
  {
    type: "multiselect",
    name: "multiselectNotRequired",
    title: "Multi-select Not Required",
    required: false,
    defaultValue: ["option1", "option2"],
    options: [
      { name: "Option 1", value: "option1" },
      { name: "Option 2", value: "option2" },
    ],
  },
];

export default {
  getValuesFromForm,
  allProperties,
};
