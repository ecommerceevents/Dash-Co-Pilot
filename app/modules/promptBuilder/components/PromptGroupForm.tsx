import { useNavigation, useNavigate, Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { PromptFlowGroupWithDetails } from "../db/promptFlowGroups.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import OrderIndexButtons from "~/components/ui/sort/OrderIndexButtons";
import { PromptGroupTemplateDto } from "../dtos/PromptGroupTemplateDto";

export default function PromptGroupForm({ item, onDelete }: { item?: PromptFlowGroupWithDetails; onDelete?: () => void }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");

  const [templates, setTemplates] = useState<PromptGroupTemplateDto[]>(
    item?.templates.map((f) => {
      return {
        title: f.title,
        order: f.order,
      };
    }) || [{ order: 1, title: "Template 1" }]
  );

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
      <SlideOverWideEmpty
        title={"Prompt Flow Group"}
        description={item ? "Edit Prompt Flow Group" : "Create Prompt Flow Group"}
        open={true}
        onClose={() => {
          navigate("/admin/prompts/groups");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
          <input type="hidden" name="action" value={getActionName()} />
          {templates.map((template, index) => {
            return <input type="hidden" name="templates[]" value={JSON.stringify(template)} key={index} />;
          })}

          <div className="space-y-2">
            <InputText ref={mainInput} autoFocus name="title" title={t("shared.title")} value={title} setValue={setTitle} required />
            <InputText name="description" title={t("shared.description")} value={description} setValue={setDescription} />

            <div>
              <div className="mb-1 flex items-center justify-between space-x-2 text-xs">
                <label className="font-medium text-gray-600">{t("prompts.templates")}</label>
                <button type="button" onClick={() => setTemplates([])} className="text-gray-500 hover:text-gray-700">
                  {t("shared.clear")}
                </button>
              </div>

              <div className="">
                <TableSimple
                  items={templates.sort((a, b) => a.order - b.order)}
                  headers={[
                    {
                      name: "order",
                      title: "",
                      value: (item, idx) => (
                        <OrderIndexButtons
                          idx={idx}
                          items={templates.map((f, idx) => {
                            return {
                              idx: idx,
                              order: f.order,
                            };
                          })}
                          onChange={(newItems) => {
                            setTemplates(
                              newItems.map((f, i) => {
                                return { ...templates[i], order: f.order };
                              })
                            );
                          }}
                        />
                      ),
                    },
                    {
                      name: "title",
                      title: "Title",
                      value: (item) => item.title,
                      editable: () => true,
                      setValue: (value, idx) =>
                        setTemplates((templates) => templates.map((template, i) => (i === idx ? { ...template, title: value } : template))),
                    },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTemplates([...templates, { title: "Template " + (templates.length + 1), order: templates.length + 1 }]);
                  }}
                  className="mt-2 flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium uppercase">{t("shared.add")}</span>
                </button>
              </div>
            </div>
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
              <ButtonSecondary onClick={() => navigate("/admin/prompts/groups")}>{t("shared.cancel")}</ButtonSecondary>
              <LoadingButton actionName={getActionName()} type="submit" disabled={navigation.state === "submitting"}>
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </Form>
      </SlideOverWideEmpty>
    </div>
  );
}
