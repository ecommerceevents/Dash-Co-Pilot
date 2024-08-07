import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useParams, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import KbCategoryForm from "~/modules/knowledgeBase/components/bases/KbCategoryForm";
import { updateKnowledgeBaseArticle } from "~/modules/knowledgeBase/db/kbArticles.db.server";
import {
  deleteKnowledgeBaseCategory,
  getKbCategoryById,
  getKbCategoryBySlug,
  updateKnowledgeBaseCategory,
} from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetails } from "~/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseCategoryWithDetails;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const item = await getKbCategoryById(params.id!);
  if (!item) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  const data: LoaderData = {
    knowledgeBase,
    item,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });

  const item = await getKbCategoryById(params.id!);
  if (!item) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.kb.update");
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    const existing = await getKbCategoryBySlug({
      knowledgeBaseId: knowledgeBase.id,
      slug,
      language: params.lang!,
    });
    if (existing && existing.id !== item.id) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    try {
      await updateKnowledgeBaseCategory(item.id, {
        slug,
        title,
        description,
        icon,
        language: params.lang!,
        seoImage,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.kb.delete");
    await deleteKnowledgeBaseCategory(item.id);
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else if (action === "set-orders") {
    await verifyUserHasPermission(request, "admin.kb.update");
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateKnowledgeBaseArticle(id, {
          order: Number(order),
        });
      })
    );
    return json({ updated: true });
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const submit = useSubmit();
  const params = useParams();

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
      <KbCategoryForm knowledgeBase={data.knowledgeBase} language={params.lang!} item={data.item} onDelete={onDelete} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
