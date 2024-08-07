import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { getTranslations } from "~/locale/i18next.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { defaultSeoMetaTags } from "../../utils/defaultSeoMetaTags";
import { PageBlock, PageMetaTag } from "@prisma/client";
import { getUserInfo, UserSession } from "~/utils/session.server";
import { redirect } from "@remix-run/node";
import { getMetaTags } from "../../db/pageMetaTags.db.server";
import { PageWithDetails, getPageBySlug, getPages, createPage } from "../../db/pages.db.server";
import { defaultPricingPage } from "../../utils/defaultPages/defaultPricingPage";
import { defaultLandingPage } from "../../utils/defaultPages/defaultLandingPage";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import { PageLoaderData } from "../../dtos/PageBlockData";
import { PageBlockService } from "./blocksService";
import { Params } from "@remix-run/react";
import { defaultBlogPage } from "../../utils/defaultPages/defaultBlogPage";
import { defaultBlogPostPage } from "../../utils/defaultPages/defaultBlogPostPage";
import { TFunction } from "i18next";
import { cachified } from "~/utils/cache.server";
import { defaultPages } from "../../utils/defaultPages";
import { i18nConfig } from "~/locale/i18n";
import { getBaseURL } from "~/utils/url.server";

export async function getPageConfiguration({
  request,
  t,
  slug,
  page,
  tenantId,
}: {
  request: Request;
  t?: TFunction;
  slug: string;
  page?: PageWithDetails | null;
  tenantId?: string | null;
}): Promise<PageConfiguration> {
  if (!t) {
    t = (await getTranslations(request)).t;
  }
  if (!page) {
    page = await cachified({
      key: `page:${slug}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () => getPageBySlug(slug, tenantId ?? null),
    });
  }

  const linkTags: MetaTagsDto = getLinkTags(request);

  return {
    page,
    name: !page ? slug : page?.slug === "/" ? "Landing" : page?.slug,
    slug: page?.slug ?? slug,
    blocks: parsePageBlocks({ t, slug, blocks: page?.blocks ?? [] }),
    metatags: [...(await getPageMetaTags({ t, slug: page?.slug ?? slug, metatags: page?.metaTags ?? [] })), ...linkTags],
  };
}

export async function getPageMetaTags({
  t,
  metatags,
  slug,
  loadDefault = true,
}: {
  t: TFunction;
  metatags: PageMetaTag[];
  slug?: string;
  loadDefault?: boolean;
}) {
  if (!metatags || metatags.length === 0) {
    metatags = await getMetaTags(null);
  }
  let tags: MetaTagsDto = [];
  if (loadDefault) {
    tags = defaultSeoMetaTags({ t, slug });
  }
  if (metatags.length > 0) {
    metatags.forEach((tag) => {
      tags.push({ name: tag.name, content: tag.value });
    });
  }
  return tags;
}

export function parsePageBlocks({ t, slug, blocks }: { t: TFunction; slug: string; blocks: PageBlock[] }): PageBlockDto[] {
  let parsedBlocks: PageBlockDto[] = blocks.map((block) => {
    return JSON.parse(block.value) as PageBlockDto;
  });

  if (parsedBlocks.length !== 0) {
    return parsedBlocks;
  }

  switch (slug) {
    case "/":
      return defaultLandingPage({ t });
    case "/pricing":
      return defaultPricingPage({ t });
    case "/blog":
      return defaultBlogPage({ t });
    case "/blog/:id1":
      return defaultBlogPostPage({ t });
    default:
      return [];
  }
}

export async function createDefaultPages() {
  const allPages = await getPages();
  const existingPages = allPages.map((page) => page.slug);
  return await Promise.all(
    defaultPages
      .filter((page) => !existingPages.includes(page))
      .map(async (slug) => {
        return await createPage({
          slug,
          isPublished: true,
          isPublic: true,
        });
      })
  );
}

export type PagePermissionResult = {
  unauthorized?: {
    redirect?: string;
    error?: string;
  };
};
export function verifyPageVisibility({ page, userSession }: { page: PageWithDetails | null; userSession: UserSession }) {
  const result: PagePermissionResult | undefined = {};
  if (page) {
    if (!page.isPublic && (!userSession.userId || userSession.userId.trim().length === 0)) {
      result.unauthorized = { redirect: "/login", error: "Unauthorized" };
    }
    if (!page.isPublished) {
      result.unauthorized = { redirect: "/404?page=" + page.slug, error: "Page not published" };
    }
  }
  return result;
}

export async function getCurrentPage({
  request,
  params,
  slug,
  tenantId,
}: {
  request: Request;
  params: Params;
  slug: string;
  tenantId?: string;
}): Promise<PageLoaderData> {
  const { t } = await getTranslations(request);
  const url = new URL(request.url);
  const fullUrl = url.pathname + url.search;
  const page = await getPageConfiguration({ request, t, slug, tenantId });

  const userSession = await getUserInfo(request);
  const { unauthorized } = verifyPageVisibility({ page: page.page, userSession });
  if (unauthorized?.redirect) {
    throw redirect(unauthorized.redirect + "?redirect=" + fullUrl);
  }
  const pageResult: PageLoaderData = {
    ...page,
    userSession,
    authenticated: userSession.userId?.length > 0,
    t,
    blocks: page.blocks,
  };
  return await PageBlockService.load({ request, params, t, page: pageResult });
}

export function getLinkTags(request: Request) {
  const baseUrl = getBaseURL(request, { https: true });
  const urlObj = new URL(request.url);
  const pathname = `${baseUrl}${urlObj.pathname}`;
  const searchParams = urlObj.searchParams;
  const lng = searchParams.get("lng") ?? i18nConfig.fallbackLng;
  const linkTags: MetaTagsDto = [];

  // Set the canonical link
  const canonicalHref = lng === i18nConfig.fallbackLng ? pathname : `${pathname}?lng=${lng}`;
  linkTags.push({ property: "og:locale", content: lng });
  linkTags.push({ tagName: "link", rel: "canonical", href: canonicalHref });
  linkTags.push({ property: "og:url", content: canonicalHref });

  // Add hreflang tags for each supported language
  i18nConfig.supportedLngs.forEach((supportedLng) => {
    const href = supportedLng === i18nConfig.fallbackLng ? pathname : `${pathname}?lng=${supportedLng}`;
    linkTags.push({ tagName: "link", rel: "alternate", href: href, hrefLang: supportedLng });
  });
  linkTags.push({ tagName: "link", rel: "alternate", href: pathname, hrefLang: "x-default" });

  return linkTags;
}
