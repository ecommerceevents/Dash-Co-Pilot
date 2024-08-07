import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import KbCategoryForm from "~/modules/knowledgeBase/components/bases/KbCategoryForm";
import { createKnowledgeBaseCategory, getAllKnowledgeBaseCategories, getKbCategoryBySlug } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const data: LoaderData = {
    knowledgeBase,
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

  if (action === "new") {
    await verifyUserHasPermission(request, "admin.kb.create");
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    const allCategories = await getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: params.slug!,
      language: params.lang!,
    });
    let maxOrder = 0;
    if (allCategories.length > 0) {
      maxOrder = Math.max(...allCategories.map((i) => i.order));
    }

    const existing = await getKbCategoryBySlug({
      knowledgeBaseId: knowledgeBase.id,
      slug,
      language: params.lang!,
    });
    if (existing) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    try {
      await createKnowledgeBaseCategory({
        knowledgeBaseId: knowledgeBase.id,
        slug,
        title,
        description,
        icon,
        language: params.lang!,
        seoImage,
        order: maxOrder + 1,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();

  return (
    <div>
      <KbCategoryForm knowledgeBase={data.knowledgeBase} language={params.lang!} />
    </div>
  );
}
