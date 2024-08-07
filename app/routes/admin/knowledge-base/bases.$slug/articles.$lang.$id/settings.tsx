import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import KbArticleSettingsForm from "~/modules/knowledgeBase/components/bases/KbArticleSettingsForm";
import {
  KnowledgeBaseArticleSimple,
  KnowledgeBaseArticleWithDetails,
  deleteKnowledgeBaseArticle,
  getAllKnowledgeBaseArticlesSimple,
  getFeaturedKnowledgeBaseArticles,
  getKbArticleById,
  getKbArticleBySlug,
  updateKnowledgeBaseArticle,
} from "~/modules/knowledgeBase/db/kbArticles.db.server";
import { KnowledgeBaseCategorySimple, getAllKnowledgeBaseCategoriesSimple } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { getAllKnowledgeBaseNames } from "~/modules/knowledgeBase/db/knowledgeBase.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "~/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseArticleWithDetails;
  allKnowledgeBases: { id: string; title: string }[];
  allArticles: KnowledgeBaseArticleSimple[];
  allCategories: KnowledgeBaseCategorySimple[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const item = await getKbArticleById(params.id!);
  if (!item) {
    return redirect(`/admin/knowledge-base/bases/${params.slug!}/articles`);
  }
  const allCategories = await getAllKnowledgeBaseCategoriesSimple();
  let allArticles = await getAllKnowledgeBaseArticlesSimple();
  const data: LoaderData = {
    knowledgeBase,
    item,
    allKnowledgeBases: await getAllKnowledgeBaseNames(),
    allArticles,
    allCategories,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  const item = await getKbArticleById(params.id!);
  if (!item) {
    return json({ error: "Article not found" }, { status: 400 });
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.kb.update");
    const knowledgeBaseId = form.get("knowledgeBaseId")?.toString() ?? "";
    const categoryId = form.get("categoryId")?.toString() ?? "";
    const sectionId = form.get("sectionId")?.toString() ?? "";
    const language = form.get("language")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";
    const isFeatured = Boolean(form.get("isFeatured"));
    const relatedArticles = form.getAll("relatedArticles[]").map((l) => l.toString());

    const knowledgeBase = await KnowledgeBaseService.getById({ id: knowledgeBaseId, request });
    if (!knowledgeBase) {
      return json({ error: "Knowledge base not found" }, { status: 400 });
    }

    const existingLanguage = KnowledgeBaseUtils.supportedLanguages.find((f) => f.value === language);
    if (!existingLanguage) {
      return json({ error: "Language not found: " + language }, { status: 400 });
    }

    const existing = await getKbArticleBySlug({
      knowledgeBaseId,
      slug,
      language,
    });
    if (existing && existing.id !== item.id) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    let featuredOrder = item.featuredOrder;
    if (isFeatured) {
      if (!item.featuredOrder) {
        const featuredArticles = await getFeaturedKnowledgeBaseArticles({
          knowledgeBaseId,
          language,
        });
        let maxOrder = 0;
        if (featuredArticles.length > 0) {
          maxOrder = Math.max(...featuredArticles.map((p) => p.featuredOrder ?? 0));
        }
        featuredOrder = maxOrder + 1;
      }
    } else {
      featuredOrder = null;
    }

    await updateKnowledgeBaseArticle(item.id, {
      categoryId: categoryId?.length ? categoryId : null,
      sectionId: sectionId?.length ? sectionId : null,
      slug,
      title,
      description,
      order: item.order,
      language,
      featuredOrder,
      seoImage,
      relatedArticles,
    });

    return redirect(`/admin/knowledge-base/bases/${knowledgeBase.slug}/articles/${language}/${item.id}`);
  } else if (action === "delete") {
    const kb = await KnowledgeBaseService.get({ slug: params.slug!, request });
    await verifyUserHasPermission(request, "admin.kb.delete");
    await deleteKnowledgeBaseArticle(item.id);
    return redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${params.lang}`);
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete article?", "Delete", "Cancel", `Are you sure you want to delete the article "${data.item.title}"?`);
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
      <KbArticleSettingsForm
        allKnowledgeBases={data.allKnowledgeBases}
        allArticles={data.allArticles}
        allCategories={data.allCategories}
        item={data.item}
        onDelete={onDelete}
      />

      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
