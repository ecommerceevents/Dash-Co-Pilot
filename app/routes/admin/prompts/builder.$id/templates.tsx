import { PromptFlowGroup } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useParams, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import OrderIndexButtons from "~/components/ui/sort/OrderIndexButtons";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import { getTranslations } from "~/locale/i18next.server";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import { PromptTemplateDto } from "~/modules/promptBuilder/dtos/PromptTemplateDto";
import { getAllPromptFlowGroups } from "~/modules/promptBuilder/db/promptFlowGroups.db.server";
import { PromptFlowWithDetails, getPromptFlow, updatePromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import InputSelector from "~/components/ui/input/InputSelector";
import toast from "react-hot-toast";
import { RowWithDetails, getAllRows } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { RowAsJson } from "~/utils/helpers/TemplateApiHelper";
import TemplateApiService from "~/utils/helpers/.server/TemplateApiService";
import PromptTemplateForm from "~/modules/promptBuilder/components/templates/PromptTemplateForm";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";

type LoaderData = {
  item: PromptFlowWithDetails;
  allEntities: EntityWithDetails[];
  promptFlowGroups: PromptFlowGroup[];
  inputEntityRows: RowWithDetails[];
  sampleSourceRow: RowAsJson | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const item = await getPromptFlow(params.id!);
  await verifyUserHasPermission(request, "admin.prompts.update");
  if (!item) {
    return redirect("/admin/prompts/builder");
  }
  const allEntities = await getAllEntities({ tenantId: null });

  let inputEntityRows: RowWithDetails[] = [];
  if (item.inputEntity) {
    inputEntityRows = await getAllRows(item.inputEntity.id);
  }
  let sampleSourceRow: RowAsJson | null = null;
  const searchParams = new URL(request.url).searchParams;
  const sampleSourceRowId = searchParams.get("sampleSourceRowId");
  if (sampleSourceRowId) {
    sampleSourceRow = await TemplateApiService.getRowInApiFormatWithRecursiveRelationships({
      entities: allEntities,
      rowId: sampleSourceRowId,
      t,
      options: {
        exclude: ["id", "folio", "createdAt", "updatedAt", "createdByUser", "createdByApiKey"],
      },
    });
  }
  const data: LoaderData = {
    item,
    allEntities,
    promptFlowGroups: await getAllPromptFlowGroups(),
    inputEntityRows,
    sampleSourceRow,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await getPromptFlow(params.id!);
  if (!item) {
    return redirect("/admin/prompts/builder");
  }

  if (action === "save-templates") {
    const templates: PromptTemplateDto[] = form.getAll("templates[]").map((f) => {
      return JSON.parse(f.toString());
    });

    try {
      await updatePromptFlow(item.id, {
        templates,
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
    }

    return json({ success: t("shared.saved") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const [inputEntity, setInputEntity] = useState<EntityWithDetails | undefined>(undefined);

  useEffect(() => {
    const inputEntity = data.allEntities.find((f) => f.name === data.item.inputEntity?.name);
    setInputEntity(inputEntity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.allEntities]);

  const [templates, setTemplates] = useState<PromptTemplateDto[]>(
    data.item?.templates.map((f) => {
      return {
        title: f.title,
        template: f.template,
        temperature: Number(f.temperature),
        maxTokens: Number(f.maxTokens),
        order: f.order,
      };
    }) || []
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  useEffect(() => {
    if (selectedIdx === -1 && templates.length > 0) {
      setSelectedIdx(0);
    } else if (templates.length === 0) {
      setTemplates([
        ...templates,
        {
          title: "Untitled " + (templates.length + 1),
          template: "",
          temperature: OpenAIDefaults.temperature,
          order: templates.length + 1,
          maxTokens: 0,
        },
      ]);
      setSelectedIdx(templates.length);
    }
  }, [selectedIdx, templates]);

  // function onSaveTemplate(item: PromptTemplateDto) {
  //   const idx = showModal?.idx;
  //   if (idx !== undefined) {
  //     templates[idx] = item;
  //   } else {
  //     templates.push({
  //       ...item,
  //       order: templates.length + 1,
  //     });
  //   }
  //   setTemplates([...templates]);
  //   setShowModal(undefined);
  // }

  function addTemplate() {
    setTemplates([
      ...templates,
      {
        title: "Untitled " + (templates.length + 1),
        template: "",
        temperature: OpenAIDefaults.temperature,
        order: templates.length + 1,
        maxTokens: 0,
      },
    ]);
    setSelectedIdx(templates.length);
  }

  return (
    <Form method="post" className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: false },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: true },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: false },
        ]}
      />

      <div className="my-1 overflow-hidden lg:h-[calc(100vh-250px)]">
        <input type="hidden" name="action" value="save-templates" hidden readOnly />
        {templates.map((template, index) => {
          return <input type="hidden" name="templates[]" value={JSON.stringify(template)} key={index} />;
        })}
        <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
          <div className="overflow-y-auto lg:w-3/12">
            <div className="overflow-y-auto">
              <ul className="divide-y divide-gray-100 overflow-y-scroll rounded-md border border-gray-300 bg-white">
                {templates
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <li key={idx}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIdx(idx);
                        }}
                        className={clsx(
                          "w-full cursor-pointer truncate rounded-sm border-2 border-dashed px-2 py-1 text-left text-sm",
                          selectedIdx === idx ? "border-transparent bg-gray-100 text-gray-900 " : "border-transparent text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className="group flex h-7 items-center justify-between space-x-1">
                          <div className="flex items-center space-x-2">
                            <OrderIndexButtons
                              className="hidden flex-shrink-0 2xl:block"
                              idx={idx}
                              items={templates.map((f, i) => {
                                return {
                                  idx: i,
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
                            <div className="flex flex-col truncate">
                              <div className="truncate">{item.title}</div>
                              {/* {file.directory && <span className="text-xs font-medium text-gray-400">{file.directory}/</span>} */}
                            </div>
                          </div>

                          <div className={clsx("hidden flex-shrink-0", templates.length > 0 && "group-hover:block")}>
                            <button
                              type="button"
                              disabled={templates.length === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplates(
                                  templates
                                    .filter((f, i) => i !== idx)
                                    .map((f, idx) => {
                                      return { ...f, order: idx + 1 };
                                    })
                                );
                                setSelectedIdx(-1);
                              }}
                            >
                              <TrashIcon
                                className={clsx("h-4 w-4 text-gray-400", templates.length === 1 ? "cursor-not-allowed" : "cursor-pointer hover:text-gray-600")}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                <li>
                  <button
                    type="button"
                    onClick={addTemplate}
                    className={clsx(
                      "w-full  cursor-pointer truncate rounded-sm border-2 border-dashed px-2 py-1 text-left text-sm",
                      "border-transparent text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="truncate text-center font-bold">
                        <PlusIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:w-9/12">
            <div className="space-y-2">
              {inputEntity && (
                <div>
                  <div className="mb-1 flex items-center space-x-1 truncate text-xs font-medium text-gray-600">
                    {!data.sampleSourceRow && <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-yellow-600" />}
                    <div className="truncate">
                      Select a sample <strong>{t(inputEntity.title)}</strong> row to use as sample data for the prompt.
                    </div>
                  </div>

                  <InputSelector
                    value={searchParams.get("sampleSourceRowId")?.toString()}
                    setValue={(e) => {
                      const row = data.inputEntityRows.find((f) => f.id === e);
                      if (row) {
                        searchParams.set("sampleSourceRowId", row.id);
                        setSearchParams(searchParams);
                      }
                    }}
                    options={data.inputEntityRows.map((item) => {
                      const entity = data.allEntities.find((e) => e.id === item.entityId)!;
                      let name = RowHelper.getTextDescription({ entity, item, includeFolio: true });
                      if (item.tenant) {
                        name = `${item.tenant.name} - ${name} (${item.id})})`;
                      }
                      return {
                        value: item.id,
                        name,
                      };
                    })}
                  />
                </div>
              )}
              <div className="overflow-y-auto lg:h-[calc(100vh-250px)]">
                <PromptTemplateForm
                  key={selectedIdx}
                  idx={selectedIdx}
                  templates={templates}
                  item={templates[selectedIdx]}
                  promptFlow={data.item}
                  onChanged={(idx, data) => {
                    templates[idx] = data;
                    setTemplates([...templates]);
                  }}
                  allEntities={data.allEntities}
                  sampleSourceRow={data.sampleSourceRow}
                  inputEntityRows={data.inputEntityRows}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-1">
        {/* <ButtonSecondary
          onClick={() => {
            setTemplates(
              data.item?.templates.map((f) => {
                return {
                  title: f.title,
                  template: f.template,
                  temperature: Number(f.temperature),
                  maxTokens: Number(f.maxTokens),
                  order: f.order,
                };
              }) || []
            );
          }}
        >
          {t("shared.reset")}
        </ButtonSecondary> */}
        <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
      </div>
    </Form>
  );
}
