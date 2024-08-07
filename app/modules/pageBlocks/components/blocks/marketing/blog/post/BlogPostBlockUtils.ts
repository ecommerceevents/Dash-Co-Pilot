import { SocialsBlockDto } from "~/modules/pageBlocks/components/blocks/shared/socials/SocialsBlockDto";
import { defaultSocials } from "~/modules/pageBlocks/utils/defaultSocials";
import { BlockVariableDto } from "../../../shared/variables/BlockVariableDto";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { BlogPostDto } from "~/modules/blog/dtos/BlogPostDto";

export type BlogPostBlockDto = {
  style: BlogPostBlockStyle;
  socials?: SocialsBlockDto;
  variables?: {
    postSlug: BlockVariableDto;
  };
  data: BlogPostBlockData | null;
};

export interface BlogPostBlockData {
  post: BlogPostDto;
  canEdit: boolean;
  metaTags?: MetaTagsDto;
}

export const BlogPostBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type BlogPostBlockStyle = (typeof BlogPostBlockStyles)[number]["value"];

export const defaultBlogPostBlock: BlogPostBlockDto = {
  style: "simple",
  variables: {
    postSlug: { type: "param", param: "id1" },
  },
  socials: defaultSocials,
  data: null,
};
