import type { KbCategorySectionDto } from "./KbCategorySectionDto";
import type { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export type KbCategoryDto = {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string;
  icon: string;
  language: string;
  seoImage: string;
  href: string;
  sections: KbCategorySectionDto[];
  articles: {
    id: string;
    order: number;
    title: string;
    description: string;
    slug: string;
    href: string;
    sectionId: string | null;
    publishedAt: Date | null;
    categoryId: string;
  }[];
  metatags: MetaTagsDto;
};
