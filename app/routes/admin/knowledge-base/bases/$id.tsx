import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ServerError from "~/components/ui/errors/ServerError";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import KnowledgeBaseForm from "~/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import { getKnowledgeBaseBySlug, updateKnowledgeBase } from "~/modules/knowledgeBase/db/knowledgeBase.db.server";
import { KbNavLinkDto } from "~/modules/knowledgeBase/dtos/KbNavLinkDto";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: KnowledgeBaseDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await KnowledgeBaseService.getById({ id: params.id!, request });
  if (!item) {
    return redirect("/admin/knowledge-base/bases");
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await KnowledgeBaseService.getById({ id: params.id!, request });
  if (!item) {
    return redirect("/admin/knowledge-base/bases");
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.kb.update");

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

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }
    if (slug.startsWith("/")) {
      slug = slug.substring(1);
    }

    const existing = await getKnowledgeBaseBySlug(slug);
    if (existing && existing.id !== item.id) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    try {
      await updateKnowledgeBase(item.id, {
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
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.kb.delete");
    try {
      await KnowledgeBaseService.del(item);
      return redirect("/admin/knowledge-base/bases");
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete knowledge base?", "Delete", "Cancel", `Are you sure you want to delete knowledge base "${data.item.title}"?`);
  }

  function onConfirmedDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div>
      <KnowledgeBaseForm item={data.item} onDelete={onDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
