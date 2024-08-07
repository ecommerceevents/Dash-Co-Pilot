import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import KbCategorySectionForm from "~/modules/knowledgeBase/components/bases/KbCategorySectionForm";
import { getKbCategoryById } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { createKnowledgeBaseCategorySection } from "~/modules/knowledgeBase/db/kbCategorySections.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetails } from "~/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetails;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const category = await getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  const data: LoaderData = {
    knowledgeBase,
    category,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const category = await getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  if (action === "new") {
    await verifyUserHasPermission(request, "admin.kb.create");
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";

    let maxOrder = 0;
    if (category.sections.length > 0) {
      maxOrder = Math.max(...category.sections.map((i) => i.order));
    }

    try {
      await createKnowledgeBaseCategorySection({
        categoryId: category.id,
        order: maxOrder + 1,
        title,
        description,
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
      <KbCategorySectionForm knowledgeBase={data.knowledgeBase} category={data.category} language={params.lang!} />
    </div>
  );
}
