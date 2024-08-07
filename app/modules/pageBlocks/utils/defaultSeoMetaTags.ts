import { TFunction } from "i18next";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

type SiteTags = {
  title: string;
  description: string;
  keywords: string;
  image: string;
  thumbnail: string;
  twitterCreator: string;
  twitterSite: string;
};
export function getDefaultSiteTags(): SiteTags {
  return {
    title: "SaasRock Demo {Enterprise}",
    description:
      "Build, Market, Manage your SaaS. Launch your MVP with built-in SaaS features: Authentication, Pricing & Subscriptions, Admin & App portals, Entity Builder (CRUD, API, Webhooks, Permissions, Logs...), Blogging, CRM, Email Marketing, Page Block Builder, Notifications, Onboarding, and more.",
    keywords: "remix,saas,tailwindcss,prisma,react,typescript,boilerplate,saas-kit,saas-boilerplate,stripe,postmark,admin-portal,app-dashboard,multi-tenancy",
    image: "https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png",
    thumbnail: "https://yahooder.sirv.com/saasfrontends/remix/thumbnail.png",
    twitterCreator: "@AlexandroMtzG",
    twitterSite: "@saas_rock",
  };
}

export function defaultSeoMetaTags({ t, slug }: { t: TFunction; slug?: string }): MetaTagsDto {
  const siteTags = getDefaultSiteTags();
  if (slug === "/pricing") {
    siteTags.title = `${t("front.pricing.title")} | ${siteTags.title}`;
    siteTags.description = t("front.pricing.headline");
  } else if (slug === "/blog") {
    siteTags.title = `${t("blog.title")} | ${siteTags.title}`;
    siteTags.description = t("blog.headline");
  } else if (slug === "/contact") {
    siteTags.title = `${t("front.contact.title")} | ${siteTags.title}`;
    siteTags.description = t("front.contact.headline");
  } else if (slug === "/newsletter") {
    siteTags.title = `${t("front.newsletter.title")} | ${siteTags.title}`;
    siteTags.description = t("front.newsletter.headline");
  } else if (slug === "/changelog") {
    siteTags.title = `${t("front.changelog.title")} | ${siteTags.title}`;
    siteTags.description = t("front.changelog.headline");
  }

  return parseMetaTags(siteTags);
}

function parseMetaTags(tags: SiteTags): MetaTagsDto {
  return [
    { title: tags.title },
    { name: "description", content: tags.description },
    { name: "keywords", content: tags.keywords },
    { property: "og:title", content: tags.title },
    { property: "og:type", content: "website" },
    { property: "og:image", content: tags.image },
    { property: "og:card", content: "summary_large_image" },
    { property: "og:description", content: tags.description },
    { property: "twitter:image", content: tags.thumbnail },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:creator", content: tags.twitterCreator ?? "" },
    { property: "og:creator", content: tags.twitterCreator },
    { property: "twitter:site", content: tags.twitterSite ?? "" },
    { property: "twitter:title", content: tags.title },
    { property: "twitter:description", content: tags.description },
  ];
}
