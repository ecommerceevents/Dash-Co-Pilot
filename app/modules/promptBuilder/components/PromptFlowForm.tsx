import { useNavigation, useNavigate, Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { PromptFlowWithDetails } from "../db/promptFlows.db.server";
import InputSelect from "~/components/ui/input/InputSelect";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { PromptFlowGroup } from "@prisma/client";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import InputSelector from "~/components/ui/input/InputSelector";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";

export default function PromptFlowForm({
  promptFlowGroups,
  item,
  onDelete,
  allEntities,
  onDuplicate,
}: {
  promptFlowGroups: PromptFlowGroup[];
  item?: PromptFlowWithDetails;
  onDelete?: () => void;
  allEntities: EntityWithDetails[];
  onDuplicate?: (item: PromptFlowWithDetails) => void;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [actionTitle, setActionTitle] = useState(item?.actionTitle || "");
  // const [executionType, setExecutionType] = useState(item?.executionType || "sequential");
  const [model, setModel] = useState(item?.model || OpenAIDefaults.model);
  // const [stream, setStream] = useState(item?.stream || false);
  const [promptFlowGroupId, setPromptFlowGroupId] = useState(item?.promptFlowGroupId || "");
  const [inputEntityId, setInputEntityId] = useState(item?.inputEntityId || "");
  const [isPublic, setIsPublic] = useState(item !== undefined ? item.public : true);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  function getActionName() {
    return item ? "edit" : "new";
  }
  return (
    <div>
      <Form method="post" className="inline-block w-full p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value={getActionName()} />

        <div className="space-y-2">
          <InputText ref={mainInput} autoFocus name="title" title={t("shared.title")} value={title} setValue={setTitle} required />
          <InputText name="description" title={t("shared.description")} value={description} setValue={setDescription} required />
          <InputText name="actionTitle" title={"Action title"} value={actionTitle} setValue={setActionTitle} required />
          {/* <div className="flex items-center space-x-2"> */}
          {/* <InputSelect
              name="executionType"
              title={"Execution type"}
              value={executionType}
              setValue={(e) => setExecutionType(e?.toString() ?? "")}
              options={[
                {
                  name: "Sequential",
                  value: "sequential",
                },
                {
                  name: "Parallel",
                  value: "parallel",
                },
              ]}
            /> */}
          <InputSelect
            name="model"
            title={"Model"}
            value={model}
            setValue={(e) => setModel(e?.toString() ?? "")}
            options={OpenAIDefaults.models.map((f) => f)}
          />
          {/* </div> */}
          {allEntities.length > 0 && (
            <InputSelector
              withSearch={false}
              name="inputEntityId"
              title={"Input entity"}
              value={inputEntityId}
              hint={
                <>
                  {inputEntityId && (
                    <button type="button" onClick={() => setInputEntityId("")} className="text-xs text-gray-600 hover:text-gray-700">
                      {t("shared.remove")}
                    </button>
                  )}
                </>
              }
              setValue={(e) => setInputEntityId(e?.toString() ?? "")}
              options={allEntities.map((f) => {
                return {
                  name: t(f.title),
                  value: f.id,
                };
              })}
            />
          )}
          {promptFlowGroups.length > 0 && (
            <InputSelector
              withSearch={false}
              name="promptFlowGroupId"
              title={"Group"}
              value={promptFlowGroupId}
              hint={
                <>
                  {promptFlowGroupId && (
                    <button type="button" onClick={() => setPromptFlowGroupId("")} className="text-xs text-gray-600 hover:text-gray-700">
                      {t("shared.remove")}
                    </button>
                  )}
                </>
              }
              setValue={(e) => setPromptFlowGroupId(e?.toString() ?? "")}
              options={promptFlowGroups.map((f) => {
                return {
                  name: f.title,
                  value: f.id,
                };
              })}
            />
          )}
          <InputCheckboxWithDescription
            name="isPublic"
            title={"Public"}
            description={"Make this prompt flow public."}
            value={isPublic}
            setValue={(e) => setIsPublic(Boolean(e))}
          />
        </div>
        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && getUserHasPermission(appOrAdminData, "admin.prompts.delete") && (
              <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{t("shared.delete")}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            {onDuplicate && item && <ButtonSecondary onClick={() => onDuplicate(item)}>{t("shared.duplicate")}</ButtonSecondary>}
            <ButtonSecondary onClick={() => navigate("/admin/prompts/builder")}>{t("shared.cancel")}</ButtonSecondary>
            <LoadingButton actionName={getActionName()} type="submit" disabled={navigation.state === "submitting"}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </Form>
    </div>
  );
}
