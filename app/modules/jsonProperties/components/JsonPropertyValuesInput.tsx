import InputText from "~/components/ui/input/InputText";
import { JsonPropertyDto } from "../dtos/JsonPropertyTypeDto";
import { JsonPropertiesValuesDto, JsonValue } from "../dtos/JsonPropertiesValuesDto";
import InputNumber from "~/components/ui/input/InputNumber";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputDate from "~/components/ui/input/InputDate";
import InputImage from "~/components/ui/input/InputImage";
import InputSelect from "~/components/ui/input/InputSelect";
import InputCombobox from "~/components/ui/input/InputCombobox";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";
import clsx from "clsx";
import NovelEditor from "~/modules/novel/ui/editor";
import InputGroup from "~/components/ui/forms/InputGroup";

export default function JsonPropertyValuesInput({
  prefix = "attributes",
  properties,
  attributes,
}: {
  prefix?: string;
  properties: JsonPropertyDto[] | JsonValue | null;
  attributes: JsonPropertiesValuesDto | null;
}) {
  let propertiesObj = properties as JsonPropertyDto[] | null;
  if (!propertiesObj) {
    return null;
  }
  const groups: { name: string; properties: JsonPropertyDto[] }[] = [];
  propertiesObj.forEach((property) => {
    let group = groups.find((g) => g.name === property.group);
    if (!group) {
      group = { name: property.group || "", properties: [] };
      groups.push(group);
    }
    group.properties.push(property);
  });
  return (
    <Fragment>
      {groups.map((group, idx) => {
        return (
          <Fragment key={idx}>
            {group.name ? (
              <InputGroup title={group.name} className="space-y-2">
                <GroupInputs prefix={prefix} properties={group.properties} attributes={attributes} />
              </InputGroup>
            ) : (
              <GroupInputs prefix={prefix} properties={group.properties} attributes={attributes} />
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
}

function GroupInputs({ prefix, properties, attributes }: { prefix: string; properties: JsonPropertyDto[]; attributes: JsonPropertiesValuesDto | null }) {
  let propertiesObj = properties as JsonPropertyDto[] | null;
  return (
    <Fragment>
      {propertiesObj?.map((property) => {
        return (
          <div key={property.name}>
            <JsonPropertyInput prefix={prefix} property={property} attributes={attributes} />
          </div>
        );
      })}
    </Fragment>
  );
}

function JsonPropertyInput({ prefix, property, attributes }: { prefix: string; property: JsonPropertyDto; attributes: JsonPropertiesValuesDto | null }) {
  const { t } = useTranslation();
  let value: JsonValue | undefined = attributes ? attributes[property.name] : undefined;

  switch (property.type) {
    case "string":
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <InputText name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={stringValue} required={property.required} />
        </div>
      );
    case "number": {
      let numberValue = value === undefined ? undefined : (value as number);
      const defaultNumberValue = property.defaultValue === undefined ? undefined : (property.defaultValue as number);
      if (numberValue === undefined && defaultNumberValue !== undefined) {
        numberValue = defaultNumberValue;
      }
      return (
        <div>
          <InputNumber name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={numberValue} required={property.required} />
        </div>
      );
    }
    case "boolean": {
      let booleanValue = value === undefined ? undefined : value === "true" || value === true || value === 1 || value === "1";
      const defaultBooleanValue =
        property.defaultValue === undefined
          ? undefined
          : property.defaultValue === "true" || property.defaultValue === true || property.defaultValue === 1 || property.defaultValue === "1";
      if (booleanValue === undefined && defaultBooleanValue !== undefined) {
        booleanValue = defaultBooleanValue;
      }
      return (
        <div>
          <InputCheckbox name={`${prefix}[${property.name}]`} title={t(property.title)} value={booleanValue} required={property.required} />
        </div>
      );
    }
    case "date": {
      let dateValue = !value ? undefined : new Date(value as string);
      const defaultDateValue = property.defaultValue === undefined ? undefined : new Date(property.defaultValue as string);
      if (dateValue === undefined && defaultDateValue !== undefined) {
        dateValue = defaultDateValue;
      }
      return (
        <div>
          <InputDate name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={dateValue} required={property.required} />
        </div>
      );
    }
    case "image": {
      let imageValue = value === undefined ? undefined : (value as string);
      const defaultImageValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (imageValue === undefined && defaultImageValue !== undefined) {
        imageValue = defaultImageValue;
      }
      return (
        <div>
          <InputImage name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={imageValue} required={property.required} />
        </div>
      );
    }
    case "select": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <InputSelect
            name={`${prefix}[${property.name}]`}
            title={t(property.title)}
            defaultValue={stringValue}
            required={property.required}
            options={property.options?.filter((f) => f.value) || []}
            placeholder={`${t("shared.select")}...`}
          />
        </div>
      );
    }
    case "multiselect": {
      let arrValue = value === undefined ? [] : (value as Array<string>);
      const defaultArrValue = property.defaultValue === undefined ? [] : (property.defaultValue as Array<string>);
      if (!value && defaultArrValue.length > 0) {
        arrValue = defaultArrValue;
      }
      return <JsonMultiSelectInput prefix={prefix} property={property} initial={arrValue} />;
    }
    case "wysiwyg": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <InputText
            name={`${prefix}[${property.name}]`}
            title={t(property.title)}
            defaultValue={stringValue}
            required={property.required}
            editor="wysiwyg"
            editorSize="md"
          />
        </div>
      );
    }
    case "monaco": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <InputText
            name={`${prefix}[${property.name}]`}
            title={t(property.title)}
            defaultValue={stringValue}
            required={property.required}
            editor="monaco"
            editorLanguage="markdown"
            editorSize="md"
          />
        </div>
      );
    }
    case "content": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return <ContentForm prefix={prefix} property={property} value={stringValue} />;
    }
    default:
      return null;
  }
}

