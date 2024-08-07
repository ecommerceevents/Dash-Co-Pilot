import { ActionFunctionArgs, json } from "@remix-run/node";
import { redirect, useTypedActionData } from "remix-typedjson";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { getTranslations } from "~/locale/i18next.server";
import PromptGroupForm from "~/modules/promptBuilder/components/PromptGroupForm";
import { createPromptFlowGroup } from "~/modules/promptBuilder/db/promptFlowGroups.db.server";
import { PromptGroupTemplateDto } from "~/modules/promptBuilder/dtos/PromptGroupTemplateDto";

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "new") {
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";

    const templates: PromptGroupTemplateDto[] = form.getAll("templates[]").map((f) => {
      return JSON.parse(f.toString());
    });

    if (!title) {
      return json({ error: "Missing required fields." }, { status: 400 });
    }
    if (templates.length === 0) {
      return json({ error: "Missing templates." }, { status: 400 });
    }

    try {
      await createPromptFlowGroup({
        order: 0,
        title,
        description,
        templates,
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
    }

    return redirect("/admin/prompts/groups");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const actionData = useTypedActionData<ActionData>();

  return (
    <div>
      <PromptGroupForm item={undefined} />

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </div>
  );
}
