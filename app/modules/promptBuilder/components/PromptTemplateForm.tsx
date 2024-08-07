import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputText from "~/components/ui/input/InputText";
import { PromptTemplateDto } from "../dtos/PromptTemplateDto";
import InputNumber from "~/components/ui/input/InputNumber";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import MonacoEditor, { MonacoAutoCompletion } from "~/components/editors/MonacoEditor";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import PromptFlowUtils from "../utils/PromptFlowUtils";

export default function PromptTemplateForm({
  item,
  idx,
  templateOrder,
  open,
  onClose,
  onSave,
  onRemove,
  metadata,
  templates,
}: {
  item: PromptTemplateDto | undefined;
  idx: number | undefined;
  templateOrder: number;
  open: boolean;
  onClose: () => void;
  onSave: (item: PromptTemplateDto) => void;
  onRemove?: (idx: number) => void;
  metadata: {
    entities: EntityWithDetails[];
  };
  templates: PromptTemplateDto[];
}) {
  const { t } = useTranslation();
  const [autocompletions, setAutocompletions] = useState<MonacoAutoCompletion[]>([]);
  const [template, setTemplate] = useState<PromptTemplateDto>(
    item || {
      title: "",
      template: "",
      temperature: OpenAIDefaults.temperature,
      order: 0,
      maxTokens: 0,
    }
  );

  useEffect(() => {
    if (idx === undefined) {
      setTemplate({
        title: "",
        template: "",
        temperature: OpenAIDefaults.temperature,
        order: 0,
        maxTokens: 0,
      });
    } else {
      setTemplate(
        item || {
          title: "",
          template: "",
          temperature: OpenAIDefaults.temperature,
          order: 0,
          maxTokens: 0,
        }
      );
    }
  }, [item, idx]);

  useEffect(() => {
    const autocompletions: MonacoAutoCompletion[] = [];
    metadata.entities
      .sort((a, b) => a.order - b.order)
      .forEach((entity) => {
        entity.properties
          .filter((f) => !f.isDefault)
          .sort((a, b) => a.order - b.order)
          .forEach((property) => {
            const label = `row.${entity.name}.${property.name}`;
            autocompletions.push({
              label,
              kind: "Value",
              documentation: t(property.title),
              insertText: `{{${label}}}`,
            });
          });

        entity.childEntities.forEach((child) => {
          const childEntity = metadata.entities.find((f) => f.id === child.childId);
          if (!childEntity) {
            return;
          }
          childEntity.properties
            .filter((f) => !f.isDefault)
            .sort((a, b) => a.order - b.order)
            .forEach((property) => {
              const label = `row.${entity.name}.${childEntity.name}.${property.name}`;
              autocompletions.push({
                label,
                kind: "Value",
                documentation: t(property.title),
                insertText: `{{${label}}}`,
                // range: range,
              });
            });
        });
      });

    if (templateOrder !== undefined && templateOrder > 0) {
      for (let index = 0; index < templateOrder; index++) {
        const label = `promptFlow.results.[${index}]`;
        const template = templates.find((f) => f.order === index);
        autocompletions.push({
          label,
          kind: "Value",
          documentation: !template ? "" : template.title,
          insertText: template?.title ? `${template?.title}: {{${label}}}` : `{{${label}}}`,
        });

        if (template) {
          autocompletions.push({
            label: template?.title,
            kind: "Value",
            documentation: !template ? "" : template.title,
            insertText: `${template.title}: {{${label}}}`,
          });
        }
      }
    }
    setAutocompletions(autocompletions);
  }, [metadata.entities, t, templateOrder, templates]);

  function onConfirm() {
    if (!template?.template) {
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
      template: "",
      temperature: OpenAIDefaults.temperature,
      order: 0,
      maxTokens: 0,
    });
    onClose();
  }
  return (
    <div>
      <Form onSubmit={onSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{idx === undefined ? "New Prompt Template" : "Edit Prompt Template"}</h3>
        </div>
        <div className="mt-4 space-y-2" key={idx}>
          <div className="flex space-x-2">
            <InputText
              className="w-64"
              name="title"
              title={t("shared.title")}
              value={template.title}
              setValue={(e) => setTemplate({ ...template, title: e?.toString() ?? "" })}
              required
            />
            <InputNumber
              name="temperature"
              title="Temperature"
              value={template.temperature}
              setValue={(e) => setTemplate({ ...template, temperature: Number(e) })}
              required
              min={0.1}
              max={1.0}
              step={"0.1"}
            />
          </div>
          <div>
            <div className="grid grid-cols-12 gap-3">
              {/* <InputMultiText
                className="w-full"
                disabled
                value={PromptFlowUtils.getUsedVariables(template.template ?? "", metadata.entities).map((f, idx) => {
                  return {
                    order: idx,
                    value: f.name,
                  };
                })}
                title="Used Variables"
              /> */}
              <div className="col-span-12 h-[calc(100vh-240px)] md:col-span-8 lg:col-span-9">
                <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
                  <span>Template</span>
                </label>
                <MonacoEditor
                  className="h-full"
                  theme="vs-dark"
                  name="template"
                  value={template.template}
                  onChange={(e) => setTemplate({ ...template, template: e?.toString() ?? "" })}
                  language="json"
                  fontSize={14}
                  autocompletions={autocompletions}
                />
              </div>
              <div className="col-span-12 h-[calc(100vh-240px)] space-y-2 overflow-auto md:col-span-4 lg:col-span-3">
                <div>
                  <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
                    <span>Used Variables</span>
                  </label>
                  <div className="flex h-full w-full flex-wrap items-center rounded-md border border-gray-200 bg-gray-50">
                    {PromptFlowUtils.getUsedVariables(template.template ?? "", metadata.entities).length === 0 ? (
                      <div className="m-1 flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-2 text-sm">
                        <span>None</span>
                      </div>
                    ) : (
                      <>
                        {PromptFlowUtils.getUsedVariables(template.template ?? "", metadata.entities).map((item, index) => (
                          <div key={index} className="m-1 flex select-all items-center rounded border border-gray-200 bg-gray-100 px-2 py-2 text-sm">
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* <div>
                  <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
                    <span>Possible Variables</span>
                  </label>
                  <div className="flex w-full flex-wrap items-center">
                    {PromptBuilderVariableService.getPossibleVariables(metadata.entities, templateOrder).map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        className="m-1 flex w-full items-center rounded border border-gray-200 bg-gray-100 px-2 py-2 text-sm hover:border-gray-300 hover:bg-gray-200"
                        onClick={() => {
                          setTemplate({ ...template, template: `${template.template ?? ""}\n{{${item.name}}}` });
                        }}
                      >
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {false && (
            <div className="">
              <div className="grid grid-cols-2 gap-4">
                <InfoBanner title="Possible Variables" text="">
                  <div className="space-y-1 ">
                    {PromptFlowUtils.getPossibleVariables(metadata.entities).map((variable) => {
                      return (
                        <div key={variable.name} className="flex items-center space-x-2">
                          <div className="select-all font-medium">{variable.name}</div>
                          {/* <div className="text-gray-500">{variable.type}</div> */}
                        </div>
                      );
                    })}
                  </div>
                </InfoBanner>
                <InfoBanner title="Used Variables" text="">
                  <div className="space-y-1">
                    {PromptFlowUtils.getUsedVariables(template.template ?? "", metadata.entities).map((variable) => {
                      return (
                        <div key={variable.name} className="flex items-center space-x-2">
                          <div className="font-medium">{variable.name}</div>
                          {/* <div className="text-gray-500">{variable.type}</div> */}
                        </div>
                      );
                    })}
                  </div>
                </InfoBanner>
              </div>
            </div>
          )}
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
    </div>
  );
}
