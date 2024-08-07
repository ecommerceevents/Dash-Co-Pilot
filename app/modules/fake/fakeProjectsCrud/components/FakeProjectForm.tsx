import { Form, useSubmit, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputText from "~/components/ui/input/InputText";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import { FakeProjectDto } from "../dtos/FakeProjectDto";
import { FakeTaskDto } from "../dtos/FakeTaskDto";

export default function FakeProjectForm({
  item,
  actionData,
  canDelete,
  onCancel,
}: {
  item?: FakeProjectDto;
  actionData: { success?: string; error?: string } | undefined;
  canDelete?: boolean;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [tasks, setTasks] = useState<Partial<FakeTaskDto>[]>(item?.tasks || [{ name: "" }]);

  return (
    <Form method="post" className="space-y-4">
      {item ? <input name="action" value="edit" hidden readOnly /> : <input name="action" value="create" hidden readOnly />}

      <InputGroup title="Details">
        <div className="space-y-2">
          <InputText name="name" title="Name" disabled={navigation.state !== "idle"} required defaultValue={item?.name} />
          <InputText name="description" title="Description" disabled={navigation.state !== "idle"} required rows={3} defaultValue={item?.description} />
          <InputCheckbox asToggle={true} name="isActive" title="Active" disabled={navigation.state !== "idle"} value={item?.active} />
        </div>
      </InputGroup>

      <div className="w-full space-y-2">
        {tasks.map((item, index) => (
          <input
            key={index}
            type="hidden"
            name="tasks[]"
            hidden
            readOnly
            value={JSON.stringify({
              name: item.name,
            })}
          />
        ))}

        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium leading-3 text-gray-800">Tasks</h3>
          {tasks.map((item, index) => (
            <CollapsibleRow
              key={index}
              title={item.name || "Task #" + (index + 1)}
              value={item.name || "Task #" + (index + 1)}
              initial={!item.name}
              onRemove={() => {
                setTasks(tasks.filter((_, i) => i !== index));
              }}
            >
              <div className="grid gap-2">
                <InputText
                  disabled={navigation.state !== "idle"}
                  value={item.name}
                  placeholder="Task description..."
                  setValue={(e) => {
                    setTasks(
                      tasks.map((s, i) => {
                        if (i === index) {
                          return { ...s, name: e.toString() };
                        }
                        return s;
                      })
                    );
                  }}
                />
              </div>
            </CollapsibleRow>
          ))}

          <ButtonTertiary onClick={() => setTasks([...tasks, { name: "" }])}>{t("shared.add")}</ButtonTertiary>
        </div>
      </div>

      <div className="flex justify-between space-x-2">
        <div>
          {canDelete && (
            <ButtonSecondary
              destructive
              disabled={navigation.state !== "idle"}
              onClick={() => {
                const form = new FormData();
                form.set("action", "delete");
                submit(form, {
                  method: "post",
                });
              }}
            >
              Delete
            </ButtonSecondary>
          )}
        </div>
        <div className="flex space-x-2">
          {onCancel && <ButtonSecondary onClick={onCancel}>{t("shared.cancel")}</ButtonSecondary>}
          <ButtonPrimary type="submit" disabled={navigation.state !== "idle"}>
            {item ? t("shared.save") : t("shared.create")}
          </ButtonPrimary>
        </div>
      </div>

      {actionData?.error && <div className="text-red-600">{actionData.error}</div>}

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </Form>
  );
}
