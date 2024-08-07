import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { deleteMetaTags, getMetaTags } from "~/modules/pageBlocks/db/pageMetaTags.db.server";
import { getPage, PageWithDetails } from "~/modules/pageBlocks/db/pages.db.server";
import { setPageMetaTags } from "../../services/.server/pagesMetaTagsService";

export namespace PageMetaTags_Index {
  export type LoaderData = {
    title: string;
    page: PageWithDetails | null;
    metaTags: { name: string; content: string; order: number }[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    let page: PageWithDetails | null = null;
    if (params.id) {
      page = await getPage(params.id);
    } else if (params.tenant) {
      return redirect(`/app/${params.tenant}/settings/pages`);
    }
    const metaTags = await getMetaTags(page?.id ?? null);
    const data: LoaderData = {
      title: `SEO | ${process.env.APP_NAME}`,
      metaTags: metaTags.map((tag, idx) => {
        return { name: tag.name, content: tag.value, order: tag.order ?? idx + 1 };
      }),
      page,
    };
    return json(data);
  };

  export type ActionData = {
    success: string;
    error: string;
    metaTags?: { name: string; content: string; order: number }[];
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const form = await request.formData();
    const action = form.get("action");
    let page: PageWithDetails | null = null;
    if (params.id) {
      page = await getPage(params.id);
    }

    if (action === "reset") {
      await deleteMetaTags(page);
      return json({ success: "Meta tags reset successfully", metaTags: [] });
    } else if (action === "update") {
      const metaTags: { name: string; content: string; order: number }[] = form.getAll("metaTags[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
      try {
        await setPageMetaTags(page?.id ?? null, metaTags);
        return json({ success: "Meta tags updated successfully", metaTags });
        // return redirect(params.tenant ? `/app/${params.tenant}/settings/pages` : `/admin/pages`);
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
