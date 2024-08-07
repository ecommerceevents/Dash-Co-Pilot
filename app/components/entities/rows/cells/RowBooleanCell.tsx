import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import { BooleanFormatType } from "~/utils/shared/BooleanUtils";

export function getBooleanAsStringValue({ value, format, t }: { value?: boolean; format?: BooleanFormatType; t?: TFunction }) {
  return !format || format === "yesNo"
    ? value
      ? t
        ? t("shared.yes")
        : "Yes"
      : t
      ? t("shared.no")
      : "No"
    : format === "trueFalse"
    ? value
      ? t
        ? t("shared.true")
        : "True"
      : t
      ? t("shared.false")
      : "False"
    : format === "enabledDisabled"
    ? value
      ? t
        ? t("shared.enabled")
        : "Enabled"
      : t
      ? t("shared.disabled")
      : "Disabled"
    : format === "onOff"
    ? value
      ? t
        ? t("shared.on")
        : "On"
      : t
      ? t("shared.off")
      : "Off"
    : format === "activeInactive"
    ? value
      ? t
        ? t("shared.active")
        : "Active"
      : t
      ? t("shared.inactive")
      : "Inactive"
    : "";
}
export default function RowBooleanCell({ value, format }: { value?: boolean; format?: BooleanFormatType }) {
  const { t } = useTranslation();
  return (
    <>
      {!format ? (
        <div>{value ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-500" />}</div>
      ) : (
        <SimpleBadge title={getBooleanAsStringValue({ value, format, t })} color={value ? Colors.GREEN : Colors.GRAY} />
      )}
    </>
  );
}
