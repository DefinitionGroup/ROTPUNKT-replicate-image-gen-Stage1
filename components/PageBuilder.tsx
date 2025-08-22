import { Page } from "@/sanity/sanity.types";
import TickerGallery from "./Ticker";
import RichTextComponent from "./RichTextComponent";


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
            key={block.name}
            {...block}
          />
        case "richText":
          return (
            <div key={block._key} className="">
              <RichTextComponent className="text-white" value={block.content} />
            </div>
          )
        default:
          // This is a fallback for when we don't have a block type
          return <div key={block._key}>Block not found: {block._type}</div>;
      }
    })
  );
}
