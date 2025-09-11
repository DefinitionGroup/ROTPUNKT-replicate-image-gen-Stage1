import { Page } from "@/sanity/sanity.types";
import TickerGallery from "./Ticker";
import Header from "./Header";
import Wizard from "./Wizard";
import HeroSection from "./HeroSection";
import MediaHeroSection from "./MediaHeroSection";
import TextHeadlineCombo from "./TextHeadlineCombo";
import MediaScrollHighlightSection from "./MediaScrollHighlightSection";
import ExpandableCards from "./ExpandableCards";
type PageBuilderProps = {
  content: NonNullable<Page>["content"];
};

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content)) {
    return null;
  }

  return content.map((block) => {
    switch (block._type) {
      case "tickerGallery":
        return <TickerGallery key={block._key} {...block} />;
      case "header":
        return <Header key={block._key} {...block} />;
      case "heroSection":
        return <HeroSection key={block._key} {...block} />;
      case "wizard":
        return <Wizard key={block._key} />;
      case "mediaHeroSection":
        return <MediaHeroSection key={block._key} {...block} />;
      case "textHeadlineCombo":
        return <TextHeadlineCombo key={block._key} {...(block as any)} />;
      case "mediaScrollHighlightSection":
        return (
          <MediaScrollHighlightSection key={block._key} {...(block as any)} />
        );
        case "expandableCards":
  return <ExpandableCards key={block._key} {...block} />;

      default:
        // This is a fallback for when we don't have a block type
        return (
          <div className="border border-white min-h-[20px]" key={block._key}>
            Block not found: {block._type}
          </div>
        );
    }
  });
}
