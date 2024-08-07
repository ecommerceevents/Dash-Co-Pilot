import { PromptFlowOutputMapping, PromptTemplate } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLocation, useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { redirect, useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import FolderIconFilled from "~/components/ui/icons/entities/FolderIconFilled";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import { getTranslations } from "~/locale/i18next.server";
import { deletePromptFlowOutputMapping } from "~/modules/promptBuilder/db/promptFlowOutputMappings.db.server";
import { PromptFlowOutputWithDetails, deletePromptFlowOutput, getPromptFlowOutputs } from "~/modules/promptBuilder/db/promptFlowOutputs.db.server";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import PromptFlowOutputUtils from "~/modules/promptBuilder/utils/PromptFlowOutputUtils";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: PromptFlowWithDetails;
  items: PromptFlowOutputWithDetails[];
  allEntities: EntityWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getPromptFlow(params.id!);
  await verifyUserHasPermission(request, "admin.prompts.update");
  if (!item) {
    return redirect("/admin/prompts/builder");
  }
  const items = await getPromptFlowOutputs(item.id);
  const data: LoaderData = {
    item,
    items,
    allEntities: await getAllEntities({ tenantId: null }),
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

  if (action === "delete-output") {
    const id = form.get("id")?.toString() ?? "";
    try {
      await deletePromptFlowOutput(id);
      return json({ success: t("shared.deleted") });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete-output-mapping") {
    const id = form.get("id")?.toString() ?? "";
    try {
      await deletePromptFlowOutputMapping(id);
      return json({ success: t("shared.deleted") });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const submit = useSubmit();
  const location = useLocation();
  const navigate = useNavigate();

  const confirmDeleteOutput = useRef<RefConfirmModal>(null);
  const confirmDeleteOutputMapping = useRef<RefConfirmModal>(null);

  const [toggledItems, setToggledItems] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  function onDeleteOutput(item: PromptFlowOutputWithDetails) {
    confirmDeleteOutput.current?.setValue(item);
    confirmDeleteOutput.current?.show("Delete output?", "Delete", "Cancel", `Are you sure you want to delete this output?`);
  }

  function onConfirmedDeleteOutput(item: PromptFlowOutputWithDetails) {
    const form = new FormData();
    form.set("action", "delete-output");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteMapping(item: PromptFlowOutputMapping) {
    confirmDeleteOutputMapping.current?.setValue(item);
    confirmDeleteOutputMapping.current?.show("Delete output mapping?", "Delete", "Cancel", `Are you sure you want to delete this output mapping?`);
  }

  function onConfirmedDeleteMapping(item: PromptFlowOutputMapping) {
    const form = new FormData();
    form.set("action", "delete-output-mapping");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function getOutletTitle() {
    if (location.pathname.includes("/mappings/")) {
      if (params.mapping) {
        return "Edit mapping";
      } else {
        return "Create mapping";
      }
    } else {
      if (params.output) {
        return "Edit output";
      } else {
        return "Create output";
      }
    }
  }
  return (
    <div className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: false },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: false },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: true },
        ]}
      />

      <div className="space-y-2">
        {data.items.map((item, idx) => {
          return (
            <div key={idx} className="space-y-2">
              <div className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>
                                  <span className="font-medium">{PromptFlowOutputUtils.getOutputTitle(item)}</span>: {t(item.entity.title)}
                                  {item.mappings.length > 0 && (
                                    <span className="ml-1 truncate text-xs">
                                      ({item.mappings.length === 1 ? "1 mapping" : `${item.mappings.length} mappings`})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton onDelete={() => onDeleteOutput(item)} canDelete={true} />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledItems((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                        <Link
                          to={item.id}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </Link>
                        <Link
                          to={`${item.id}/mappings/new`}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {!toggledItems.includes(item.id) && <PromptFlowOutputMappings promptFlowOutput={item} onDeleteMapping={onDeleteMapping} />}
              </div>
            </div>
          );
        })}
        <Link
          to={`new`}
          className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 px-12 py-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-gray-900" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new output</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDeleteOutput} onYes={onConfirmedDeleteOutput} destructive />
      <ConfirmModal ref={confirmDeleteOutputMapping} onYes={onConfirmedDeleteMapping} destructive />

      <SlideOverWideEmpty
        title={getOutletTitle()}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}

function PromptFlowOutputMappings({
  promptFlowOutput,
  onDeleteMapping,
}: {
  promptFlowOutput: PromptFlowOutputWithDetails;
  onDeleteMapping: (item: PromptFlowOutputMapping) => void;
}) {
  return (
    <div className="space-y-2 pb-2">
      <div className="w-full space-y-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
        <div className="text-sm font-medium text-gray-700">Mappings</div>
        <div className="space-y-2">
          <MappingsList output={promptFlowOutput} items={promptFlowOutput.mappings} onDeleteMapping={onDeleteMapping} />
          <Link
            to={`${promptFlowOutput.id}/mappings/new`}
            className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-200 px-12 py-4 text-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-gray-600">Add mapping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MappingsList({
  output,
  items,
  onDeleteMapping,
}: {
  output: PromptFlowOutputWithDetails;
  items: (PromptFlowOutputMapping & {
    promptTemplate: PromptTemplate;
    property: { id: string; name: string; title: string };
  })[];
  onDeleteMapping: (item: PromptFlowOutputMapping) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {items.map((item) => {
        return (
          <div key={item.id} className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className=" flex items-center space-x-3 truncate">
                    <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                      <div className="flex items-baseline space-x-1 truncate">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-1 text-sm text-gray-800">
                                {item.promptTemplate.title} &rarr; <span className="ml-1 font-medium">{t(item.property.title)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 space-x-1">
                  <div className="flex items-center space-x-1 truncate p-1">
                    <Link
                      to={`${output.id}/mappings/${item.id}`}
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                    <button
                      type="button"
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      onClick={() => onDeleteMapping(item)}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeleteButton({ onDelete, canDelete }: { onDelete: () => void; canDelete: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "group flex items-center rounded-md border border-transparent p-2 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        !canDelete ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
      )}
      disabled={!canDelete}
      onClick={onDelete}
    >
      <TrashIcon className={clsx("h-4 w-4 text-gray-300", canDelete && "group-hover:text-gray-500")} />
    </button>
  );
}
