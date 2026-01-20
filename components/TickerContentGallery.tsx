"use client";

import {
  TickerContentGallery as TickerGalleryType,
  TickersliderItemContent,
  TickerItem as SanityTickerItem,
  CloudinaryAsset,
} from "@/sanity/sanity.types";
import { Ticker } from "motion-plus/react";
import { motion } from "motion/react";
import { useState } from "react";
import TickerItemModal from "./TickerItemModal";

type RenderableTickerItem = {
  _key?: string | null;
  title?: string | null;
  description?: string | null;
  imageCloudinary?: CloudinaryAsset | null;
};

function Box(props: RenderableTickerItem & { handleClick: () => void }) {
  const { imageCloudinary, title, handleClick } = props;

  return (
    <motion.div
      className="item rounded-2xl min-w-[300px] ring-1 ring-white/10 overflow-hidden cursor-pointer"
      onClick={handleClick}
      initial="hideInfo"
      whileHover="showInfo"
    >
      <motion.img
        src={imageCloudinary?.secure_url ?? "/placeholder.svg"}
        alt={`${title ?? "Bild"} boxart`}
        className="w-full h-full object-cover"
        variants={{
          hideInfo: { scale: 1, filter: "blur(0px)", opacity: 1 },
        }}
      />
      <motion.div
        className="title"
        variants={{
          hideInfo: { opacity: 0, scale: 1.2 },
          showInfo: { opacity: 1, scale: 1 },
        }}
      >
        {title}
      </motion.div>
    </motion.div>
  );
}

function toRenderable(
  item: TickersliderItemContent | SanityTickerItem
): RenderableTickerItem {
  return {
    _key: (item as any)._key ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    imageCloudinary: item.imageCloudinary ?? null,
  };
}

export default function TickerContentGallery({
  tickerItems,
}: TickerGalleryType) {
  const [selectedItem, setSelectedItem] = useState<RenderableTickerItem | null>(
    null
  );

  const items: RenderableTickerItem[] = tickerItems?.map(toRenderable) ?? [];

  return (
    <>
      <Ticker
        hoverFactor={0.2}
        velocity={22}
        items={items.map((item) => (
          <Box
            key={item._key ?? item.title ?? crypto.randomUUID()}
            handleClick={() => setSelectedItem(item)}
            {...item}
          />
        ))}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 5%, black 10%, black 90%, transparent 95%)",
        }}
      />
      <Stylesheet />
      {selectedItem && (
        <TickerItemModal
          onClose={() => setSelectedItem(null)}
          {...selectedItem}
        />
      )}
    </>
  );
}

/**
 * ==============   Styles   ================
 */
function Stylesheet() {
  return (
    <style>
      {`
        #sandbox {
          align-items: stretch;
        }

        .container-flex {
          display: flex;
          flex-direction: row;
          gap: 20px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .item {
          width: 180px;
          height: 255px;
          overflow: hidden;
          position: relative;
          background: #0a0a0a;
        }

        .title {
          color: #f5f5f5;
          padding: 10px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          inset: 0;
          text-shadow: 1px 1px 0px #000;
          background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.5) 100%);
        }
      `}
    </style>
  );
}
