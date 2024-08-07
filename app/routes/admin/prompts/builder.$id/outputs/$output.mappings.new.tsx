import { LoaderFunctionArgs, json } from "@remix-run/node";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import PromptFlowOutputMappingForm from "~/modules/promptBuilder/components/outputs/PromptFlowOutputMappingForm";
import { createPromptFlowOutputMapping } from "~/modules/promptBuilder/db/promptFlowOutputMappings.db.server";
import { PromptFlowOutputWithDetails, getPromptFlowOutput } from "~/modules/promptBuilder/db/promptFlowOutputs.db.server";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  promptFlow: PromptFlowWithDetails;
  promptFlowOutput: PromptFlowOutputWithDetails;
  allEntities: EntityWithDetails[];
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
  const data: LoaderData = {
    promptFlow,
    promptFlowOutput,
    allEntities: await getAllEntities({ tenantId: null }),
  };
  return json(data);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "new") {
    try {
      const promptTemplateId = form.get("promptTemplateId")?.toString() ?? "";
      const propertyId = form.get("propertyId")?.toString() ?? "";
      if (!promptTemplateId || !propertyId) {
        throw Error("Prompt template and property are required");
      }
      await createPromptFlowOutputMapping({
        promptFlowOutputId: params.output!,
        promptTemplateId,
        propertyId,
      });
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

  return (
    <div>
      <PromptFlowOutputMappingForm item={undefined} promptFlow={data.promptFlow} promptFlowOutput={data.promptFlowOutput} allEntities={data.allEntities} />
    </div>
  );
}
