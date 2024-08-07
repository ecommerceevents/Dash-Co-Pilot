export type KnowledgeBasesTemplateDto = {
  knowledgeBases: {
    basePath?: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    color: number;
    enabled: boolean;
    languages: string[];
    links: { name: string; href: string; order: number }[];
    logo: string;
    seoImage: string;
  }[];
  categories: {
    knowledgeBaseSlug: string;
    slug: string;
    order: number;
    title: string;
    description: string;
    icon: string;
    language: string;
    seoImage: string;
    sections: {
      order: number;
      title: string;
      description: string;
    }[];
  }[];
  articles: {
    knowledgeBaseSlug: string;
    categorySlug: string | null;
    categorySectionOrder: number | null;
    slug: string;
    title: string;
    description: string;
    order: number;
    contentDraft: string;
    contentPublished: string;
    contentPublishedAsText: string;
    contentType: string;
    language: string;
    featuredOrder: number | null;
    seoImage: string;
    publishedAt: string | null;
    createdByUserEmail: string | null;
    relatedArticles: { slug: string }[];
  }[];
};
