import { useNavigation, useNavigate, Form } from "@remix-run/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText from "~/components/ui/input/InputText";
import InputSelect from "~/components/ui/input/InputSelect";
import { FormulaCalculationTriggerTypes, FormulaComponentDto, FormulaDto, FormulaResultAsTypes } from "../dtos/FormulaDto";
import FormulaHelpers from "../utils/FormulaHelpers";
import FormulaComponentModal from "./FormulaComponentModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import FormulaComponentBadge from "./FormulaComponentBadge";

export default function FormulaForm({ item, onDelete }: { item?: FormulaDto; onDelete?: () => void }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const confirmModalDelete = useRef<RefConfirmModal>(null);

  const [showModal, setShowModal] = useState<{
    item?: FormulaComponentDto;
    idx?: number;
  }>();

  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [resultAs, setResultAs] = useState(item?.resultAs || "number");
  const [calculationTrigger, setCalculationTrigger] = useState(item?.calculationTrigger || "IF_UNSET");
  const [withLogs, setWithLogs] = useState(item?.withLogs || false);

  const [components, setComponents] = useState<FormulaComponentDto[]>(item?.components || []);

  function onSave(item: FormulaComponentDto) {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      components[idx] = item;
    } else {
      components.push({
        ...item,
        order: components.length + 1,
      });
    }
    setComponents([...components]);
    setShowModal(undefined);
  }
  function getActionName() {
    return item ? "edit" : "new";
  }
  function onDeleteClick() {
    confirmModalDelete.current?.show("Delete formula", "Delete", "Cancel", "Are you sure you want to delete this formula?");
  }
  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value={getActionName()} hidden readOnly />
        {components.map((component, index) => {
          return <input type="hidden" name="components[]" value={JSON.stringify(component)} key={index} hidden readOnly />;
        })}

        <div className="grid grid-cols-2 gap-2">
          <InputText autoFocus name="name" title="Name" value={name} setValue={setName} required />
          <InputText name="description" title="Description" value={description} setValue={setDescription} />
          <InputSelect
            name="resultAs"
            title="Result as"
            value={resultAs}
            setValue={(e) => setResultAs(FormulaHelpers.getResultAs(e?.toString() ?? ""))}
            options={FormulaResultAsTypes.map((item) => {
              return { name: item, value: item };
            })}
          />

          <InputSelect
            name="calculationTrigger"
            title={"Calculation trigger"}
            value={calculationTrigger}
            setValue={(e) => setCalculationTrigger(FormulaHelpers.getCalculationTrigger(e?.toString() ?? ""))}
            options={FormulaCalculationTriggerTypes.map((item) => {
              return { name: item, value: item };
            })}
          />

          <InputCheckboxWithDescription
            className="col-span-2"
            name="withLogs"
            title="With logs"
            description="If checked, all calcuations will be logged"
            value={withLogs}
            setValue={setWithLogs}
          />

          <div className="col-span-2">
            <div className="mb-1 flex items-center justify-between space-x-2 text-xs">
              <label className="font-medium text-gray-600">Components</label>
              <button type="button" onClick={() => setComponents([])} className="text-gray-500 hover:text-gray-700">
                {t("shared.clear")}
              </button>
            </div>

            <div className="flex flex-wrap text-gray-800">
              {components.map((item, idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setShowModal({ item, idx: idx })}
                    className="relative m-1 block rounded-lg border-2 border-dashed border-gray-300 p-1 text-center text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <FormulaComponentBadge item={item} />
                  </button>
                );
              })}

              <div className="">
                <button
                  type="button"
                  onClick={() => setShowModal({ item: undefined, idx: undefined })}
                  className="relative m-1 block w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-1 text-center text-blue-600 hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="block text-sm font-medium">Add component</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && getUserHasPermission(appOrAdminData, "admin.formulas.delete") && (
              <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDeleteClick} destructive>
                <div>{t("shared.delete")}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary onClick={() => navigate("/admin/entities/formulas")}>{t("shared.cancel")}</ButtonSecondary>
            <LoadingButton actionName={getActionName()} type="submit" disabled={navigation.state === "submitting"}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </Form>

      <FormulaComponentModal
        open={showModal !== undefined}
        item={showModal?.item}
        idx={showModal?.idx}
        order={components.length + 1}
        onClose={() => setShowModal(undefined)}
        onSave={(item) => onSave(item)}
        onRemove={(idx) => {
          components.splice(idx, 1);
          setComponents([...components]);
        }}
      />

      <ConfirmModal ref={confirmModalDelete} onYes={onDelete} />
    </div>
  );
}
