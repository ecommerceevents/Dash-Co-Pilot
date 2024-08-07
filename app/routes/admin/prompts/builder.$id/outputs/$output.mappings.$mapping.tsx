import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import PromptFlowOutputMappingForm from "~/modules/promptBuilder/components/outputs/PromptFlowOutputMappingForm";
import {
  PromptFlowOutputMappingWithDetails,
  deletePromptFlowOutputMapping,
  getPromptFlowOutputMapping,
  updatePromptFlowOutputMapping,
} from "~/modules/promptBuilder/db/promptFlowOutputMappings.db.server";
import { PromptFlowOutputWithDetails, getPromptFlowOutput } from "~/modules/promptBuilder/db/promptFlowOutputs.db.server";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  promptFlow: PromptFlowWithDetails;
  promptFlowOutput: PromptFlowOutputWithDetails;
  allEntities: EntityWithDetails[];
  item: PromptFlowOutputMappingWithDetails;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const promptFlow = await getPromptFlow(params.id!);
  if (!promptFlow) {
    return redirect("/admin/prompts/builder");
  }
  const promptFlowOutput = await getPromptFlowOutput(params.output!);
  if (!promptFlowOutput) {
    return redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  const item = await getPromptFlowOutputMapping(params.mapping!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  const data: LoaderData = {
    promptFlow,
    promptFlowOutput,
    allEntities: await getAllEntities({ tenantId: null }),
    item,
  };
  return json(data);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const item = await getPromptFlowOutputMapping(params.mapping!);
  if (!item) {
    return redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  if (action === "edit") {
    try {
      const promptTemplateId = form.get("promptTemplateId")?.toString() ?? "";
      const propertyId = form.get("propertyId")?.toString() ?? "";
      if (!promptTemplateId || !propertyId) {
        throw Error("Prompt template and property are required");
      }
      await updatePromptFlowOutputMapping(item.id, {
        promptTemplateId,
        propertyId,
      });
      return redirect(`/admin/prompts/builder/${params.id}/outputs`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await deletePromptFlowOutputMapping(item.id);
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
      <PromptFlowOutputMappingForm
        item={data.item}
        promptFlow={data.promptFlow}
        promptFlowOutput={data.promptFlowOutput}
        allEntities={data.allEntities}
        onDelete={onDelete}
      />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
