import { PageBlockDto } from "../../dtos/PageBlockDto";
import { defaultRowsListBlock } from "./app/rows/list/RowsListBlockUtils";
import { defaultRowsNewBlock } from "./app/rows/new/RowsNewBlockUtils";
import { defaultRowsOverviewBlock } from "./app/rows/overview/RowsOverviewBlockUtils";
import { defaultBannerBlock } from "./marketing/banner/BannerBlockUtils";
import { defaultBlogPostBlock } from "./marketing/blog/post/BlogPostBlockUtils";
import { defaultBlogPostsBlock } from "./marketing/blog/posts/BlogPostsBlockUtils";
import { defaultCommunityBlock } from "./marketing/community/CommunityBlockUtils";
import { defaultFaqBlock } from "./marketing/faq/FaqBlockUtils";
import { defaultFeaturesBlock } from "./marketing/features/FeaturesBlockUtils";
import { defaultFooterBlock } from "./marketing/footer/FooterBlockUtils";
import { defaultGalleryBlock } from "./marketing/gallery/GalleryBlockUtils";
import { defaultHeaderBlock } from "./marketing/header/HeaderBlockUtils";
import { defaultHeadingBlock } from "./marketing/heading/HeadingBlockUtils";
import { defaultHeroBlock } from "./marketing/hero/HeroBlockUtils";
import { defaultLogoCloudsBlock } from "./marketing/logoClouds/LogoCloudsBlockUtils";
import { defaultContentBlock } from "./marketing/markdown/ContentBlockUtils";
import { defaultNewsletterBlock } from "./marketing/newsletter/NewsletterBlockUtils";
import { defaultPricingBlock } from "./marketing/pricing/PricingBlockUtils";
import { defaultTestimonialsBlock } from "./marketing/testimonials/TestimonialsBlockUtils";
import { defaultVideoBlock } from "./marketing/video/VideoBlockUtils";

const defaultBlocks: PageBlockDto = {
  heading: defaultHeadingBlock,
  banner: defaultBannerBlock,
  header: defaultHeaderBlock,
  footer: defaultFooterBlock,
  hero: defaultHeroBlock,
  logoClouds: defaultLogoCloudsBlock,
  gallery: defaultGalleryBlock,
  video: defaultVideoBlock,
  community: defaultCommunityBlock,
  testimonials: defaultTestimonialsBlock,
  features: defaultFeaturesBlock,
  faq: defaultFaqBlock,
  newsletter: defaultNewsletterBlock,
  pricing: defaultPricingBlock,
  blogPosts: defaultBlogPostsBlock,
  blogPost: defaultBlogPostBlock,
  rowsList: defaultRowsListBlock,
  rowsNew: defaultRowsNewBlock,
  rowsOverview: defaultRowsOverviewBlock,
  content: defaultContentBlock,
};

export default {
  defaultBlocks,
};
