import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useTypedActionData } from "remix-typedjson";
import ServerError from "~/components/ui/errors/ServerError";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import KnowledgeBaseForm from "~/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import { createKnowledgeBase, getKnowledgeBaseBySlug } from "~/modules/knowledgeBase/db/knowledgeBase.db.server";
import { KbNavLinkDto } from "~/modules/knowledgeBase/dtos/KbNavLinkDto";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "new") {
    await verifyUserHasPermission(request, "admin.kb.create");
    let basePath = form.get("basePath")?.toString() ?? "";
    let slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const defaultLanguage = form.get("defaultLanguage")?.toString() ?? "";
    const layout = form.get("layout")?.toString() ?? "";
    const color = Number(form.get("color")?.toString() ?? "");
    const enabled = Boolean(form.get("enabled"));
    const languages = form.getAll("languages[]").map((l) => l.toString());
    const links: KbNavLinkDto[] = form.getAll("links[]").map((l) => JSON.parse(l.toString()));
    const logo = form.get("logo")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    if (languages.length === 0) {
      return json({ error: "At least one language is required" }, { status: 400 });
    }
    const existing = await getKnowledgeBaseBySlug(slug);
    if (existing) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }
    if (slug.startsWith("/")) {
      slug = slug.substring(1);
    }
    try {
      await createKnowledgeBase({
        basePath,
        slug,
        title,
        description,
        defaultLanguage,
        layout,
        color,
        enabled,
        languages: JSON.stringify(languages),
        links: JSON.stringify(links),
        logo,
        seoImage,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }

    return redirect("/admin/knowledge-base/bases");
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();

  function onDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div>
      <KnowledgeBaseForm onDelete={onDelete} />

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
