import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLocation, useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import DocumentDuplicateIconFilled from "~/components/ui/icons/DocumentDuplicateIconFilled";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import FolderIconFilled from "~/components/ui/icons/entities/FolderIconFilled";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import DraggableList from "~/components/ui/sort/DraggableList";
import OrderListButtons from "~/components/ui/sort/OrderListButtons";
import { deleteKnowledgeBaseArticle, getKbArticleById, getKbArticleBySlug, updateKnowledgeBaseArticle } from "~/modules/knowledgeBase/db/kbArticles.db.server";
import {
  deleteKnowledgeBaseCategory,
  getAllKnowledgeBaseCategories,
  getKbCategoryById,
  updateKnowledgeBaseCategory,
} from "~/modules/knowledgeBase/db/kbCategories.db.server";
import {
  deleteKnowledgeBaseCategorySection,
  getKbCategorySectionById,
  updateKnowledgeBaseCategorySection,
} from "~/modules/knowledgeBase/db/kbCategorySections.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetails } from "~/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "~/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseCategoryWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const items = await getAllKnowledgeBaseCategories({
    knowledgeBaseSlug: params.slug!,
    language: params.lang!,
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  const kb = await KnowledgeBaseService.get({ slug: params.slug!, request });

  if (action === "set-orders") {
    await verifyUserHasPermission(request, "admin.kb.update");
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateKnowledgeBaseCategory(id, {
          order: Number(order),
        });
      })
    );
    return json({ updated: true });
  } else if (action === "set-section-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateKnowledgeBaseCategorySection(id, {
          order: Number(order),
        });
      })
    );
    return json({ updated: true });
  } else if (action === "set-article-orders") {
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
  } else if (action === "delete-category") {
    const id = form.get("id")?.toString() ?? "";
    const existing = await getKbCategoryById(id);
    if (!existing) {
      return json({ error: "Category not found" }, { status: 400 });
    }
    await deleteKnowledgeBaseCategory(id);
    return json({ deleted: true });
  } else if (action === "delete-section") {
    const id = form.get("id")?.toString() ?? "";
    const existing = await getKbCategorySectionById(id);
    if (!existing) {
      return json({ error: "Section not found" }, { status: 400 });
    }
    await deleteKnowledgeBaseCategorySection(id);
    return json({ deleted: true });
  } else if (action === "delete-article") {
    const id = form.get("id")?.toString() ?? "";
    const existing = await getKbArticleById(id);
    if (!existing) {
      return json({ error: "Article not found" }, { status: 400 });
    }
    await deleteKnowledgeBaseArticle(id);
    return json({ deleted: true });
  } else if (action === "duplicate") {
    try {
      const categoryId = form.get("id")?.toString() ?? "";
      await KnowledgeBaseService.duplicateCategory({ kb, language: params.lang!, categoryId });
      return json({ duplicated: true });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "new") {
    try {
      const categoryId = form.get("categoryId")?.toString() ?? "";
      const sectionId = form.get("sectionId")?.toString() ?? "";
      const position = form.get("position")?.toString() ?? "";
      const title = form.get("title")?.toString() ?? "";
      const slug = form.get("slug")?.toString() ?? "";
      await KnowledgeBaseService.newArticle({
        kb,
        params,
        categoryId: categoryId.length > 0 ? categoryId : undefined,
        sectionId: sectionId.length > 0 ? sectionId : undefined,
        userId: userInfo.userId,
        title: title.length > 0 ? title : undefined,
        initialSlug: slug.length > 0 ? slug : undefined,
        position: position as any,
      });
      return json({ created: true });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "update-article-title") {
    try {
      const id = form.get("id")?.toString() ?? "";
      const title = form.get("title")?.toString() ?? "";
      const slug = UrlUtils.slugify(title);
      const existing = await getKbArticleBySlug({
        knowledgeBaseId: kb.id,
        slug,
        language: params.lang!,
      });
      if (existing && existing.id !== id) {
        return json({ error: "Slug already exists" }, { status: 400 });
      }
      await updateKnowledgeBaseArticle(id, {
        title,
        slug,
      });
      return json({ updated: true });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const submit = useSubmit();
  const location = useLocation();

  const [toggledCategories, setToggledCategories] = useState<string[]>([]);

  const confirmDeleteCategory = useRef<RefConfirmModal>(null);
  const confirmDeleteSection = useRef<RefConfirmModal>(null);
  const confirmDeleteArticle = useRef<RefConfirmModal>(null);

  function onDelete(item: KnowledgeBaseCategoryWithDetails) {
    confirmDeleteCategory.current?.setValue(item);
    confirmDeleteCategory.current?.show("Delete category?", "Delete", "Cancel", `Are you sure you want to delete the category "${item.title}"?`);
  }

  function onConfirmedDeleteCategory(item: KnowledgeBaseCategoryWithDetails) {
    const form = new FormData();
    form.set("action", "delete-category");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteSection(item: { id: string; title: string }) {
    confirmDeleteSection.current?.setValue(item);
    confirmDeleteSection.current?.show("Delete section", "Delete", "Cancel", `Are you sure you want to delete the section "${item.title}"?`);
  }

  function onConfirmedDeleteSection(item: KnowledgeBaseCategoryWithDetails) {
    const form = new FormData();
    form.set("action", "delete-section");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function onDuplicate(item: KnowledgeBaseCategoryWithDetails) {
    const form = new FormData();
    form.set("action", "duplicate");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function onNewArticle(categoryId: string, sectionId: string | undefined, position: "first" | "last") {
    const form = new FormData();
    form.set("action", "new");
    form.set("categoryId", categoryId);
    form.set("sectionId", sectionId ?? "");
    form.set("position", position);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteArticle(item: { id: string; title: string }) {
    confirmDeleteArticle.current?.setValue(item);
    confirmDeleteArticle.current?.show("Delete article", "Delete", "Cancel", `Are you sure you want to delete the article "${item.title}"?`);
  }

  function onConfirmedDeleteArticle(item: { id: string; title: string }) {
    const form = new FormData();
    form.set("action", "delete-article");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function getOutletTitle() {
    if (location.pathname.includes("/sections/")) {
      if (params.section) {
        return "Edit section";
      } else {
        return "Create section";
      }
    } else {
      if (params.id) {
        return "Edit category";
      } else {
        return "Create category";
      }
    }
  }
  function onUpdateArticleTitle(article: { id: string; title: string }) {
    const form = new FormData();
    form.set("action", "update-article-title");
    form.set("id", article.id);
    form.set("title", article.title);
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title={`Categories (${KnowledgeBaseUtils.getLanguageName(params.lang!)})`}
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Categories", routePath: `/admin/knowledge-base/bases/${params.slug}/categories` },
        { title: params.lang!, routePath: `/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}` },
      ]}
    >
      <div className="space-y-2">
        {/* {JSON.stringify({
          articles: data.items.map((f) => {
            return {
              title: f.title,
              articles: f.articles.filter((a) => !a.sectionId).map((a) => a.title),
              sections: f.sections.map((s) => {
                return {
                  title: s.title,
                  articles: f.articles.filter((a) => a.sectionId === s.id).map((a) => a.title),
                };
              }),
            };
          }),
        })} */}
        {data.items.map((item, idx) => {
          return (
            <div key={idx} className="space-y-2">
              <div className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="hidden flex-shrink-0 sm:flex">
                          <OrderListButtons index={idx} items={data.items} editable={true} />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>
                                  {item.title}
                                  {item.sections.length > 0 && (
                                    <span className="ml-1 truncate text-xs">
                                      ({item.sections.length === 1 ? "1 section" : `${item.sections.length} sections`})
                                    </span>
                                  )}
                                </div>
                                <div>•</div>
                                {item.articles.filter((f) => f.publishedAt).length > 0 ? (
                                  <div className="truncate text-xs text-gray-400">
                                    {item.articles.filter((f) => f.publishedAt).length}{" "}
                                    {item.articles.filter((f) => f.publishedAt).length === 1 ? "article" : "articles"}
                                  </div>
                                ) : (
                                  <div className="truncate text-xs text-gray-400">No articles</div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton onDelete={() => onDelete(item)} canDelete={item.articles.length === 0} />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledCategories((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                        <Link
                          to={item.id}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <DocumentDuplicateIconFilled className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNewArticle(item.id, undefined, "first")}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {toggledCategories.includes(item.id) && (
                  <CategorySections
                    kb={data.knowledgeBase}
                    category={item}
                    onDeleteSection={onDeleteSection}
                    onNewArticle={onNewArticle}
                    onDeleteArticle={onDeleteArticle}
                    onUpdateArticleTitle={onUpdateArticleTitle}
                  />
                )}
              </div>
            </div>
          );
        })}
        <Link
          to={`new`}
          className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 px-12 py-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-gray-900" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new category</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDeleteCategory} onYes={onConfirmedDeleteCategory} destructive />
      <ConfirmModal ref={confirmDeleteSection} onYes={onConfirmedDeleteSection} destructive />
      <ConfirmModal ref={confirmDeleteArticle} onYes={onConfirmedDeleteArticle} destructive />
      <ActionResultModal actionData={actionData} showSuccess={false} />

      <SlideOverWideEmpty
        title={getOutletTitle()}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}

function CategorySections({
  kb,
  category,
  onDeleteSection,
  onNewArticle,
  onDeleteArticle,
  onUpdateArticleTitle,
}: {
  kb: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetails;
  onDeleteSection: (section: { id: string; title: string }) => void;
  onNewArticle: (categoryId: string, sectionId: string | undefined, position: "first" | "last") => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
}) {
  const [toggledSections, setToggledSections] = useState<string[]>([]);
  const articles = category.articles.filter((f) => !f.sectionId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2 pb-2">
      <div className="w-full space-y-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
        <div className="text-sm font-medium text-gray-700">Articles</div>
        <div className="space-y-2">
          <ArticlesList kb={kb} articles={articles} onUpdateArticleTitle={onUpdateArticleTitle} onDeleteArticle={onDeleteArticle} />
          <button
            type="button"
            onClick={() => onNewArticle(category.id, undefined, "last")}
            className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-200 px-12 py-4 text-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-gray-600">{category.title} - Add article</span>
          </button>
        </div>
        <div className="text-sm font-medium text-gray-700">Sections</div>
        <div className="space-y-2">
          {category.sections.map((item, idx) => {
            return (
              <div key={idx} className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="hidden flex-shrink-0 sm:flex">
                          <OrderListButtons
                            formData={{
                              categoryId: item.id,
                            }}
                            actionName="set-section-orders"
                            index={idx}
                            items={category.sections}
                            editable={true}
                          />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>{item.title}</div>
                                <div>•</div>
                                <div className="truncate text-xs text-gray-400">
                                  {category.articles.filter((f) => f.sectionId === item.id).length}{" "}
                                  {category.articles.filter((f) => f.sectionId === item.id).length === 1 ? "article" : "articles"}
                                </div>
                              </div>
                              {/* <div className="text-xs text-gray-500">{item.description}</div> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton
                          onDelete={() => onDeleteSection(item)}
                          canDelete={category.articles.filter((f) => f.sectionId === item.id).length === 0}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledSections((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                        <Link
                          to={`${category.id}/sections/${item.id}`}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onNewArticle(category.id, item.id, "first")}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {toggledSections.includes(item.id) && (
                  <SectionArticles
                    kb={kb}
                    category={category}
                    section={item}
                    onNewArticle={onNewArticle}
                    onUpdateArticleTitle={onUpdateArticleTitle}
                    onDeleteArticle={onDeleteArticle}
                  />
                )}
              </div>
            );
          })}
          <Link
            to={`${category.id}/sections/new`}
            className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-200 px-12 py-4 text-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-gray-600">Add section</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionArticles({
  kb,
  category,
  section,
  onNewArticle,
  onUpdateArticleTitle,
  onDeleteArticle,
}: {
  kb: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetails;
  section: { id: string; order: number; title: string; description: string };
  onNewArticle: (categoryId: string, sectionId: string, position: "first" | "last") => void;
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
}) {
  const articles = category.articles.filter((f) => f.sectionId === section.id).sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-2 pb-2">
      <div className="w-full space-y-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
        <div className="space-y-2">
          <ArticlesList kb={kb} articles={articles} onUpdateArticleTitle={onUpdateArticleTitle} onDeleteArticle={onDeleteArticle} />
          {/* {articles.map((item, idx) => {
            return (
              <div key={idx} className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="hidden flex-shrink-0 sm:flex">
                          <OrderListButtons actionName="set-article-orders" index={idx} items={articles} editable={true} />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <ColorBadge color={item.publishedAt ? Colors.GREEN : Colors.YELLOW} />
                                <div className="flex items-baseline space-x-1">{item.title}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <Link
                          to={`/admin/knowledge-base/bases/${kb.slug}/articles/${item.language}/${item.id}`}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </Link>
                        <button
                          type="button"
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                          onClick={() => onDeleteArticle(item)}
                        >
                          <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })} */}
          <button
            type="button"
            onClick={() => onNewArticle(category.id, section.id, "last")}
            className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-200 px-12 py-4 text-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-gray-600">{section.title} - Add article</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticlesList({
  kb,
  articles,
  onUpdateArticleTitle,
  onDeleteArticle,
}: {
  kb: KnowledgeBaseDto;
  articles: {
    id: string;
    order: number;
    title: string;
    description: string;
    slug: string;
    language: string;
    sectionId: string | null;
    publishedAt: Date | null;
  }[];
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
}) {
  const handleUpdateArticleTitle = (articleId: string, newTitle: string) => {
    const article = articles.find((article) => article.id === articleId);
    if (article) {
      const updatedArticle = { ...article, title: newTitle };
      onUpdateArticleTitle(updatedArticle);
    }
  };
  return (
    <DraggableList
      className="space-y-1"
      items={articles}
      actionName="set-article-orders"
      render={(item) => {
        return (
          <div className="rounded-md border border-gray-300 bg-white px-4 py-0.5 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className=" flex items-center space-x-3 truncate">
                    {/* <div className="hidden flex-shrink-0 sm:flex">
                            <OrderListButtons actionName="set-article-orders" index={idx} items={articles} editable={true} />
                          </div> */}
                    <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                      <div className="flex items-baseline space-x-1 truncate">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <ColorBadge color={item.publishedAt ? Colors.GREEN : Colors.YELLOW} />
                            <div className="flex flex-col">
                              <div
                                className="flex cursor-text items-baseline space-x-1 text-sm text-gray-800 focus:outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(event) => handleUpdateArticleTitle(item.id, event.target.innerText)}
                                onPaste={(event) => {
                                  event.preventDefault();
                                  const plainText = event.clipboardData.getData("text/plain");
                                  (event.target as HTMLElement).textContent = plainText;
                                }}
                              >
                                {item.title || "{Untitled}"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {KnowledgeBaseUtils.getArticleUrl({
                                  kb,
                                  article: item,
                                  params: {},
                                })}
                              </div>
                            </div>
                          </div>
                          {/* <div className="text-xs text-gray-500">{item.description}</div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 space-x-1">
                  <div className="flex items-center space-x-1 truncate p-1">
                    <Link
                      to={`/admin/knowledge-base/bases/${kb.slug}/articles/${item.language}/${item.id}`}
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                    <button
                      type="button"
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      onClick={() => onDeleteArticle(item)}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

function DeleteButton({ onDelete, canDelete }: { onDelete: () => void; canDelete: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "group flex items-center rounded-md border border-transparent p-2 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        !canDelete ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
      )}
      disabled={!canDelete}
      onClick={onDelete}
    >
      <TrashIcon className={clsx("h-4 w-4 text-gray-300", canDelete && "group-hover:text-gray-500")} />
    </button>
  );
}
