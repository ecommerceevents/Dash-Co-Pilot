import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import PromptFlowOutputForm from "~/modules/promptBuilder/components/outputs/PromptFlowOutputForm";
import {
  PromptFlowOutputWithDetails,
  deletePromptFlowOutput,
  getPromptFlowOutput,
  updatePromptFlowOutput,
} from "~/modules/promptBuilder/db/promptFlowOutputs.db.server";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  promptFlow: PromptFlowWithDetails;
  allEntities: EntityWithDetails[];
  item: PromptFlowOutputWithDetails;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const promptFlow = await getPromptFlow(params.id!);
  if (!promptFlow) {
    return redirect("/admin/prompts/builder");
  }
  const item = await getPromptFlowOutput(params.output!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  const data: LoaderData = {
    promptFlow,
    allEntities: await getAllEntities({ tenantId: null }),
    item,
  };
  return json(data);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const item = await getPromptFlowOutput(params.output!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  if (action === "edit") {
    try {
      const type = form.get("type")?.toString() ?? "";
      const entityId = form.get("entityId")?.toString() ?? "";
      if (!type || !entityId) {
        throw Error("Type and entity are required");
      }
      await updatePromptFlowOutput(item.id, {
        type,
        entityId,
      });
      return redirect(`/admin/prompts/builder/${params.id}/outputs`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await deletePromptFlowOutput(item.id);
      return redirect(`/admin/prompts/builder/${params.id}/outputs`);
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
    confirmDelete.current?.show("Delete output?", "Delete", "Cancel", `Are you sure you want to delete the output?`);
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
      <PromptFlowOutputForm item={data.item} promptFlow={data.promptFlow} allEntities={data.allEntities} onDelete={onDelete} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
