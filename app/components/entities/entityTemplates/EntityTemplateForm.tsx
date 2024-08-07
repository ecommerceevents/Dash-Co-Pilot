import { EntityTemplate } from "@prisma/client";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputDate from "~/components/ui/input/InputDate";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import NovelEditor from "~/modules/novel/ui/editor";

interface Props {
  entity: EntityWithDetails;
  item?: EntityTemplate;
}

export default function EntityTemplateForm({ entity, item }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const [title, setTitle] = useState<string>(item?.title ?? "");
  const [config, setConfig] = useState<{ [key: string]: any }>(item?.config ? JSON.parse(item?.config) : {});

  function onSubmit(formData: FormData) {
    formData.set("config", JSON.stringify(config));
    submit(formData, {
      method: "post",
    });
  }
  return (
    <FormGroup onSubmit={onSubmit} id={item?.id} editing={true}>
      <InputText name="title" title="Title" value={title} setValue={setTitle} required />
      {entity.properties
        .filter((f) => !f.isDefault)
        .sort((a, b) => a.order - b.order)
        .map((property) => {
          return (
            <div key={property.name}>
              {property.type === PropertyType.TEXT ? (
                <>
                  {PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Editor) === "wysiwyg" ? (
                    <div className="h-52 overflow-y-auto">
                      <div>
                        <label htmlFor={property.name} className="mb-1 block text-xs font-medium text-gray-600">
                          {t(property.title)}
                        </label>
                        <NovelEditor
                          autoFocus={false}
                          content={config[property.name]}
                          onChange={(e) => {
                            setConfig({ ...config, [property.name]: e.html });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <InputText
                      name={property.name}
                      title={t(property.title)}
                      value={config[property.name]}
                      setValue={(e) => setConfig({ ...config, [property.name]: e })}
                    />
                  )}
                </>
              ) : property.type === PropertyType.BOOLEAN ? (
                <InputCheckbox
                  name={property.name}
                  title={t(property.title)}
                  value={config[property.name] === "false" ? false : config[property.name] === "true" ? true : config[property.name]}
                  setValue={(e) => setConfig({ ...config, [property.name]: e })}
                />
              ) : property.type === PropertyType.DATE ? (
                <InputDate
                  name={property.name}
                  title={t(property.title)}
                  value={config[property.name]}
                  onChange={(e) => setConfig({ ...config, [property.name]: e })}
                />
              ) : property.type === PropertyType.NUMBER ? (
                <InputNumber
                  name={property.name}
                  title={t(property.title)}
                  value={config[property.name]}
                  setValue={(e) => setConfig({ ...config, [property.name]: e })}
                />
              ) : property.type === PropertyType.SELECT ? (
                <InputSelector
                  name={property.name}
                  title={t(property.title)}
                  value={config[property.name]}
                  setValue={(e) => setConfig({ ...config, [property.name]: e })}
                  options={property.options}
                />
              ) : (
                <div>Property type not supported for template values: {PropertyType[property.type]}</div>
              )}
            </div>
          );
        })}
    </FormGroup>
  );
}
