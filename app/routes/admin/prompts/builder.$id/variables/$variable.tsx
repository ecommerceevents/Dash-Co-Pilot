import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import PromptFlowVariableForm from "~/modules/promptBuilder/components/outputs/PromptFlowVariableForm";
import {
  PromptFlowInputVariableWithDetails,
  deletePromptFlowVariable,
  getPromptFlowVariable,
  updatePromptFlowVariable,
} from "~/modules/promptBuilder/db/promptFlowInputVariables.db.server";
import FormHelper from "~/utils/helpers/FormHelper";

type LoaderData = {
  item: PromptFlowInputVariableWithDetails;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const item = await getPromptFlowVariable(params.variable!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/variables`);
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const item = await getPromptFlowVariable(params.variable!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/variables`);
  }
  if (action === "edit") {
    try {
      const type = form.get("type")?.toString() ?? "";
      const name = form.get("name")?.toString() ?? "";
      const title = form.get("title")?.toString() ?? "";
      const isRequired = FormHelper.getBoolean(form, "isRequired") ?? false;
      if (!type || !name || !title) {
        throw Error("Type, name, and title are required");
      }
      await updatePromptFlowVariable(item.id, {
        type,
        name,
        title,
        isRequired,
      });
      return redirect(`/admin/prompts/builder/${params.id}/variables`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await deletePromptFlowVariable(item.id);
      return redirect(`/admin/prompts/builder/${params.id}/variables`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete variable?", "Delete", "Cancel", `Are you sure you want to delete the variable?`);
  }

  function onConfirmDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div>
      <PromptFlowVariableForm item={data.item} onDelete={onDelete} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
