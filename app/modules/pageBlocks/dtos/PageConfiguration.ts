import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { PageBlockDto } from "./PageBlockDto";
import { PageWithDetails } from "../db/pages.db.server";

export type PageConfiguration = {
  page: PageWithDetails | null;
  name: string;
  slug: string;
  blocks: PageBlockDto[];
  metatags: MetaTagsDto;
  error?: string;
};
