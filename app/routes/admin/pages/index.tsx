import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useEffect, useState } from "react";
import { getTranslations } from "~/locale/i18next.server";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { getPages, getPageBySlug, createPage } from "~/modules/pageBlocks/db/pages.db.server";
import { PageConfiguration } from "~/modules/pageBlocks/dtos/PageConfiguration";
import { getPageConfiguration, createDefaultPages } from "~/modules/pageBlocks/services/.server/pagesService";
import Modal from "~/components/ui/modals/Modal";
import clsx from "clsx";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { defaultPages } from "~/modules/pageBlocks/utils/defaultPages";
import toast from "react-hot-toast";

type LoaderData = {
  items: PageConfiguration[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.pages.view");
  const pages = await getPages();
  const items = await Promise.all(
    pages.map(async (page) => {
      return {
        ...(await getPageConfiguration({ request, t, page, slug: page.slug })),
        page,
      };
    })
  );
  const sortedItems: PageConfiguration[] = [];
  defaultPages.forEach((defaultPage) => {
    const item = items.find((item) => item.page.slug === defaultPage);
    if (item) {
      sortedItems.push(item);
    }
  });
  items.forEach((item) => {
    if (!sortedItems.find((f) => f.slug === item.page.slug)) {
      sortedItems.push(item);
    }
  });
  const data: LoaderData = {
    items: sortedItems,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.pages.create");
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create") {
    const slug = form.get("slug")?.toString();
    const isSubpage1 = form.get("isSubpage1")?.toString() === "true";
    if (!slug) {
      return json({ error: "Slug is required" }, { status: 400 });
    }
    if (slug.includes("/")) {
      return json({ error: "Slug cannot contain /" }, { status: 400 });
    }
    let finalSlug = "/" + slug;
    if (isSubpage1) {
      finalSlug = finalSlug + "/:id1";
    }
    const existing = await getPageBySlug(finalSlug, null);
    if (existing) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }
    const page = await createPage({
      slug: finalSlug,
    });
    return redirect(`/admin/pages/edit/${page.id}`);
  } else if (action === "create-default") {
    const created = await createDefaultPages();
    if (created.length > 0) {
      return json({ success: "Created default pages: " + created.map((f) => f.slug).join(", ") });
    } else {
      return json({ error: "All default pages already exist: " + defaultPages.join(", ") }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();
  const appOrAdminData = useAppOrAdminData();

  const [addingPage, setAddingPage] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
    }
  }, [actionData]);

  function createPage({ slug, isSubpage1 }: { slug: string; isSubpage1: boolean }) {
    const form = new FormData();
    form.append("action", "create");
    form.append("slug", slug);
    form.append("isSubpage1", isSubpage1 ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  function pendingDefaultPages() {
    return defaultPages.filter((defaultPage) => !data.items.find((f) => f.slug === defaultPage));
  }
  function onCreateDefault() {
    const form = new FormData();
    form.append("action", "create-default");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div>
      <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
        <div className="md:border-b md:border-gray-200 md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">{t("pages.title")}</h3>
            <div className="flex items-center space-x-2">
              {pendingDefaultPages().length > 0 && pendingDefaultPages().length !== defaultPages.length && (
                <ButtonSecondary onClick={onCreateDefault}>
                  {t("pages.actions.createDefault")}: {pendingDefaultPages().length}
                </ButtonSecondary>
              )}
              <ButtonPrimary disabled={!getUserHasPermission(appOrAdminData, "admin.pages.create")} onClick={() => setAddingPage(true)}>
                {t("shared.new")}
              </ButtonPrimary>
            </div>
          </div>
        </div>

        {pendingDefaultPages().length > 0 && data.items.length === 0 ? (
          <button
            type="button"
            onClick={onCreateDefault}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-bold">{t("pages.actions.createDefault")}</div>
              <div className="text-xs">
                {pendingDefaultPages()
                  .map((f) => (f === "/" ? "Landing" : f))
                  .join(", ")}
              </div>
            </div>
          </button>
        ) : (
          <TableSimple
            items={data.items}
            headers={[
              {
                name: "slug",
                title: "Slug",
                value: (item) => <div>{item.slug}</div>,
              },
              {
                name: "title",
                title: "Title",
                className: "w-full",
                value: (i) => <div className=" w-40 truncate">{i.page?.metaTags.find((f) => f.name === "title")?.value}</div>,
              },
              {
                name: "blocks",
                title: "Blocks",
                value: (i) => (i.page?.blocks ?? []).length,
              },
              {
                name: "metaTags",
                title: "Meta tags",
                value: (i) => (i.page?.metaTags ?? []).length,
              },
              {
                name: "status",
                title: "Status",
                value: (i) => (
                  <div>
                    {i.page?.isPublished && i.page.isPublic && <SimpleBadge title="Public" color={Colors.GREEN} />}
                    {i.page?.isPublished && !i.page.isPublic && <SimpleBadge title="Private" color={Colors.INDIGO} />}
                    {!i.page?.isPublished && <SimpleBadge title="Unpublished" color={Colors.RED} />}
                  </div>
                ),
              },
              {
                name: "actions",
                title: "Actions",
                value: (item) => (
                  <div className="flex items-center space-x-3">
                    <a href={item.slug} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-600 hover:underline">
                      <ExternalLinkEmptyIcon className="h-4 w-4" />
                    </a>
                    <Link to={`/admin/pages/edit/${item.page?.id}/blocks`} className="text-gray-500 hover:text-gray-600 hover:underline">
                      Blocks
                    </Link>
                    <Link to={`/admin/pages/edit/${item.page?.id}/seo`} className="text-gray-500 hover:text-gray-600 hover:underline">
                      SEO
                    </Link>
                    <Link to={`/admin/pages/edit/${item.page?.id}/settings`} className="text-gray-500 hover:text-gray-600 hover:underline">
                      Settings
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <AddPageModal open={addingPage} onClose={() => setAddingPage(false)} onCreate={createPage} />
    </div>
  );
}

function AddPageModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: ({ slug, isSubpage1 }: { slug: string; isSubpage1: boolean }) => void;
}) {
  const { t } = useTranslation();
  const [slug, setSlug] = useState("");
  const [isSubpage1, setIsSubpage1] = useState(false);
  function create() {
    onCreate({ slug, isSubpage1 });
  }
  return (
    <Modal open={open} setOpen={onClose} size="md">
      <div className="inline-block w-full overflow-hidden bg-white p-1 text-left align-bottom sm:align-middle">
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-foreground text-lg font-medium leading-6">Add page</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace("/", ""))}
              type="text"
              name="slug"
              id="slug"
              className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              placeholder={"Slug"}
            />
          </div>
          <InputCheckboxWithDescription
            name="isSubpage1"
            title="Is subpage :id1"
            value={isSubpage1}
            setValue={(e) => setIsSubpage1(Boolean(e))}
            description={`If checked, the page will be available at /${slug}/:id1`}
          />
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            className={clsx(
              "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base  font-medium text-white shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm",
              "bg-foreground text-background"
            )}
            onClick={create}
          >
            {t("shared.create")}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            onClick={onClose}
          >
            {t("shared.back")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
