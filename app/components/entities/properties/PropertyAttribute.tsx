import { useTranslation } from "react-i18next";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";

interface Props {
  name: PropertyAttributeName;
  title: string;
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  className?: string;
}
export default function PropertyAttribute({ name, title, value, setValue, className }: Props) {
  const { t } = useTranslation();
  function isNumber() {
    return [
      PropertyAttributeName.Min,
      PropertyAttributeName.Max,
      PropertyAttributeName.MaxSize,
      PropertyAttributeName.Rows,
      PropertyAttributeName.Columns,
    ].includes(name);
  }
  function isBoolean() {
    return [PropertyAttributeName.Uppercase, PropertyAttributeName.Lowercase, PropertyAttributeName.Password].includes(name);
  }
  function isSelector() {
    return PropertyAttributeHelper.getPropertyAttributeOptions(name).length > 0;
  }
  function getPlaceholder() {
    if (name === PropertyAttributeName.Step) {
      return "0.01";
    }
    return "";
  }
  function getDescription() {
    if (name === PropertyAttributeName.Uppercase) {
      return "Force text to be uppercase";
    } else if (name === PropertyAttributeName.Lowercase) {
      return "Force text to be lowercase";
    }
    return "";
  }
  return (
    <>
      {isNumber() ? (
        <InputNumber
          className={className}
          name={name}
          title={title}
          value={Number(value)}
          setValue={(e) => setValue(e?.toString())}
          max={name === PropertyAttributeName.Columns ? 12 : undefined}
          hint={
            <>
              {value && (
                <button type="button" onClick={() => setValue("")} className="text-xs text-gray-600 hover:text-red-500">
                  {t("shared.remove")}
                </button>
              )}
            </>
          }
        />
      ) : isBoolean() ? (
        <InputCheckboxWithDescription
          className={className}
          description={getDescription()}
          name={name}
          title={title}
          value={value === "true" ? true : false}
          setValue={(e) => setValue(e ? (Boolean(e) === true ? "true" : "false") : "false")}
        />
      ) : isSelector() ? (
        <InputSelector
          className={className}
          withSearch={false}
          name={name}
          title={title}
          value={value}
          setValue={(e) => setValue(e?.toString())}
          options={PropertyAttributeHelper.getPropertyAttributeOptions(name)}
          hint={
            <>
              {value && (
                <button type="button" onClick={() => setValue("")} className="text-xs text-gray-600 hover:text-red-500">
                  {t("shared.remove")}
                </button>
              )}
            </>
          }
        ></InputSelector>
      ) : (
        <InputText
          className={className}
          name={name}
          title={title}
          value={value}
          setValue={(e) => setValue(e.toString())}
          placeholder={getPlaceholder()}
          hint={
            <>
              {value && (
                <button type="button" onClick={() => setValue("")} className="text-xs text-gray-600 hover:text-red-500">
                  {t("shared.remove")}
                </button>
              )}
            </>
          }
        />
      )}
    </>
  );
}
