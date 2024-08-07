import UrlUtils from "~/utils/app/UrlUtils";
import { KnowledgeBaseArticleWithDetails } from "../db/kbArticles.db.server";
import { KbCategorySectionDto } from "../dtos/KbCategorySectionDto";
import { KnowledgeBaseDto } from "../dtos/KnowledgeBaseDto";
import { KbCategoryDto } from "../dtos/KbCategoryDto";
import { KbArticleDto } from "../dtos/KbArticleDto";

const defaultLanguage = "en";
const supportedLanguages: { name: string; value: string }[] = [
  { name: "English", value: "en" },
  { name: "Spanish", value: "es" },
];

function getLanguageName(language: string) {
  const supportedLanguage = supportedLanguages.find((l) => l.value === language);
  return supportedLanguage ? supportedLanguage.name : "";
}

function getAvailableArticleSlug({ allArticles, initialSlug }: { allArticles: KnowledgeBaseArticleWithDetails[]; initialSlug: string }) {
  let number = 1;
  let slug = "";

  const findExistingSlug = (slug: string) => {
    return allArticles.find((p) => p.slug === slug);
  };

  do {
    slug = `${initialSlug}-${number}`;
    const existingWithSlug = findExistingSlug(slug);
    if (!existingWithSlug) {
      break;
    }
    // if (number > 10) {
    //   throw Error("Too many duplicates");
    // }
    number++;
  } while (true);

  let maxOrder = 0;
  let firstOrder = 0;
  if (allArticles.length > 0) {
    maxOrder = Math.max(...allArticles.map((p) => p.order));
    firstOrder = Math.min(...allArticles.map((p) => p.order));
  }
  return {
    slug,
    maxOrder,
    firstOrder,
    number,
  };
}

function getKbUrl({ kb, params }: { kb: { basePath: string; slug: string }; params: { lang?: string } }) {
  let url = UrlUtils.join(kb.basePath, kb.slug);
  const foundLang = supportedLanguages.find((l) => l.value === params.lang);
  if (params.lang && foundLang) {
    return `${url}/${params.lang}`;
  }
  return `${url}`;
}

function getArticleUrl({ kb, article, params }: { kb: { slug: string; basePath: string }; article: { slug: string }; params: { lang?: string } }) {
  let kbUrl = getKbUrl({ kb, params });
  return `${kbUrl}/articles/${article.slug}`;
}

function getCategoryUrl({ kb, category, params }: { kb: { slug: string; basePath: string }; category: { slug: string }; params: { lang?: string } }) {
  let kbUrl = getKbUrl({ kb, params });
  return `${kbUrl}/categories/${category.slug}`;
}

function getCategoryArticlesBySections({ kb, category }: { kb: KnowledgeBaseDto; category: KbCategoryDto }) {
  let sections: {
    section: KbCategorySectionDto | null;
    articles: {
      order: number;
      title: string;
      description: string;
      href: string;
      section: string | null;
      sectionId: string | null;
    }[];
  }[] = [];
  category.articles.forEach((article) => {
    const section = category.sections.find((item) => item.id === article.sectionId) ?? null;
    const sectionIndex = sections.findIndex((item) => item.section?.id === section?.id);
    if (sectionIndex === -1) {
      sections.push({
        section,
        articles: [
          {
            ...article,
            section: section?.title ?? null,
          },
        ],
      });
    } else {
      sections[sectionIndex].articles.push({
        ...article,
        section: section?.title ?? null,
      });
    }
  });
  sections.forEach((item) => {
    item.articles = item.articles.sort((a, b) => {
      if (a.order && b.order) {
        return a.order - b.order;
      }
      return 0;
    });
  });
  sections = sections.sort((a, b) => {
    if (a.section?.order && b.section?.order) {
      return a.section.order - b.section.order;
    }
    return -1;
  });
  return sections;
}

function fixDarkMode({ article }: { article: KbArticleDto }) {
  const replaces = {
    "rounded-sm bg-stone-100 p-5 font-mono font-medium text-stone-800": "rounded-sm bg-secondary text-secondary-foreground p-5 font-mono font-medium",
    "rounded-sm bg-secondary p-5 font-mono font-medium": "rounded-sm bg-secondary text-secondary-foreground p-5 font-mono font-medium",
    "rounded-md bg-secondary px-1.5 py-1 font-mono font-medium": "rounded-md bg-secondary text-secondary-foreground px-1.5 py-1 font-mono font-medium",
    "rounded-md bg-stone-200 px-1.5 py-1 font-mono font-medium text-black":
      "rounded-md bg-secondary px-1.5 py-1 font-mono font-medium text-secondary-foreground",
    "text-stone-600 underline underline-offset-[3px] hover:text-stone-700 transition-colors cursor-pointer text-stone-600 underline underline-offset-[3px] hover:text-stone-700 transition-colors cursor-pointer":
      "text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors cursor-pointer",
    "underline underline-offset-[3px] hover:text-foreground transition-colors cursor-pointer":
      "text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors cursor-pointer",
  };
  if (article.contentPublished) {
    for (const [key, value] of Object.entries(replaces)) {
      article.contentPublished = article.contentPublished.replaceAll(key, value);
    }
  }
}

export default {
  defaultLanguage,
  supportedLanguages,
  getLanguageName,
  getAvailableArticleSlug,
  getKbUrl,
  getArticleUrl,
  getCategoryUrl,
  getCategoryArticlesBySections,
  fixDarkMode,
};
