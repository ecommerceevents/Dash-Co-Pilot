import { useState, useRef, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { MonacoAutoCompletion } from "~/components/editors/MonacoEditor";
import InputNumber from "~/components/ui/input/InputNumber";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import TemplateApiHelper, { RowAsJson } from "~/utils/helpers/TemplateApiHelper";
import { PromptFlowWithDetails } from "../../db/promptFlows.db.server";
import { PromptFlowVariableType } from "../../dtos/PromptFlowVariableType";
import { PromptTemplateDto } from "../../dtos/PromptTemplateDto";
import PromptTemplateEditors from "./PromptTemplateEditors";

export default function PromptTemplateForm({
  idx,
  templates,
  item,
  promptFlow,
  onChanged,
  allEntities,
  sampleSourceRow,
  inputEntityRows,
}: {
  idx: number;
  templates: PromptTemplateDto[];
  item?: PromptTemplateDto;
  promptFlow: PromptFlowWithDetails;
  onChanged: (idx: number, item: PromptTemplateDto) => void;
  allEntities: EntityWithDetails[];
  sampleSourceRow: RowAsJson | null;
  inputEntityRows: RowWithDetails[];
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  const [selectedTab, setSelectedTab] = useState(0);

  const [templateDto, setTemplateDto] = useState<{
    source: string;
    template: string;
    result: string;
  }>({
    source: "",
    template: item?.template || "",
    result: "",
  });

  const [autocompletions, setAutocompletions] = useState<MonacoAutoCompletion[]>([]);

  const [order] = useState<number>(item?.order || 0);
  const [title, setTitle] = useState<string>(item?.title || "");
  const [temperature, setTemperature] = useState<number>(item?.temperature || 0);
  const [maxTokens, setMaxTokens] = useState<number>(item?.maxTokens || 0);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
      mainInput.current?.input.current?.select();
    }, 100);
  }, []);

  useEffect(() => {
    // let object: any = {};
    // if (sampleSourceRow) {
    //   object = { ...object, row: sampleSourceRow.data };
    // }
    let variables: { [key: string]: string } = {};
    if (promptFlow.inputVariables.length > 0) {
      promptFlow.inputVariables.forEach((variable) => {
        const type = variable.type as PromptFlowVariableType;
        if (type === "text") {
          variables[variable.name] = "Sample text";
        } else if (type === "number") {
          variables[variable.name] = "0.0";
        } else {
          variables[variable.name] = "Unknown variable type";
        }
      });
      // object = { ...object, variable: variables };
    }
    setTemplateDto({
      ...templateDto,
      source: JSON.stringify(
        TemplateApiHelper.getTemplateValue({
          allEntities,
          session: {
            user: appOrAdminData.user,
            tenant: sampleSourceRow?.tenant ?? null,
          },
          t,
          row: sampleSourceRow ?? undefined,
          variables,
        }),
        null,
        2
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleSourceRow, promptFlow.inputVariables]);

  useEffect(() => {
    if (
      order !== item?.order ||
      title !== item?.title ||
      templateDto.template !== item?.template ||
      temperature !== item?.temperature ||
      maxTokens !== item?.maxTokens
    ) {
      onChanged(idx, {
        order,
        title,
        template: templateDto.template,
        temperature,
        maxTokens,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, title, templateDto.template, temperature, maxTokens]);

  useEffect(() => {
    const autocompletions: MonacoAutoCompletion[] = [];
    allEntities
      .sort((a, b) => a.order - b.order)
      .forEach((entity) => {
        if (promptFlow.inputEntity?.name !== entity.name) {
          return;
        }
        // const label = `row.${entity.name}`;
        // autocompletions.push({
        //   label,
        //   kind: "Value",
        //   documentation: t(entity.title),
        //   insertText: `${t(entity.titlePlural)}: {{${label}}}`,
        //   // range: range,
        // });
        entity.properties
          .filter((f) => !f.isDefault)
          .sort((a, b) => a.order - b.order)
          .forEach((property) => {
            const label = `row.${entity.name}.${property.name}`;
            autocompletions.push({
              label,
              kind: "Value",
              documentation: t(property.title),
              insertText: `${t(property.title)}: {{${label}}}`,
            });
          });

        // entity.childEntities.forEach((child) => {
        //   const childEntity = allEntities.find((f) => f.id === child.childId);
        //   if (!childEntity) {
        //     return;
        //   }
        //   const label = `row.${entity.name}.${childEntity.name}[]`;
        //   autocompletions.push({
        //     label,
        //     kind: "Value",
        //     documentation: t(childEntity.title),
        //     insertText: `${t(childEntity.titlePlural)}: {{${label}}}`,
        //     // range: range,
        //   });
        //   // childEntity.properties
        //   //   .filter((f) => !f.isDefault)
        //   //   .sort((a, b) => a.order - b.order)
        //   //   .forEach((property) => {
        //   //     const label = `row.${entity.name}.${childEntity.name}[].${property.name}`;
        //   //     autocompletions.push({
        //   //       label,
        //   //       kind: "Value",
        //   //       documentation: t(property.title),
        //   //       insertText: `${t(property.title)}: {{${label}}}`,
        //   //       // range: range,
        //   //     });
        //   //   });
        // });
      });

    for (let index = 0; index < idx; index++) {
      const label = `promptFlow.results.[${index}]`;
      const template = templates.length > index ? templates[index] : undefined;
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
    promptFlow.inputVariables.forEach((inputVariable) => {
      const label = `variable.${inputVariable.name}`;
      autocompletions.push({
        label,
        kind: "Value",
        documentation: t(inputVariable.title),
        insertText: `${inputVariable.title}: {{${label}}}`,
      });
    });
    const tenantVariables: { label: string; name: string }[] = [{ name: "Tenant", label: "{{session.tenant.name}}" }];
    const tenantSettingsEntity = allEntities.find((f) => f.name === "tenantSettings");
    tenantSettingsEntity?.properties
      .filter((f) => !f.isDefault)
      .forEach((property) => {
        tenantVariables.push({
          name: t(property.title),
          label: `{{session.tenant.${property.name}}}`,
        });
      });

    tenantVariables.push({
      name: "",
      label: tenantVariables.map((f) => `${f.name}: ${f.label}`).join("\n"),
    });

    tenantVariables.forEach((variable) => {
      const label = `${variable.label}`;
      let insertText = `${variable.name}: ${variable.label}`;
      if (!variable.name) {
        insertText = variable.label;
      }
      autocompletions.push({
        label,
        kind: "Value",
        documentation: `${variable.name}: ${variable.label}`,
        insertText,
      });
    });

    setAutocompletions(autocompletions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, allEntities, t, templates]);

  return (
    <div className="space-y-2 p-1">
      <TabsWithIcons
        className="w-full sm:w-auto"
        tabs={[
          {
            name: "Editor",
            current: selectedTab === 0,
            onClick: () => setSelectedTab(0),
          },
          {
            name: "Settings",
            current: selectedTab === 1,
            onClick: () => setSelectedTab(1),
          },
        ]}
      />
      {selectedTab === 0 ? (
        <Fragment>
          <PromptTemplateEditors
            promptFlow={promptFlow}
            promptTemplate={item}
            value={templateDto}
            onChange={(value) => setTemplateDto(value)}
            autocompletions={autocompletions}
            sampleSourceRow={sampleSourceRow}
          />
        </Fragment>
      ) : selectedTab === 1 ? (
        <Fragment>
          <div className="mx-auto grid max-w-md gap-2 p-2">
            <InputText ref={mainInput} autoFocus name="title" title={t("shared.title")} value={title} setValue={(e) => setTitle(e)} required />
            <InputNumber
              name="temperature"
              title="Temperature"
              value={temperature}
              setValue={(e) => setTemperature(Number(e))}
              required
              min={0.1}
              max={1.0}
              step={"0.1"}
            />
            <InputNumber name="maxTokens" title="Max Tokens" value={maxTokens} setValue={(e) => setMaxTokens(Number(e))} />
          </div>
        </Fragment>
      ) : null}
    </div>
  );
}
