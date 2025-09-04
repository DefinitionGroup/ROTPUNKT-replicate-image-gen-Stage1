import { Page } from "@/sanity/sanity.types";
import TickerGallery from "./Ticker";
import HeroSection from "./HeroSection";
import Wizard from "./Wizard";


type PageBuilderProps = {
  content: NonNullable<Page>["content"];
};

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content)) {
    return null;
  }

  return (
    content.map((block) => {
      switch (block._type) {
        case "tickerGallery":
          return <TickerGallery
            key={block._key}
            {...block}
          />
        case 'header':
          return <HeroSection
            key={block._key}
            {...block}
          />
        case 'wizard':
          return <Wizard key={block._key} />
        default:
          // This is a fallback for when we don't have a block type
          return <div key={block._key}>Block not found: {block._type}</div>;
      }
    })
  );
}
