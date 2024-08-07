import { useEffect, useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import InputSelector from "~/components/ui/input/InputSelector";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { useTranslation } from "react-i18next";
import { PromptFlowInputVariableWithDetails } from "../../db/promptFlowInputVariables.db.server";
import StringUtils from "~/utils/shared/StringUtils";
import { PromptFlowVariableType, PromptFlowVariableTypes } from "../../dtos/PromptFlowVariableType";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";

export default function PromptFlowVariableForm({ item, onDelete }: { item: PromptFlowInputVariableWithDetails | undefined; onDelete?: () => void }) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [type, setType] = useState<PromptFlowVariableType>((item?.type as PromptFlowVariableType) ?? "");
  const [title, setTitle] = useState<string>((item?.title as string) ?? "");
  const [name, setName] = useState<string>((item?.name as string) ?? "");
  const [isRequired, setIsRequired] = useState<boolean>((item?.isRequired as boolean) ?? false);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

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

  return (
    <Form method="post">
      <input type="hidden" name="action" value={item ? "edit" : "new"} />
      <div>
        <div className="mt-4 space-y-2">
          <InputSelector
            withSearch={false}
            name="type"
            title="Type"
            value={type}
            setValue={(e) => setType(e as PromptFlowVariableType)}
            options={PromptFlowVariableTypes.map((f) => {
              return {
                name: f.name,
                value: f.value,
              };
            })}
            required
          />

          <InputText ref={mainInput} name="title" title="Title" value={title} setValue={(e) => setTitle(e)} required />
          <InputText name="name" title="Name" value={name} setValue={(e) => setName(e)} required />
          <InputCheckboxWithDescription
            name="isRequired"
            title="Required"
            value={isRequired}
            setValue={(e) => setIsRequired(e)}
            description="If checked, this variable will be required to be filled out before the prompt can be submitted."
          />
        </div>

        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && (
              <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{"Delete"}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <LoadingButton actionName={item ? "edit" : "new"} type="submit" disabled={navigation.state === "submitting"}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </div>
    </Form>
  );
}
