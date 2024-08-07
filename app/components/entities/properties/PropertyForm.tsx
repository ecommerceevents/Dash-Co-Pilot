import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import FormGroup from "~/components/ui/forms/FormGroup";
import PencilAltIcon from "~/components/ui/icons/PencilAltIcon";
import ViewListIcon from "~/components/ui/icons/ViewListIcon";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputNumber from "~/components/ui/input/InputNumber";
import InputText from "~/components/ui/input/InputText";
import { PropertyWithDetails, EntitySimple } from "~/utils/db/entities/entities.db.server";
import StringUtils from "~/utils/shared/StringUtils";
import PropertyTypeSelector from "./PropertyTypeSelector";
import PropertyOptionsForm, { OptionValue, RefPropertyOptionsForm } from "./PropertyOptionsForm";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import PropertyAttribute from "./PropertyAttribute";
import PropertySubtypeSelector from "./PropertySubtypeSelector";
import PropertyFormulaSelector from "./PropertyFormulaSelector";
import { FormulaDto } from "~/modules/formulas/dtos/FormulaDto";
import { Link } from "@remix-run/react";

interface Props {
  item?: PropertyWithDetails;
  properties: PropertyWithDetails[];
  entities: EntitySimple[];
  formulas: FormulaDto[];
}

export default function PropertyForm({ item, properties, entities, formulas }: Props) {
  const { t } = useTranslation();

  const selectOptionsForm = useRef<RefPropertyOptionsForm>(null);

  // TODO: Implement User, Role, Entity and Formula types

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);

  const [order, setOrder] = useState<number | undefined>(item?.order ?? Math.max(...properties.map((o) => o.order)) + 1);
  const [name, setName] = useState<string>(item?.name ?? "");
  const [title, setTitle] = useState<string>(item?.title ?? "");
  const [type, setType] = useState<PropertyType>(item?.type ?? PropertyType.TEXT);
  const [subtype, setSubtype] = useState<string>(item?.subtype ?? "");
  const [formulaId, setFormulaId] = useState(item?.formulaId ?? undefined);
  const [options, setOptions] = useState<OptionValue[]>(
    item?.options?.map((o) => {
      return {
        id: o.id,
        order: o.order,
        value: o.value,
        name: o.name,
        color: o.color,
      };
    }) ?? []
  );
  const [isRequired, setIsRequired] = useState<boolean>(item?.isRequired ?? true);
  const [showInCreate, setShowInCreate] = useState<boolean>(item?.showInCreate ?? true);
  const [isHidden, setIsHidden] = useState<boolean>(item?.isHidden ?? false);
  const [isDisplay, setIsDisplay] = useState<boolean>(item?.isDisplay ?? properties.filter((f) => !f.isDefault).length === 0);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(item?.isReadOnly ?? false);
  const [canUpdate, setCanUpdate] = useState<boolean>(item ? item.canUpdate : true);
  const [attributes, setAttributes] = useState<{ name: string; value: string | undefined }[]>(item?.attributes ?? []);

  // const [formula, setFormula] = useState<string>();

  const [titleEnabled, setTitleEnabled] = useState(false);

  useEffect(() => {
    if (!item) {
      if (title.includes(".")) {
        const keys = title.split(".");
        setName(StringUtils.toCamelCase(keys[keys.length - 1].toLowerCase()));
      } else {
        setName(StringUtils.toCamelCase(title.toLowerCase()));
      }
    }
  }, [item, title, type]);

  useEffect(() => {
    const formula = formulas.find((f) => f.id === formulaId);
    if (!item && formula) {
      setTitle(formula.name);
      setName(StringUtils.toCamelCase(formula.name.toLowerCase()));
    }
  }, [item, formulaId, formulas]);

  useEffect(() => {
    setTitleEnabled(true);
    if (!item) {
      if (type === PropertyType.TEXT) {
        setSubtype("singleLine");
      } else if (type === PropertyType.SELECT) {
        setSubtype("dropdown");
      } else if (type === PropertyType.MULTI_SELECT) {
        setSubtype("combobox");
      } else {
        // setSubtype("");
      }
    } else {
      if (type === PropertyType.TEXT) {
        if (!subtype || !["singleLine", "email", "phone", "url"].includes(subtype)) {
          setSubtype("singleLine");
        }
      } else if (type === PropertyType.SELECT) {
        if (!subtype || !["dropdown", "radioGroupCards"].includes(subtype)) {
          setSubtype("dropdown");
        }
      } else if (type === PropertyType.MULTI_SELECT) {
        if (!subtype || !["combobox", "checkboxCards"].includes(subtype)) {
          setSubtype("combobox");
        }
      } else {
        // setSubtype("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, type]);

  useEffect(() => {
    if (type === PropertyType.FORMULA) {
      setShowAdvancedOptions(false);
      setIsRequired(false);
      setIsReadOnly(true);
      setShowInCreate(false);
    }
  }, [type]);

  return (
    <>
      <FormGroup
        id={item?.id}
        editing={true}
        canDelete={item !== undefined && !item?.isDefault && showAdvancedOptions}
        className="space-y-2 pb-4"
        classNameFooter="px-4"
      >
        <input type="hidden" name="order" value={order} hidden readOnly />

        <div className="mt-4">
          <div className="space-y-3 px-4">
            <div className="w-full">
              <label htmlFor="type" className="block text-xs font-medium text-gray-700">
                {t("models.property.type")}
              </label>
              <div className="mt-1">
                <PropertyTypeSelector selected={type} onSelected={(e) => setType(e)} />
              </div>
            </div>
            {type === PropertyType.TEXT && (
              <div>
                <label htmlFor="subtype" className="block text-xs font-medium text-gray-700">
                  {t("models.property.subtype")}
                </label>
                <div className="mt-1">
                  <PropertySubtypeSelector types={["singleLine", "email", "phone", "url"]} selected={subtype} onSelected={(e) => setSubtype(e)} />
                </div>
              </div>
            )}
            {type === PropertyType.SELECT && (
              <div>
                <label htmlFor="subtype" className="block text-xs font-medium text-gray-700">
                  {t("models.property.subtype")}
                </label>
                <div className="mt-1">
                  <PropertySubtypeSelector types={["dropdown", "radioGroupCards"]} selected={subtype} onSelected={(e) => setSubtype(e)} />
                </div>
              </div>
            )}
            {type === PropertyType.MULTI_SELECT && (
              <div>
                <label htmlFor="subtype" className="block text-xs font-medium text-gray-700">
                  {t("models.property.subtype")}
                </label>
                <div className="mt-1">
                  <PropertySubtypeSelector types={["combobox", "checkboxCards"]} selected={subtype} onSelected={(e) => setSubtype(e)} />
                </div>
              </div>
            )}
            {type === PropertyType.FORMULA && (
              <div>
                <div className="flex justify-between space-x-2">
                  <label htmlFor="formula" className="block text-xs font-medium text-gray-700">
                    {t("models.property.formula")}
                  </label>
                  {item?.formulaId ? (
                    <Link to={`/admin/entities/formulas/${item?.formulaId}`} className="text-xs text-blue-500 hover:underline">
                      Go to formula
                    </Link>
                  ) : (
                    <Link to={`/admin/entities/formulas`} className="text-xs text-blue-500 hover:underline">
                      View formulas
                    </Link>
                  )}
                </div>
                <div className="mt-1">
                  <PropertyFormulaSelector name="formula-id" items={formulas} selected={formulaId} onSelected={(e) => setFormulaId(e)} />
                </div>
              </div>
            )}
            {titleEnabled && (
              <InputText
                name="title"
                title={t("models.property.title")}
                value={title}
                setValue={(e) => setTitle(e)}
                disabled={!titleEnabled}
                required
                withTranslation
                placeholder="Property title..."
                autoFocus
              />
            )}
            <InputText
              name="name"
              title={t("models.property.name")}
              value={name}
              setValue={(e) => setName(e)}
              required
              placeholder="Property name..."
              pattern="[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?"
              hint={<span className="font-normal italic text-gray-400">Camel case</span>}
            />

            <div className="w-full rounded-md border border-dotted border-gray-300 px-2 py-0">
              <InputCheckboxWithDescription
                name="is-display"
                title={t("models.property.isDisplay")}
                description="Displays value in related rows"
                value={isDisplay}
                setValue={setIsDisplay}
              />
            </div>

            {/* {type === PropertyType.FORMULA && (
              <div className="w-full">
                <label htmlFor="formula" className="block text-xs font-medium text-gray-700">
                  {t("entities.fields.FORMULA")}
                </label>
                <div className="mt-1">
                  <InputText
                    name="formula"
                    title={t("models.property.formula")}
                    value={formula}
                    setValue={(e) => setFormula(e.toString())}
                    disabled={!titleEnabled}
                    required
                  />
                </div>
              </div>
            )} */}
            {[PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(type) && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ViewListIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    {options.map((option) => {
                      return <input key={option.order} hidden readOnly type="text" id="options[]" name="options[]" value={JSON.stringify(option)} />;
                    })}
                    <input
                      disabled
                      className="focus:border-accent-500 focus:ring-accent-500 block w-full rounded-none rounded-l-md border border-gray-300 bg-gray-100 pl-10 text-gray-800 sm:text-sm"
                      value={options.length === 0 ? "No dropdown values defined" : options.map((f) => f.value).join(", ")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => selectOptionsForm.current?.set(options)}
                    className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1"
                  >
                    <PencilAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>Set</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex">
              <ButtonTertiary onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                {!showAdvancedOptions ? "Show advanced options" : "Hide advanced options"}
              </ButtonTertiary>
            </div>
          </div>

          <div className={clsx("my-2 space-y-3 border border-dashed border-gray-300 bg-gray-50 px-4 py-3", showAdvancedOptions ? "" : "hidden")}>
            <div className="w-full">
              <InputNumber name="order" title={t("models.property.order")} value={order} setValue={setOrder} />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="show-in-create"
                title={t("models.property.showInCreate")}
                description="Shows in create form"
                value={showInCreate}
                setValue={setShowInCreate}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-required"
                title={t("models.property.isRequired")}
                description="Forces user to set value"
                value={isRequired}
                setValue={setIsRequired}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-hidden"
                title={t("models.property.isHidden")}
                description="Defines if visible in forms, views and reports"
                value={isHidden}
                setValue={setIsHidden}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-read-only"
                title={t("models.property.isReadOnly")}
                description="Defines if user can edit value"
                value={isReadOnly}
                setValue={setIsReadOnly}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="can-update"
                title={t("models.property.canUpdate")}
                description="Defines if user can update value"
                value={canUpdate}
                setValue={setCanUpdate}
              />
            </div>

            {/* <div className="font-bold">{t("models.propertyAttribute.plural")}</div> */}

            {attributes.map((attribute) => {
              return <input key={attribute.name} hidden readOnly type="text" id="attributes[]" name="attributes[]" value={JSON.stringify(attribute)} />;
            })}

            {PropertyAttributeHelper.getAttributesByType(type, attributes).map((item) => {
              return (
                <PropertyAttribute
                  className="mb-2"
                  key={item}
                  name={item}
                  title={PropertyAttributeHelper.getAttributeTitle(t, item)}
                  value={attributes.find((f) => f.name === item)?.value ?? undefined}
                  setValue={(e) => {
                    const value = { name: item, value: e?.toString() };
                    const found = attributes.find((f) => f.name === item);
                    if (found) {
                      setAttributes([...attributes.filter((f) => f.name !== item), value]);
                    } else {
                      setAttributes([...attributes, value]);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </FormGroup>
      <PropertyOptionsForm ref={selectOptionsForm} title={title} onSet={(e) => setOptions(e)} />
    </>
  );
}
