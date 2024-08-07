import { TFunction } from "i18next";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { defaultHeader } from "../defaultHeader";
import { defaultFooter } from "../defaultFooter";
import { defaultBlogPostBlock } from "../../components/blocks/marketing/blog/post/BlogPostBlockUtils";

export function defaultBlogPostPage({ t }: { t: TFunction }) {
  const blocks: PageBlockDto[] = [
    // Header
    { header: defaultHeader({ t }) },
    // Pricing
    {
      blogPost: defaultBlogPostBlock,
    },
    // Footer
    {
      footer: defaultFooter({ t }),
    },
  ];
  return blocks;
}
