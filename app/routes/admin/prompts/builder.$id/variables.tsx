import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { redirect, useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import XIcon from "~/components/ui/icons/XIcon";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import { getTranslations } from "~/locale/i18next.server";
import {
  PromptFlowInputVariableWithDetails,
  deletePromptFlowVariable,
  getPromptFlowVariables,
} from "~/modules/promptBuilder/db/promptFlowInputVariables.db.server";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { PromptFlowVariableTypes } from "~/modules/promptBuilder/dtos/PromptFlowVariableType";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: PromptFlowWithDetails;
  items: PromptFlowInputVariableWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getPromptFlow(params.id!);
  await verifyUserHasPermission(request, "admin.prompts.update");
  if (!item) {
    return redirect("/admin/prompts/builder");
  }
  const items = await getPromptFlowVariables(item.id);
  const data: LoaderData = {
    item,
    items,
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

  if (action === "delete-variable") {
    const id = form.get("id")?.toString() ?? "";
    try {
      await deletePromptFlowVariable(id);
      return json({ success: t("shared.deleted") });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const submit = useSubmit();
  const navigate = useNavigate();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  function onDelete(item: PromptFlowInputVariableWithDetails) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show("Delete variable?", "Delete", "Cancel", `Are you sure you want to delete this variable?`);
  }

  function onConfirmedDelete(item: PromptFlowInputVariableWithDetails) {
    const form = new FormData();
    form.set("action", "delete-variable");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: true },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: false },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: false },
        ]}
      />

      <div className="space-y-2">
        <TableSimple
          items={data.items}
          headers={[
            {
              name: "type",
              title: "Type",
              value: (i) => <div>{PromptFlowVariableTypes.find((f) => f.value === i.type)?.name ?? i.type}</div>,
            },
            {
              name: "title",
              title: "Title",
              className: "w-full",
              value: (i) => (
                <div className="flex flex-col">
                  <div>{i.title}</div>
                  <div className="text-sm text-gray-500">{i.name}</div>
                </div>
              ),
            },
            {
              name: "isRequired",
              title: "Required",
              value: (i) => <div>{i.isRequired ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
            },
            {
              name: "actions",
              title: "",
              value: (i) => (
                <div className="flex items-center space-x-1 truncate p-1">
                  <DeleteButton onDelete={() => onDelete(i)} canDelete={true} />
                  <Link
                    to={i.id}
                    className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </Link>
                </div>
              ),
            },
          ]}
        />
        <Link
          to={`new`}
          className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 px-12 py-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-gray-900" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new variable</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />

      <SlideOverWideEmpty
        title={params.id ? "Edit variable" : "Add variable"}
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
