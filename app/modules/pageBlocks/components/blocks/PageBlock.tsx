import { ReactNode, useState } from "react";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import Tabs from "~/components/ui/tabs/Tabs";
import { UserSession } from "~/utils/session.server";
import { PageBlockDto } from "../../dtos/PageBlockDto";
import RowsListBlock from "./app/rows/list/RowsListBlock";
import RowsListBlockForm from "./app/rows/list/RowsListBlockForm";
import RowsNewBlock from "./app/rows/new/RowsNewBlock";
import RowsNewBlockForm from "./app/rows/new/RowsNewBlockForm";
import RowsOverviewBlock from "./app/rows/overview/RowsOverviewBlock";
import RowsOverviewBlockForm from "./app/rows/overview/RowsOverviewBlockForm";
import BannerBlock from "./marketing/banner/BannerBlock";
import BannerBlockForm from "./marketing/banner/BannerBlockForm";
import BlogPostBlock from "./marketing/blog/post/BlogPostBlock";
import BlogPostBlockForm from "./marketing/blog/post/BlogPostBlockForm";
import BlogPostsBlock from "./marketing/blog/posts/BlogPostsBlock";
import BlogPostsBlockForm from "./marketing/blog/posts/BlogPostsBlockForm";
import CommunityBlock from "./marketing/community/CommunityBlock";
import CommunityBlockForm from "./marketing/community/CommunityBlockForm";
import FaqBlock from "./marketing/faq/FaqBlock";
import FaqBlockForm from "./marketing/faq/FaqBlockForm";
import FeaturesBlock from "./marketing/features/FeaturesBlock";
import FeaturesBlockForm from "./marketing/features/FeaturesBlockForm";
import FooterBlock from "./marketing/footer/FooterBlock";
import FooterBlockForm from "./marketing/footer/FooterBlockForm";
import GalleryBlock from "./marketing/gallery/GalleryBlock";
import GalleryBlockForm from "./marketing/gallery/GalleryBlockForm";
import HeaderBlock from "./marketing/header/HeaderBlock";
import HeaderBlockForm from "./marketing/header/HeaderBlockForm";
import HeadingBlock from "./marketing/heading/HeadingBlock";
import HeadingBlockForm from "./marketing/heading/HeadingBlockForm";
import HeroBlock from "./marketing/hero/HeroBlock";
import HeroBlockForm from "./marketing/hero/HeroBlockForm";
import LogoCloudsBlock from "./marketing/logoClouds/LogoCloudsBlock";
import LogoCloudsBlockForm from "./marketing/logoClouds/LogoCloudsBlockForm";
import NewsletterBlock from "./marketing/newsletter/NewsletterBlock";
import NewsletterBlockForm from "./marketing/newsletter/NewsletterBlockForm";
import PricingBlock from "./marketing/pricing/PricingBlock";
import PricingBlockForm from "./marketing/pricing/PricingBlockForm";
import TestimonialsBlock from "./marketing/testimonials/TestimonialsBlock";
import TestimonialsBlockForm from "./marketing/testimonials/TestimonialsBlockForm";
import VideoBlock from "./marketing/video/VideoBlock";
import VideoBlockForm from "./marketing/video/VideoBlockForm";
import PageBlockBoundary from "./PageBlockBoundary";
import JsonBlockForm from "./shared/layout/json/JsonBlockForm";
import LayoutBlockForm from "./shared/layout/LayoutBlockForm";
import ContentBlock from "./marketing/markdown/ContentBlock";
import ContentBlockForm from "./marketing/markdown/ContentBlockForm";

export function PageBlock({ item, userSession }: { item: PageBlockDto; userSession?: UserSession }) {
  return (
    <>
      <PageBlockBoundary item={item} />
      {item.heading && <HeadingBlock item={item.heading} />}
      {item.banner && <BannerBlock item={item.banner} />}
      {item.header && <HeaderBlock item={item.header} />}
      {item.footer && <FooterBlock item={item.footer} />}
      {item.hero && <HeroBlock item={item.hero} />}
      {item.gallery && <GalleryBlock item={item.gallery} />}
      {item.logoClouds && <LogoCloudsBlock item={item.logoClouds} />}
      {item.video && <VideoBlock item={item.video} />}
      {item.community && <CommunityBlock item={item.community} />}
      {item.testimonials && <TestimonialsBlock item={item.testimonials} />}
      {item.features && <FeaturesBlock item={item.features} />}
      {item.newsletter && <NewsletterBlock item={item.newsletter} />}
      {item.faq && <FaqBlock item={item.faq} />}
      {item.pricing && <PricingBlock item={item.pricing} />}
      {item.blogPosts && <BlogPostsBlock item={item.blogPosts} />}
      {item.blogPost && <BlogPostBlock item={item.blogPost} />}
      {item.rowsList && <RowsListBlock item={item.rowsList} />}
      {item.rowsNew && <RowsNewBlock item={item.rowsNew} />}
      {item.rowsOverview && <RowsOverviewBlock item={item.rowsOverview} />}
      {item.content && <ContentBlock item={item.content} />}
    </>
  );
}

