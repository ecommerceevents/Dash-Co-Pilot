import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { useNavigation, useSubmit, Form } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputGroup from "~/components/ui/forms/InputGroup";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";`);
  imports.push(`import { ${capitalized}Dto } from "../dtos/${capitalized}Dto";`);

  let template = `
export default function ${capitalized}Form({
  item,
  actionData,
  isUpdating,
  isCreating,
  canUpdate,
  canDelete,
  onCancel,
}: {
  item?: ${capitalized}Dto;
  actionData: { success?: string; error?: string } | undefined;
  isUpdating?: boolean;
  isCreating?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirmed() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  function isDisabled() {
    if (isUpdating && !canUpdate) {
      return true;
    }
    if (!isUpdating && !isCreating) {
      return true;
    }
  }
  return (
    <Form key={!isDisabled() ? "enabled" : "disabled"} method="post" className="space-y-4">
      {item ? <input name="action" value="edit" hidden readOnly /> : <input name="action" value="create" hidden readOnly />}

      <InputGroup title={t("shared.details")}>
        <div className="space-y-2">
          {PROPERTIES_UI_CONTROLS}
        </div>
      </InputGroup>

      {(isCreating || (isUpdating && canUpdate)) && (
        <div className="flex justify-between space-x-2">
          <div>
            {canDelete && (
              <ButtonSecondary disabled={navigation.state !== "idle"} destructive onClick={onDelete}>
                {t("shared.delete")}
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            {onCancel && <ButtonSecondary onClick={onCancel}>{t("shared.cancel")}</ButtonSecondary>}
            <ButtonPrimary disabled={navigation.state !== "idle"} type="submit">
              {item ? t("shared.save") : t("shared.create")}
            </ButtonPrimary>
          </div>
        </div>
      )}

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </Form>
  );
}`;

  const uiFormControls: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property, index) => {
      CodeGeneratorPropertiesHelper.uiForm({ code: uiFormControls, imports, property, index });
    });
  template = template.replace("{PROPERTIES_UI_CONTROLS}", uiFormControls.join("\n          "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
