import { json } from "@remix-run/node";
import { Params } from "@remix-run/react";
import { TFunction } from "i18next";
import { getTranslations } from "~/locale/i18next.server";
import { RowsListBlockService } from "../../components/blocks/app/rows/list/RowsListBlockService.server";
import { RowsNewBlockService } from "../../components/blocks/app/rows/new/RowsNewBlockService.server";
import { RowsOverviewBlockService } from "../../components/blocks/app/rows/overview/RowsOverviewBlockService.server";
import { BlogPostBlockService } from "../../components/blocks/marketing/blog/post/BlogPostBlockService.server";
import { BlogPostsBlockService } from "../../components/blocks/marketing/blog/posts/BlogPostsBlockService.server";
import { CommunityBlockService } from "../../components/blocks/marketing/community/CommunityBlockService.server";
import { PricingBlockService } from "../../components/blocks/marketing/pricing/PricingBlockService.server";
import { PageLoaderData } from "../../dtos/PageBlockData";
import { PageBlockDto } from "../../dtos/PageBlockDto";

export namespace PageBlockService {
  export async function load({ page, request, params, t }: { page: PageLoaderData; request: Request; params: Params; t: TFunction }) {
    await Promise.all(
      page.blocks.map(async (block) => {
        return await loadBlock({ request, params, t, block, page });
      })
    );
    return page;
  }
  interface LoadBlockArgs {
    request: Request;
    params: Params;
    t: TFunction;
    block: PageBlockDto;
    page?: PageLoaderData;
  }

  export async function loadBlock({ request, params, t, block, page }: LoadBlockArgs) {
    // try {
    const args = { request, params, t, block };
    if (block.community) {
      block.community.data = await CommunityBlockService.load(args);
    } else if (block.pricing) {
      block.pricing.data = await PricingBlockService.load(args);
    } else if (block.blogPosts) {
      block.blogPosts.data = await BlogPostsBlockService.load(args);
    } else if (block.blogPost) {
      block.blogPost.data = await BlogPostBlockService.load(args);
      if (page) {
        page.metatags = block.blogPost.data.metaTags ?? [];
      }
    } else if (block.rowsList) {
      block.rowsList.data = await RowsListBlockService.load(args);
    } else if (block.rowsNew) {
      block.rowsNew.data = await RowsNewBlockService.load(args);
    } else if (block.rowsOverview) {
      block.rowsOverview.data = await RowsOverviewBlockService.load(args);
    }
    // } catch (error: any) {
    //   block.error = error.message;
    // }
  }

  export async function action({ request, params }: { request: Request; params: Params }) {
    const { t } = await getTranslations(request);
    const form = await request.formData();
    const args = { request, params, t };

    switch (form.get("action")) {
      case "subscribe":
        return await PricingBlockService.subscribe({ ...args, form });
      case "publish":
        return await BlogPostBlockService.publish({ ...args, form });
      case "rows-action":
        return await RowsNewBlockService.create({ ...args, form });
      default:
        return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  }
}