function JsonMultiSelectInput({ prefix, property, initial }: { prefix: string; property: JsonPropertyDto; initial: string[] }) {
  const { t } = useTranslation();
  const [actualValue, setActualValue] = useState<(string | number)[]>(initial);
  return (
    <div>
      {actualValue?.map((item, idx) => {
        return <input key={idx} type="hidden" name={`${prefix}[${property.name}][]`} value={item} />;
      })}
      <InputCombobox
        title={t(property.title)}
        value={actualValue}
        onChange={setActualValue}
        required={property.required}
        options={property.options?.filter((f) => f.value) || []}
        withSearch={false}
      />
    </div>
  );
}

function ContentForm({ prefix, property, value }: { prefix: string; property: JsonPropertyDto; value: string | undefined }) {
  const [content, setContent] = useState(value);
  const [contentType, setContentType] = useState("wysiwyg");

  return (
    <div className="space-y-2">
      <div className="grid gap-3">
        <div className="space-y-2">
          <div className="flex justify-between space-x-2">
            {/* <label className="text-sm font-medium text-gray-600">Article</label> */}
            <div className="flex items-center space-x-1">
              <button type="button" onClick={() => setContentType("wysiwyg")} className="text-xs text-gray-600 hover:underline">
                <div className={clsx(contentType === "wysiwyg" ? "font-bold" : "")}>WYSIWYG</div>
              </button>
              <div>•</div>
              <button type="button" onClick={() => setContentType("markdown")} className="text-xs text-gray-600 hover:underline">
                <div className={clsx(contentType === "markdown" ? "font-bold" : "")}>Markdown</div>
              </button>
            </div>
          </div>
          <input name="contentType" value={contentType} readOnly hidden />
          {contentType === "wysiwyg" ? (
            <div className="h-[calc(100vh-320px)] overflow-y-auto">
              <input type="hidden" name="content" value={content} hidden readOnly />
              <NovelEditor content={content} onChange={(e) => setContent(e.html ?? "")} usingLocalStorage={false} />
            </div>
          ) : contentType === "markdown" ? (
            <InputText
              className="col-span-12 h-[calc(100vh-320px)] overflow-y-auto"
              rows={6}
              editor="monaco"
              editorLanguage="markdown"
              editorTheme="vs-dark"
              editorFontSize={14}
              name="content"
              value={content}
              setValue={(e) => setContent(e.toString())}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
