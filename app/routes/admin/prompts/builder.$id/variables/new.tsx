import { LoaderFunctionArgs, json } from "@remix-run/node";
import { redirect } from "remix-typedjson";
import PromptFlowVariableForm from "~/modules/promptBuilder/components/outputs/PromptFlowVariableForm";
import { createPromptFlowVariable } from "~/modules/promptBuilder/db/promptFlowInputVariables.db.server";
import FormHelper from "~/utils/helpers/FormHelper";

type LoaderData = {};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const data: LoaderData = {};
  return json(data);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "new") {
    try {
      const type = form.get("type")?.toString() ?? "";
      const name = form.get("name")?.toString() ?? "";
      const title = form.get("title")?.toString() ?? "";
      const isRequired = FormHelper.getBoolean(form, "isRequired") ?? false;
      if (!type || !name || !title) {
        throw Error("Type, name, and title are required");
      }
      await createPromptFlowVariable({
        promptFlowId: params.id!,
        type,
        name,
        title,
        isRequired,
      });
      return redirect(`/admin/prompts/builder/${params.id}/variables`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function () {
  return (
    <div>
      <PromptFlowVariableForm item={undefined} />
    </div>
  );
}
