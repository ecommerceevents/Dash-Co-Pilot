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
    title: "Automate Events",
    description:
      "Automate.Events revolutionizes event management with automation. From content creation to registrant tracking, event hosting, and live chat, we streamline your event processes, saving you time and boosting engagement. See how we turn 78 hours of work into 1 minute.",
    keywords: "event marketing, event management software, digital event marketing, grow event attendance, boost event engagement, content creation tools, registrant tracking, event hosting, live chat for events, easy event registration, personalized event emails, marketing automation, growth marketing, SEO optimization, site speed improvement, accessibility tools",
    image: "https://onlinestore.network/uploads/files/74a6f94fcdb66f8a2c6cc9698f12c542.png",
    thumbnail: "https://onlinestore.network/uploads/files/c554e047addec5e3bc6500309f772123.png",
    twitterCreator: "@EventsEcommerce",
    twitterSite: "@EventsEcommerce",
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
