import { type KbArticleDto } from "./KbArticleDto";

export type KbSearchResultDto = {
  query: string;
  articles: KbArticleDto[];
};
