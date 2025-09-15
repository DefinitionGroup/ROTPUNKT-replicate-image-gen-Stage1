import { Page } from "@/sanity/sanity.types";
import TickerGallery from "@/components/pagebuildercomponents/Ticker";
import Header from "@/components/pagebuildercomponents/Header";
import Wizard from "@/components/wizard/Wizard";
import HeroSection from "@/components/pagebuildercomponents/HeroSection";
import MediaHeroSection from "@/components/pagebuildercomponents/MediaHeroSection";
import TextHeadlineCombo from "@/components/pagebuildercomponents/TextHeadlineCombo";
import MediaScrollHighlightSection from "@/components/pagebuildercomponents/MediaScrollHighlightSection";
import ExpandableCards from "@/components/pagebuildercomponents/ExpandableCards";
import RichTextComponent from "@/components/pagebuildercomponents/RichTextComponent";
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
      case "richText":
        return <RichTextComponent key={block._key} value={block.content} />;
      case "mediaScrollHighlightSection":
        return (
          <MediaScrollHighlightSection key={block._key} {...(block as any)} />
        );
      case "expandableCards":
        return <ExpandableCards key={block._key} {...block} />;

      default:
        const unknown = block as any;
        return (
          <div className="border border-white min-h-[20px]" key={unknown._key}>
            Block not found: {unknown._type}
          </div>
        );
    }
  });
}
