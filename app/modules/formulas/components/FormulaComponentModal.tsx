import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import { FormulaComponentDto, FormulaOperatorTypes, FormulaComponentType } from "../dtos/FormulaDto";
import FormulaHelpers from "../utils/FormulaHelpers";
import InputSelect from "~/components/ui/input/InputSelect";
import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";

export default function FormulaComponentModal({
  item,
  idx,
  order,
  open,
  onClose,
  onSave,
  onRemove,
}: {
  item: FormulaComponentDto | undefined;
  idx: number | undefined;
  order: number;
  open: boolean;
  onClose: () => void;
  onSave: (item: FormulaComponentDto) => void;
  onRemove?: (idx: number) => void;
}) {
  const { t } = useTranslation();
  const [type, setType] = useState<FormulaComponentType>(item?.type ?? "variable");
  const [value, setValue] = useState<string>(item?.value ?? "");

  useEffect(() => {
    setType(item?.type ?? "variable");
    setValue(item?.value ?? "");
  }, [item]);

  function onConfirm() {
    if (!type) {
      return;
    }
    onSave({ order, type, value });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onConfirm();
  }
  function onClosing() {
    setType("variable");
    setValue("");
    onClose();
  }

  return (
    <Modal open={open} setOpen={onClosing} size="lg">
      <Form onSubmit={onSubmit} className="inline-block h-full w-full overflow-visible p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3">
          <h3 className="text-foreground text-lg font-medium leading-6">{idx === undefined ? "New Formula Component" : "Edit Formula Component"}</h3>
        </div>
        <div className="mt-4 space-y-2" key={idx}>
          <div className="grid gap-2">
            <div className="">
              <InputRadioGroupCards
                columns={3}
                name="type"
                value={type}
                onChange={(e) => setType(e?.toString() as FormulaComponentType)}
                required
                options={[
                  { name: "variable", value: "variable" },
                  { name: "operator", value: "operator" },
                  // { name: "parenthesis", value: "parenthesis" },
                  { name: "value", value: "value" },
                ]}
              />
            </div>
            {type === "variable" ? (
              <InputText autoFocus name="name" title="Name" value={value} setValue={(e) => setValue(e.toString())} required />
            ) : type === "operator" ? (
              <InputSelect
                autoFocus
                name="operator"
                title="Operator"
                value={value}
                setValue={(e) => setValue(FormulaHelpers.getOperatorType(e?.toString() ?? ""))}
                required
                options={FormulaOperatorTypes.map((item) => {
                  return { name: item, value: item };
                })}
              />
            ) : type === "parenthesis" ? (
              <InputSelect
                autoFocus
                name="parenthesis"
                title="Parenthesis"
                value={value}
                setValue={(e) => setValue(FormulaHelpers.getParenthesisType(e?.toString() ?? ""))}
                required
                options={["OPEN", "CLOSE"].map((item) => {
                  return { name: item, value: item };
                })}
              />
            ) : type === "value" ? (
              <InputText autoFocus name="value" title="Value" value={value} setValue={(e) => setValue(e.toString())} required />
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex justify-between space-x-2">
          <div>
            {onRemove && idx !== undefined && (
              <ButtonSecondary
                type="button"
                destructive
                onClick={() => {
                  onRemove(idx);
                  onClosing();
                }}
              >
                {t("shared.remove")}
              </ButtonSecondary>
            )}
          </div>
          <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
        </div>
      </Form>
    </Modal>
  );
}
