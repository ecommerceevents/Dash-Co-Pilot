import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import DateCell from "~/components/ui/dates/DateCell";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputFilters from "~/components/ui/input/InputFilters";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import {
  KnowledgeBaseArticleWithDetails,
  getAllKnowledgeBaseArticlesWithPagination,
  getKbArticleById,
  updateKnowledgeBaseArticle,
} from "~/modules/knowledgeBase/db/kbArticles.db.server";
import { getAllKnowledgeBaseCategories, updateKnowledgeBaseCategory } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { updateKnowledgeBaseCategorySection } from "~/modules/knowledgeBase/db/kbCategorySections.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "~/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getUserInfo } from "~/utils/session.server";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseArticleWithDetails[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "title",
      title: "Title",
    },
    {
      name: "description",
      title: "Description",
    },
    {
      name: "categoryId",
      title: "Category",
      options: [
        { value: "null", name: "{null}" },
        ...(await getAllKnowledgeBaseCategories({ knowledgeBaseSlug: knowledgeBase.slug, language: params.lang! })).map((item) => {
          return {
            value: item.id,
            name: item.title,
          };
        }),
      ],
    },
    {
      name: "content",
      title: "Content",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const filtered = {
    title: filters.properties.find((f) => f.name === "title")?.value ?? filters.query ?? undefined,
    description: filters.properties.find((f) => f.name === "description")?.value ?? filters.query ?? undefined,
    categoryId: filters.properties.find((f) => f.name === "categoryId")?.value ?? undefined,
    content: filters.properties.find((f) => f.name === "content")?.value ?? filters.query ?? undefined,
  };
  const { items, pagination } = await getAllKnowledgeBaseArticlesWithPagination({
    knowledgeBaseSlug: params.slug!,
    language: params.lang!,
    pagination: currentPagination,
    filters: {
      title: filtered.title,
      description: filtered.description,
      categoryId: filtered.categoryId === "null" ? null : filtered.categoryId,
      content: filtered.content,
    },
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
    pagination,
    filterableProperties,
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

  if (action === "new") {
    await verifyUserHasPermission(request, "admin.kb.create");
    const created = await KnowledgeBaseService.newArticle({
      kb,
      params,
      userId: userInfo.userId,
      position: "last",
    });
    return redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${params.lang}/${created.id}/edit`);
  } else if (action === "set-orders") {
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
  } else if (action === "duplicate") {
    try {
      const id = form.get("id")?.toString() ?? "";
      const item = await KnowledgeBaseService.duplicateArticle({ kb, language: params.lang!, articleId: id });
      return redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${params.lang}/${item.id}`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "toggle") {
    const id = form.get("id")?.toString() ?? "";
    const isFeatured = form.get("isFeatured")?.toString() === "true";

    const item = await getKbArticleById(id);
    if (!item) {
      return json({ error: "Not found" }, { status: 404 });
    }

    let featuredOrder = item.featuredOrder;
    if (isFeatured) {
      if (!item.featuredOrder) {
        const featuredArticles = await KnowledgeBaseService.getFeaturedArticles({
          kb,
          params: {},
          request,
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
      featuredOrder,
    });

    return json({ success: "Updated" });
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const submit = useSubmit();

  function onDuplicate(item: KnowledgeBaseArticleWithDetails) {
    const form = new FormData();
    form.set("action", "duplicate");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }
  function onToggle(item: KnowledgeBaseArticleWithDetails, isFeatured: boolean) {
    const form = new FormData();
    form.set("action", "toggle");
    form.set("isFeatured", isFeatured ? "true" : "false");
    form.set("id", item.id.toString());
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title={`Articles (${KnowledgeBaseUtils.getLanguageName(params.lang!)})`}
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Articles", routePath: `/admin/knowledge-base/bases/${params.slug}/articles` },
        { title: params.lang!, routePath: `/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}` },
      ]}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <ButtonPrimary
            onClick={() => {
              const form = new FormData();
              form.set("action", "new");
              submit(form, {
                method: "post",
              });
            }}
          >
            <div>New</div>
            <PlusIcon className="h-5 w-5" />
          </ButtonPrimary>
        </>
      }
    >
      <div className="space-y-2">
        <TableSimple
          items={data.items}
          pagination={data.pagination}
          actions={[
            {
              title: "Settings",
              onClickRoute: (_, item) => `${item.id}/settings`,
            },
            {
              title: "Duplicate",
              onClick: (_, item) => onDuplicate(item),
            },
            {
              title: "Edit",
              onClickRoute: (_, item) => `${item.id}`,
            },
          ]}
          headers={[
            {
              name: "status",
              title: "Status",
              value: (i) => (
                <div>{!i.publishedAt ? <SimpleBadge title="Draft" color={Colors.GRAY} /> : <SimpleBadge title="Published" color={Colors.TEAL} />}</div>
              ),
            },
            // {
            //   name: "language",
            //   title: "Language",
            //   value: (i) => KnowledgeBaseUtils.getLanguageName(i.language),
            // },
            {
              name: "title",
              title: "Title",
              className: "w-full",
              value: (i) => (
                <div className="space-y-1">
                  <Link to={i.id} className="font-medium hover:underline">
                    {i.title}
                  </Link>
                  {/* <div className="text-gray-600 text-sm">{i.description}</div> */}
                  {/* <div className="text-sm text-gray-500">{i.slug}</div>
                  <div className="text-gray-600 text-sm">{i.description}</div> */}
                </div>
              ),
            },
            {
              name: "category",
              title: "Category",
              value: (i) => (
                <div>
                  {i.category ? (
                    <div className="flex flex-col">
                      <div>{i.category.title}</div>

                      {i.section && <div className="text-xs text-gray-500">{i.section.title}</div>}
                    </div>
                  ) : (
                    <Link to={`${i.id}/settings`} className="text-xs italic text-gray-500 hover:underline">
                      No category
                    </Link>
                  )}
                </div>
              ),
            },
            {
              name: "characters",
              title: "Characters",
              value: (i) => NumberUtils.intFormat(i.contentPublishedAsText.length),
            },
            {
              name: "views",
              title: "Views",
              value: (i) => i._count.views,
            },
            {
              name: "upvotes",
              title: "Upvotes",
              value: (i) => i._count.upvotes,
            },
            {
              name: "downvotes",
              title: "Downvotes",
              value: (i) => i._count.downvotes,
            },
            {
              name: "featured",
              title: "Featured",
              value: (i) => {
                return <InputCheckbox asToggle value={i.featuredOrder ? true : false} setValue={(checked) => onToggle(i, Boolean(checked))} />;
              },
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (i) => (
                <div className="flex flex-col">
                  <DateCell date={i.createdAt} displays={["ymd"]} />
                  <div>
                    {i.createdByUser ? (
                      <div>
                        {i.createdByUser.firstName} {i.createdByUser.lastName}
                      </div>
                    ) : (
                      <div className="text-xs italic text-gray-500 hover:underline">No author</div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <ActionResultModal actionData={actionData} showSuccess={false} />

      <SlideOverWideEmpty
        title={"Article settings"}
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
