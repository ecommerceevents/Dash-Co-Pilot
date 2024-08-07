import { ActionFunctionArgs, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { PromptFlowGroup } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { Link, Outlet, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import DateCell from "~/components/ui/dates/DateCell";
import { PromptFlowWithExecutions, getPromptFlowsWithExecutions } from "~/modules/promptBuilder/db/promptFlows.db.server";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import PromptBuilderDefault from "~/modules/promptBuilder/services/PromptBuilderDefault";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import PromptFlowUtils from "~/modules/promptBuilder/utils/PromptFlowUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import DropdownWithClick from "~/components/ui/dropdowns/DropdownWithClick";
import { getAllPromptFlowGroups } from "~/modules/promptBuilder/db/promptFlowGroups.db.server";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import PromptBuilderService from "~/modules/promptBuilder/services/.server/PromptBuilderService";

type LoaderData = {
  title: string;
  items: PromptFlowWithExecutions[];
  allEntities: EntityWithDetails[];
  groups: PromptFlowGroup[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
    items: await getPromptFlowsWithExecutions(),
    allEntities: await getAllEntities({ tenantId: null }),
    groups: await getAllPromptFlowGroups(),
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

  if (action === "createDefault") {
    await verifyUserHasPermission(request, "admin.prompts.create");
    const promptTitle = form.get("promptTitle")?.toString() ?? "";
    await PromptBuilderService.createDefault(promptTitle);
    return json({ success: t("shared.success") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();

  function onCreateDefault(promptTitle: string) {
    const form = new FormData();
    form.set("action", "createDefault");
    form.set("promptTitle", promptTitle);
    submit(form, {
      method: "post",
    });
  }

  function missingDefaultTemplates() {
    const templates = PromptBuilderDefault.myTemplates();
    return templates.filter((template) => !data.items.some((item) => item.title === template.title));
  }

  function onCreatePromptFlowInGroup(item: PromptFlowGroup) {
    const form = new FormData();
    form.set("action", "add-prompt-flow");
    form.set("id", item.id);
    submit(form, {
      action: "/admin/prompts/groups",
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title={t("prompts.builder.title")}
      buttons={
        <>
          {data.groups.length > 0 ? (
            <DropdownWithClick
              onClick={() => navigate("/admin/prompts/builder/new")}
              button={
                <div className="flex items-center space-x-2">
                  <PlusIcon className="h-3 w-3" />
                  <div>{t("shared.new")}</div>
                </div>
              }
              options={
                <div>
                  <div className="block w-full select-none bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-500">
                    <div>Groups</div>
                  </div>
                  {data.groups.map((f) => {
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                        tabIndex={-1}
                        onClick={() => onCreatePromptFlowInGroup(f)}
                      >
                        <div className="flex items-center space-x-2">
                          <PlusIcon className="h-3 w-3" />
                          <div>{f.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              }
            />
          ) : (
            <ButtonPrimary to="new">
              <div>{t("shared.new")}</div>
              <PlusIcon className="h-5 w-5" />
            </ButtonPrimary>
          )}
        </>
      }
    >
      {missingDefaultTemplates().length > 0 && (
        <InfoBanner title="Default Prompt Flows" text="">
          <div className="flex flex-wrap space-x-1">
            {missingDefaultTemplates().map((prompt) => {
              return (
                <ButtonSecondary
                  key={prompt.title}
                  disabled={navigation.state === "submitting" && navigation.formData?.get("title") === prompt.title.toString()}
                  onClick={() => onCreateDefault(prompt.title)}
                >
                  {navigation.state === "submitting" && navigation.formData?.get("title") === prompt.title.toString() ? (
                    <span>Creating...</span>
                  ) : (
                    <span>{prompt.title}</span>
                  )}
                </ButtonSecondary>
              );
            })}
          </div>
        </InfoBanner>
      )}

      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "title",
            title: "Title",
            value: (i) => (
              <div className="flex max-w-xs flex-col truncate">
                {i.promptFlowGroup && (
                  <div>
                    <SimpleBadge title={i.promptFlowGroup?.title} color={Colors.BLUE} />
                  </div>
                )}
                <Link to={i.id} className="truncate text-base font-bold hover:underline">
                  {i.title}
                </Link>
                {/* <div className="truncate text-sm text-gray-500">{i.description}</div> */}
              </div>
            ),
          },
          {
            name: "config",
            title: "Config",
            value: (i) => (
              <div className="flex flex-col">
                <div>{OpenAIDefaults.getModelName(i.model)}</div>
                <div className="text-xs font-medium text-gray-500">{OpenAIDefaults.getModelProvider(i.model)}</div>
              </div>
            ),
          },
          {
            name: "inputEntity",
            title: "Input Entity",
            value: (i) => (
              <div>
                {i.inputEntity ? (
                  <div className="flex flex-col">
                    <div>{t(i.inputEntity.title)}</div>
                    <div className="text-xs font-medium text-gray-500">{i.inputEntity.name}</div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            ),
          },
          {
            name: "action",
            title: "Action",
            value: (i) => <div>{i.actionTitle}</div>,
          },
          {
            name: "templates",
            title: "Templates",
            value: (i) => (
              <ShowPayloadModalButton
                withCopy={false}
                title={`${i.templates.length} templates`}
                description={`${i.templates.length} templates`}
                payload={JSON.stringify(i.templates)}
              />
            ),
            className: "w-full",
          },
          {
            name: "variables",
            title: "Variables",
            value: (i) => (
              <div className="flex flex-col">
                <ShowPayloadModalButton
                  withCopy={false}
                  title={`${PromptFlowUtils.getVariablesNeeded(i, data.allEntities).length} variables`}
                  description={`${PromptFlowUtils.getVariablesNeeded(i, data.allEntities).length} variables`}
                  payload={JSON.stringify(PromptFlowUtils.getVariablesNeeded(i, data.allEntities).map((f) => f.name))}
                />
              </div>
            ),
            className: "w-full",
          },
          {
            name: "outputs",
            title: "Outputs",
            value: (i) => (
              <div className="flex flex-col">
                <ShowPayloadModalButton
                  withCopy={false}
                  title={`${i.outputs.length} outputs`}
                  description={`${i.outputs.length} outputs`}
                  payload={JSON.stringify(
                    i.outputs.map((f) => ({
                      type: f.type,
                      entity: {
                        name: f.entity.name,
                        title: t(f.entity.title),
                      },
                      mappings: f.mappings.map((m) => ({
                        promptTemplate: m.promptTemplate.title,
                        property: {
                          name: m.property.name,
                          title: t(m.property.title),
                        },
                      })),
                    }))
                  )}
                />
              </div>
            ),
            className: "w-full",
          },
          {
            name: "executions",
            title: "Executions",
            value: (i) => (
              <Link to={`/admin/prompts/executions/${i.id}`} className="flex flex-col underline">
                <div>
                  {i.executions.length} {i.executions.length === 1 ? "execution" : "executions"}
                </div>
              </Link>
            ),
          },
          {
            name: "results",
            title: "Results",
            value: (i) => (
              <Link to={`/admin/prompts/results/${i.id}`} className="flex flex-col underline">
                <div>
                  {i.executions.reduce((a, b) => a + b.results.length, 0)} {i.executions.reduce((a, b) => a + b.results.length, 0) === 1 ? "result" : "results"}
                </div>
              </Link>
            ),
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt} />,
            className: "hidden xl:table-cell",
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">{t("prompts.builder.empty.title")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("prompts.builder.empty.description")}</p>
          </div>
        }
      />

      <ActionResultModal actionData={actionData} showSuccess={false} />

      <Outlet />
    </EditPageLayout>
  );
}

// function ExecuteModal({
//   item,
//   open,
//   onClose,
//   onCreate,
//   entities,
// }: {
//   item?: PromptFlowWithDetails;
//   open: boolean;
//   onClose: () => void;
//   onCreate: ({
//     item,
//     variables,
//     isDebugging,
//     model,
//   }: {
//     item: PromptFlowWithDetails;
//     variables: PromptBuilderVariableValueDto[];
//     isDebugging: boolean;
//     model: string;
//   }) => void;
//   entities: EntityWithDetails[];
// }) {
//   const { t } = useTranslation();
//   const [flow, setFlow] = useState<PromptFlowWithDetails | undefined>(item);
//   const [variablesValues, setVariablesValues] = useState<PromptBuilderVariableValueDto[]>([]);
//   const [model, setModel] = useState<string>("");
//   const [isDebugging, setIsDebugging] = useState(false);

//   useEffect(() => {
//     const variableValues: PromptBuilderVariableValueDto[] = [];

//     if (flow) {
//       const hardCodedVariables = [{ name: "idea", value: "SaaS for Contract Management" }];
//       PromptFlowUtils.getVariablesNeeded(flow, entities).forEach((variable) => {
//         const hardCodedVariable = hardCodedVariables.find((v) => v.name === variable.name);
//         if (hardCodedVariable) {
//           variableValues.push({ name: variable.name, type: variable.type, value: hardCodedVariable.value });
//           return;
//         }
//       });
//     }

//     setFlow(item);
//     setVariablesValues(variableValues);
//     setModel(item?.model ?? OpenAIDefaults.model);
//   }, [entities, flow, item]);

//   function create() {
//     onCreate({ item: flow!, variables: variablesValues, isDebugging, model });
//   }
//   function onChangeVariableValue(variable: PromptBuilderVariableDto, value: string) {
//     const newValues = variablesValues.filter((v) => v.name !== variable.name);
//     newValues.push({ name: variable.name, type: variable.type, value });
//     setVariablesValues(newValues);
//   }
//   return (
//     <Modal open={open} setOpen={onClose} size="2xl">
//       <Form
//         onSubmit={(e) => {
//           e.preventDefault();
//           create();
//         }}
//         className="inline-block w-full overflow-hidden bg-white p-1 text-left align-bottom sm:align-middle"
//       >
//         <div className="mt-3 sm:mt-5">
//           <h3 className="text-lg font-medium leading-6 text-gray-900">Execute Prompt Flow</h3>
//         </div>
//         {!flow ? (
//           <></>
//         ) : (
//           <>
//             <div className="mt-4 space-y-2">
//               <div className="flex items-center justify-between space-x-2 space-y-2">
//                 <InputSelect
//                   name="model"
//                   title="Model"
//                   value={model}
//                   setValue={(e) => setModel(e?.toString() ?? "")}
//                   options={OpenAIDefaults.models.map((f) => f)}
//                 />
//               </div>
//               {PromptFlowUtils.getVariablesNeeded(flow!, entities).length > 0 && (
//                 <div className="space-y-1">
//                   <label className="truncate text-xs font-medium text-gray-600">Variables</label>
//                   <div className="relative mt-1 grid rounded-md border border-gray-300 bg-gray-100 p-1 sm:grid-cols-2 md:grid-cols-3">
//                     {PromptFlowUtils.getVariablesNeeded(flow!, entities).map((v, idx) => {
//                       return (
//                         <div key={v.name} className="space-y-1 truncate p-1">
//                           <label htmlFor={v.name} className="truncate text-xs font-medium text-gray-600">
//                             {v.name}
//                           </label>
//                           <input
//                             autoFocus={idx === 0}
//                             // placeholder={v.name}
//                             id={v.name}
//                             name={v.name}
//                             value={variablesValues.find((vv) => vv.name === v.name)?.value}
//                             onChange={(e) => onChangeVariableValue(v, e.target.value)}
//                             type="text"
//                             className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="mt-5 flex items-center justify-between space-x-2 sm:mt-6">
//               <div>
//                 <InputCheckboxInline name="isDebugging" title="Debugging" value={isDebugging} setValue={(v) => setIsDebugging(v)} />
//               </div>
//               <div className="flex justify-between space-x-2">
//                 <ButtonSecondary onClick={onClose} type="button">
//                   {t("shared.cancel")}
//                 </ButtonSecondary>
//                 <ButtonPrimary type="submit">Execute</ButtonPrimary>
//               </div>
//             </div>
//           </>
//         )}
//       </Form>
//     </Modal>
//   );
// }
