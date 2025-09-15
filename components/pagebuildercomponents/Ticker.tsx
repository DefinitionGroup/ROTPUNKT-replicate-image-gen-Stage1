"use client";

import type {
  TickerGallery as TickerGalleryType,
  TickerContentGallery as TickerContentGalleryType,
  TickerItem,
} from "@/sanity/sanity.types";
import { Ticker } from "motion-plus/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import TickerItemModal from "../TickerItemModal";

const MotionImage = motion(Image);

type GalleryItem = TickerItem & { _key: string };

type Props = TickerGalleryType | TickerContentGalleryType;

function isTickerGallery(p: Props): p is TickerGalleryType {
  return "tickersliderItemContents" in p;
}
function isTickerContentGallery(p: Props): p is TickerContentGalleryType {
  return "tickerItems" in p;
}

function Box(props: GalleryItem & { handleClick: () => void }) {
  const { imageCloudinary, title, handleClick } = props;

  return (
    <motion.div
      className="item rounded-2xl min-w-[300px] overflow-hidden cursor-pointer selection:bg-red-500 selection:text-white"
      onClick={handleClick}
      initial="hideInfo"
      whileHover="showInfo"
    >
      <MotionImage
        src={imageCloudinary?.secure_url ?? "/placeholder.svg"}
        alt={`${title ?? "Image"} boxart`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 300px"
        variants={{ hideInfo: { scale: 1, filter: "blur(0px)", opacity: 1 } }}
      />
      <motion.div
        className="title selection:bg-red-500 selection:text-white"
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

export default function TickerGallery(props: Props) {
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);

  const items: GalleryItem[] = useMemo(() => {
    if (isTickerGallery(props)) {
      return props.tickersliderItemContents ?? [];
    }
    if (isTickerContentGallery(props)) {
      return (props.tickerItems ?? []) as GalleryItem[];
    }
    return [];
  }, [props]);

  return (
    <div className="my-20">
      <Ticker
        className="selection:bg-red-500 selection:text-white"
        hoverFactor={0.2}
        velocity={22}
        items={items.map((item) => (
          <Box
            key={item._key}
            handleClick={() => setSelectedItem(item)}
            {...item}
          />
        ))}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 5%, black 10%, black 90%, transparent 95%)",
          WebkitMaskImage:
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
    </div>
  );
}

/**
 * ==============   Styles   ================
 */
function Stylesheet() {
  return (
    <style>{`
      #sandbox { align-items: stretch; }

      .container {
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
    `}</style>
  );
}
