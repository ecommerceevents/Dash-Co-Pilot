import { LoaderFunctionArgs, redirect, ActionFunction, json } from "@remix-run/node";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { getTranslations } from "~/locale/i18next.server";
import { deletePageBlocks, createPageBlock } from "~/modules/pageBlocks/db/pageBlocks.db.server";
import { deletePage, getPage } from "../../db/pages.db.server";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import { getPageConfiguration } from "../../services/.server/pagesService";

export namespace PageBlocks_Index {
  export type LoaderData = {
    page: PageConfiguration;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const item = await getPage(params.id!);
    if (!item) {
      return redirect("/admin/pages");
    }
    const page = await getPageConfiguration({ request, t, page: item, slug: item.slug });
    const data: LoaderData = {
      page,
    };
    return json(data);
  };

  export type ActionData = {
    success: string;
    error: string;
    page?: PageConfiguration;
    aiGeneratedBlocks?: PageBlockDto[];
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const form = await request.formData();
    const action = form.get("action")?.toString();

    const item = await getPage(params.id!);
    if (!item) {
      return redirect("/admin/pages");
    }
    // const page = await getPageConfiguration({ request, t, page: item, slug: item.slug });

    if (action === "save") {
      const blocks = form.get("blocks");
      try {
        const parsed = JSON.parse(blocks?.toString() ?? "[]") as PageBlockDto[];
        await deletePageBlocks(item);
        await Promise.all(
          parsed.map(async (block, idx) => {
            const keys = Object.keys(block);
            if (keys.length === 0) {
              throw new Error("Invalid block type: " + JSON.stringify(block));
            }
            const type = keys[0];
            return await createPageBlock({
              pageId: item.id,
              order: idx + 1,
              type,
              value: JSON.stringify(block),
            });
          })
        );
        return json({
          success: "Page blocks saved successfully",
        });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "reset") {
      await deletePageBlocks(item);
      return json({
        // success: "Page blocks reset successfully",
        page: await getPageConfiguration({ request, t, slug: item.slug }),
      });
    } else if (action === "delete") {
      await deletePageBlocks(item);
      await deletePage(item.id);
      return redirect("/admin/pages");
    } else {
      return json({
        error: t("shared.invalidForm"),
      });
    }
  };
}
