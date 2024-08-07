import { RowMedia, RowValueMultiple, RowValueRange } from "@prisma/client";
import { Ref, useImperativeHandle, useRef, useState, useEffect, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import InputDate, { RefInputDate } from "~/components/ui/input/InputDate";
import InputNumber, { RefInputNumber } from "~/components/ui/input/InputNumber";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { PropertyWithDetails, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputMedia from "~/components/ui/input/InputMedia";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { marked } from "marked";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import InputMultiText, { RefInputMultiText } from "~/components/ui/input/InputMultiText";
import PropertyMultiSelector from "../properties/PropertyMultiSelector";
import InputRangeNumber from "~/components/ui/input/ranges/InputRangeNumber";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import InputRangeDate from "~/components/ui/input/ranges/InputRangeDate";
import { getSeparator } from "~/utils/shared/SeparatorUtils";
import InputTextSubtype from "~/components/ui/input/subtypes/InputTextSubtype";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";
import InputSelect from "~/components/ui/input/InputSelect";
import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";

export interface RefRowValueInput {
  focus: () => void;
}

interface Props {
  selected: PropertyWithDetails | undefined;
  entity: EntityWithDetails;
  textValue: string | undefined;
  numberValue: number | undefined;
  dateValue: Date | undefined;
  booleanValue: boolean | undefined;
  multiple: RowValueMultiple[] | undefined;
  range: RowValueRange | undefined;
  initialMedia?: RowMedia[] | undefined;
  initialOption?: string | undefined;
  onChange?: (value: string | number | Date | boolean | undefined | null) => void;
  onChangeOption?: (option: string | undefined) => void;
  onChangeMedia?: (option: MediaDto[]) => void;
  onChangeMultiple?: (option: RowValueMultipleDto[]) => void;
  onChangeRange?: (option: RowValueRangeDto | undefined) => void;
  readOnly: boolean;
  className?: string;
  autoFocus?: boolean;
  promptFlows?: { rowId: string | undefined; prompts: PromptFlowWithDetails[] } | undefined;
}

const RowValueInput = (
  {
    entity,
    selected,
    textValue,
    numberValue,
    dateValue,
    booleanValue,
    multiple,
    range,
    initialMedia,
    initialOption,
    onChange,
    onChangeOption,
    onChangeMedia,
    onChangeMultiple,
    onChangeRange,
    className,
    readOnly,
    autoFocus,
    promptFlows,
  }: Props,
  ref: Ref<RefRowValueInput>
) => {
  useImperativeHandle(ref, () => ({ focus }));

  const { t } = useTranslation();

  const numberInput = useRef<RefInputNumber>(null);
  const textInput = useRef<RefInputText>(null);
  const dateInput = useRef<RefInputDate>(null);
  const multipleInput = useRef<RefInputMultiText>(null);

  const [media, setMedia] = useState<MediaDto[]>([]);

  function focus() {
    if (selected?.type === PropertyType.TEXT) {
      textInput.current?.input.current?.focus();
    } else if (selected?.type === PropertyType.NUMBER) {
      numberInput.current?.input.current?.focus();
    } else if (selected?.type === PropertyType.DATE) {
      dateInput.current?.input.current?.focus();
    }
  }

  useEffect(() => {
    if (selected?.type === PropertyType.MEDIA) {
      if (onChangeMedia) {
        onChangeMedia(media);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  return (
    <>
      {selected?.type === PropertyType.TEXT ? (
        <>
          {["monaco", "wysiwyg", "iframe"].includes(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Editor) ?? "") &&
          readOnly ? (
            <></>
          ) : (
            <>
              <InputTextSubtype
                subtype={selected.subtype as any}
                name={selected.name}
                title={t(selected.title)}
                value={textValue}
                setValue={(e) => (onChange ? onChange(e.toString()) : undefined)}
                required={selected.isRequired}
                className={className}
                readOnly={readOnly}
                disabled={readOnly}
                pattern={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Pattern)}
                minLength={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min)}
                maxLength={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Max)}
                rows={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Rows)}
                placeholder={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Placeholder)}
                hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
                help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
                icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
                uppercase={PropertyAttributeHelper.getPropertyAttributeValue_Boolean(selected, PropertyAttributeName.Uppercase)}
                lowercase={PropertyAttributeHelper.getPropertyAttributeValue_Boolean(selected, PropertyAttributeName.Lowercase)}
                password={PropertyAttributeHelper.getPropertyAttributeValue_Boolean(selected, PropertyAttributeName.Password)}
                editor={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Editor)}
                editorLanguage={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.EditorLanguage)}
                editorSize={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.EditorSize) as any}
                autoFocus={autoFocus}
                promptFlows={promptFlows}
              />
            </>
          )}

          {["iframe"].includes(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Editor) ?? "") && readOnly && (
            <div className="overflow-auto">
              <iframe title={t(selected.title)} src={textValue} className="h-96 w-full" />
            </div>
          )}
          {["monaco", "wysiwyg"].includes(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Editor) ?? "") &&
            readOnly && (
              <div className="overflow-auto">
                <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
                  <span>{t(selected.title)}</span>
                </label>
                <div className="prose h-auto rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(textValue ?? "") ?? "",
                    }}
                  />
                </div>
              </div>
            )}
        </>
      ) : selected?.type === PropertyType.NUMBER ? (
        <InputNumber
          ref={numberInput}
          name={selected.name}
          title={t(selected.title)}
          required={selected.isRequired}
          value={numberValue}
          setValue={(e) => (onChange ? onChange(Number(e)) : undefined)}
          disabled={readOnly}
          className={className}
          readOnly={readOnly}
          min={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min)}
          max={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Max)}
          step={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Step)}
          placeholder={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Placeholder)}
          hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
          help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
          icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
          autoFocus={autoFocus}
          canUnset={true}
        />
      ) : selected?.type === PropertyType.DATE ? (
        <>
          <InputDate
            ref={dateInput}
            required={selected.isRequired}
            name={selected.name}
            title={t(selected.title)}
            value={dateValue}
            onChange={(e) => (onChange ? onChange(e) : undefined)}
            className={className}
            readOnly={readOnly}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            autoFocus={autoFocus}
          />
        </>
      ) : selected?.type === PropertyType.SELECT ? (
        <>
          {/* <PropertyOptionSelector
            property={selected}
            initial={initialOption}
            onSelected={(e) => {
              if (onChange) {
                onChange(e ?? "");
              }
              if (onChangeOption) {
                onChangeOption(e);
              }
            }}
            className={className}
            disabled={readOnly}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            display={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.SelectOptions) as SelectOptionsDisplay}
            autoFocus={autoFocus}
          /> */}
          {!selected.subtype || selected.subtype === "dropdown" ? (
            <InputSelect
              name={selected.name}
              title={t(selected.title)}
              required={selected.isRequired}
              value={initialOption}
              defaultValue={textValue}
              setValue={(e) => {
                if (onChange) {
                  onChange(e?.toString() ?? "");
                }
                if (onChangeOption) {
                  onChangeOption(e?.toString());
                }
              }}
              disabled={readOnly}
              className={className}
              hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
              help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
              autoFocus={autoFocus}
              options={selected.options.map((f) => ({
                name: f.name ?? f.value,
                value: f.value,
              }))}
            />
          ) : selected.subtype === "radioGroupCards" ? (
            <InputRadioGroupCards
              title={t(selected.title)}
              name={selected.name}
              value={initialOption}
              defaultValue={textValue}
              disabled={readOnly}
              required={selected.isRequired}
              options={selected.options.map((f) => {
                return {
                  value: f.value,
                  name: f.name ?? f.value,
                };
              })}
              onChange={(e) => {
                if (onChange) {
                  onChange(e);
                }
                if (onChangeOption) {
                  onChangeOption(e);
                }
              }}
            />
          ) : null}
        </>
      ) : selected?.type === PropertyType.BOOLEAN ? (
        <>
          <InputCheckbox
            asToggle={true}
            name={selected.name}
            title={t(selected.title)}
            required={selected.isRequired}
            value={booleanValue}
            setValue={(e) => (onChange ? onChange(e as boolean) : undefined)}
            disabled={readOnly}
            className={className}
            readOnly={readOnly}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            autoFocus={autoFocus}
          />
        </>
      ) : selected?.type === PropertyType.MEDIA ? (
        <InputMedia
          name={selected.name}
          title={selected.title}
          initialMedia={initialMedia}
          className={className}
          disabled={readOnly}
          onSelected={(e) => setMedia(e)}
          readOnly={readOnly}
          required={selected.isRequired || (PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min) ?? 0) > 0}
          min={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min)}
          max={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Max)}
          accept={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.AcceptFileTypes)}
          hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
          help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
          autoFocus={autoFocus}
        />
      ) : selected?.type === PropertyType.MULTI_SELECT ? (
        <>
          <PropertyMultiSelector
            subtype={selected.subtype as any}
            name={selected.name}
            title={selected.title}
            required={selected.isRequired}
            options={selected.options}
            value={multiple}
            onSelected={(e) => (onChangeMultiple ? onChangeMultiple(e) : undefined)}
            disabled={readOnly}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            autoFocus={autoFocus}
          />
        </>
      ) : selected?.type === PropertyType.MULTI_TEXT ? (
        <>
          <InputMultiText
            ref={multipleInput}
            name={selected.name}
            title={t(selected.title)}
            value={multiple}
            // onSelected={(e) => (onChangeMultiple ? onChangeMultiple(e) : undefined)}
            required={selected.isRequired}
            className={className}
            readOnly={readOnly}
            disabled={readOnly}
            pattern={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Pattern)}
            minLength={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min)}
            maxLength={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Max)}
            rows={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Rows)}
            placeholder={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Placeholder)}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            uppercase={PropertyAttributeHelper.getPropertyAttributeValue_Boolean(selected, PropertyAttributeName.Uppercase)}
            lowercase={PropertyAttributeHelper.getPropertyAttributeValue_Boolean(selected, PropertyAttributeName.Lowercase)}
            autoFocus={autoFocus}
            separator={getSeparator(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Separator))}
          />
        </>
      ) : selected?.type === PropertyType.RANGE_NUMBER ? (
        <>
          <InputRangeNumber
            name={selected.name}
            title={t(selected.title)}
            required={selected.isRequired}
            valueMin={range?.numberMin ? Number(range.numberMin) : undefined}
            valueMax={range?.numberMax ? Number(range.numberMax) : undefined}
            onChangeMin={(e) => {
              if (onChangeRange) {
                onChangeRange({
                  dateMin: null,
                  dateMax: null,
                  numberMin: Number(e),
                  numberMax: range?.numberMax ? Number(range.numberMax) : null,
                });
              }
            }}
            onChangeMax={(e) => {
              if (onChangeRange) {
                onChangeRange({
                  dateMin: null,
                  dateMax: null,
                  numberMax: Number(e),
                  numberMin: range?.numberMin ? Number(range.numberMin) : null,
                });
              }
            }}
            disabled={readOnly}
            className={className}
            readOnly={readOnly}
            min={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Min)}
            max={PropertyAttributeHelper.getPropertyAttributeValue_Number(selected, PropertyAttributeName.Max)}
            step={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Step)}
            placeholder={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Placeholder)}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            autoFocus={autoFocus}
          />
        </>
      ) : selected?.type === PropertyType.RANGE_DATE ? (
        <>
          <InputRangeDate
            required={selected.isRequired}
            name={selected.name}
            title={t(selected.title)}
            valueMin={range?.dateMin ?? undefined}
            valueMax={range?.dateMax ?? undefined}
            onChangeMin={(e) => {
              if (onChangeRange) {
                onChangeRange({
                  dateMin: e,
                  dateMax: range?.dateMax ?? null,
                  numberMin: null,
                  numberMax: null,
                });
              }
            }}
            onChangeMax={(e) => {
              if (onChangeRange) {
                onChangeRange({
                  dateMin: range?.dateMin ?? null,
                  dateMax: e,
                  numberMin: null,
                  numberMax: null,
                });
              }
            }}
            className={className}
            readOnly={readOnly}
            hint={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HintText) ?? "")}
            help={t(PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.HelpText) ?? "")}
            icon={PropertyAttributeHelper.getPropertyAttributeValue_String(selected, PropertyAttributeName.Icon)}
            autoFocus={autoFocus}
          />
        </>
      ) : selected?.type === PropertyType.FORMULA ? (
        <>
          {!selected.formula ? (
            <div className="text-red-500">Unknown formula</div>
          ) : (
            <InputFormulaValue property={selected} textValue={textValue} numberValue={numberValue} dateValue={dateValue} booleanValue={booleanValue} />
          )}
        </>
      ) : (
        <div className={className}>Not supported</div>
      )}
    </>
  );
};

function InputFormulaValue(props: { property: PropertyWithDetails; textValue?: string; numberValue?: number; dateValue?: Date; booleanValue?: boolean }) {
  return (
    <>
      {props.property.formula?.resultAs === "string" ? (
        <InputText name={props.property.name} title={props.property.title} defaultValue={props.textValue} readOnly={true} />
      ) : props.property.formula?.resultAs === "number" ? (
        <InputNumber name={props.property.name} title={props.property.title} defaultValue={props.numberValue} readOnly={true} canUnset={true} />
      ) : props.property.formula?.resultAs === "date" ? (
        <InputDate name={props.property.name} title={props.property.title} value={props.dateValue} readOnly={true} />
      ) : props.property.formula?.resultAs === "boolean" ? (
        <InputCheckbox asToggle={true} name={props.property.name} title={props.property.title} value={props.booleanValue} readOnly={true} />
      ) : null}
    </>
  );
}

export default forwardRef(RowValueInput);
