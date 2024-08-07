import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import { PromptGroupTemplateDto } from "../dtos/PromptGroupTemplateDto";

export default function PromptGroupModal({
  item,
  idx,
  open,
  onClose,
  onSave,
  onRemove,
}: {
  item: PromptGroupTemplateDto | undefined;
  idx: number | undefined;
  templateOrder: number;
  open: boolean;
  onClose: () => void;
  onSave: (item: PromptGroupTemplateDto) => void;
  onRemove?: (idx: number) => void;
  templates: PromptGroupTemplateDto[];
}) {
  const { t } = useTranslation();
  const [template, setTemplate] = useState<PromptGroupTemplateDto>(
    item || {
      title: "",
      order: 0,
    }
  );

  useEffect(() => {
    if (idx === undefined) {
      setTemplate({
        title: "",
        order: 0,
      });
    } else {
      setTemplate(
        item || {
          title: "",
          order: 0,
        }
      );
    }
  }, [item, idx]);

  function onConfirm() {
    if (!template?.title) {
      return;
    }
    onSave(template);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onConfirm();
  }
  function onClosing() {
    setTemplate({
      title: "",
      order: 0,
    });
    onClose();
  }
  return (
    <Modal open={open} setOpen={onClosing} size="sm">
      <Form onSubmit={onSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{idx === undefined ? "New Group Template" : "Edit Group Template"}</h3>
        </div>
        <div className="mt-4 space-y-2" key={idx}>
          <InputText
            name="title"
            title={t("shared.title")}
            value={template.title}
            setValue={(e) => setTemplate({ ...template, title: e?.toString() ?? "" })}
            required
          />
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
          <div className="flex space-x-2">
            <ButtonSecondary type="button" onClick={onClosing}>
              {t("shared.cancel")}
            </ButtonSecondary>
            <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