export function PageBlockForm({
  type,
  item,
  onUpdate,
  onUpdateLayout,
}: {
  type: string;
  item?: PageBlockDto;
  onUpdate: (item: PageBlockDto) => void;
  onUpdateLayout: (layout?: PageBlockDto["layout"]) => void;
}) {
  let block: ReactNode | null = null;
  if (type === "heading") {
    block = <HeadingBlockForm item={item?.heading} onUpdate={(heading) => onUpdate({ heading })} />;
  } else if (type === "banner") {
    block = <BannerBlockForm item={item?.banner} onUpdate={(banner) => onUpdate({ banner })} />;
  } else if (type === "header") {
    block = <HeaderBlockForm item={item?.header} onUpdate={(header) => onUpdate({ header })} />;
  } else if (type === "footer") {
    block = <FooterBlockForm item={item?.footer} onUpdate={(footer) => onUpdate({ footer })} />;
  } else if (type === "hero") {
    block = <HeroBlockForm item={item?.hero} onUpdate={(hero) => onUpdate({ hero })} />;
  } else if (type === "logoClouds") {
    block = <LogoCloudsBlockForm item={item?.logoClouds} onUpdate={(logoClouds) => onUpdate({ logoClouds })} />;
  } else if (type === "gallery") {
    block = <GalleryBlockForm item={item?.gallery} onUpdate={(gallery) => onUpdate({ gallery })} />;
  } else if (type === "video") {
    block = <VideoBlockForm item={item?.video} onUpdate={(video) => onUpdate({ video })} />;
  } else if (type === "community") {
    block = <CommunityBlockForm item={item?.community} onUpdate={(community) => onUpdate({ community })} />;
  } else if (type === "testimonials") {
    block = <TestimonialsBlockForm item={item?.testimonials} onUpdate={(testimonials) => onUpdate({ testimonials })} />;
  } else if (type === "faq") {
    block = <FaqBlockForm item={item?.faq} onUpdate={(faq) => onUpdate({ faq })} />;
  } else if (type === "features") {
    block = <FeaturesBlockForm item={item?.features} onUpdate={(features) => onUpdate({ features })} />;
  } else if (type === "newsletter") {
    block = <NewsletterBlockForm item={item?.newsletter} onUpdate={(newsletter) => onUpdate({ newsletter })} />;
  } else if (type === "pricing") {
    block = <PricingBlockForm item={item?.pricing} onUpdate={(pricing) => onUpdate({ pricing })} />;
  } else if (type === "blogPosts") {
    block = <BlogPostsBlockForm item={item?.blogPosts} onUpdate={(blogPosts) => onUpdate({ blogPosts })} />;
  } else if (type === "blogPost") {
    block = <BlogPostBlockForm item={item?.blogPost} onUpdate={(blogPost) => onUpdate({ blogPost })} />;
  } else if (type === "rowsList") {
    block = <RowsListBlockForm item={item?.rowsList} onUpdate={(rowsList) => onUpdate({ rowsList })} />;
  } else if (type === "rowsNew") {
    block = <RowsNewBlockForm item={item?.rowsNew} onUpdate={(rowsNew) => onUpdate({ rowsNew })} />;
  } else if (type === "rowsOverview") {
    block = <RowsOverviewBlockForm item={item?.rowsOverview} onUpdate={(rowsOverview) => onUpdate({ rowsOverview })} />;
  } else if (type === "content") {
    block = <ContentBlockForm item={item?.content} onUpdate={(content) => onUpdate({ content })} />;
  } else {
    block = <ErrorBanner title="TODO" text={"TODO BLOCK FORM FOR TYPE: " + type} />;
  }

  const [selectedTab, selectTab] = useState(0);
  return (
    <div className="space-y-4">
      <Tabs asLinks={false} onSelected={(index) => selectTab(index)} tabs={[{ name: `Block` }, { name: `JSON` }]} />
      {selectedTab === 0 && (
        <>
          {block}
          <LayoutBlockForm item={item} onUpdate={(item) => onUpdateLayout(item?.layout)} />
        </>
      )}
      {selectedTab === 1 && <JsonBlockForm item={item} onUpdate={(block) => onUpdate(block)} />}
    </div>
  );
}
