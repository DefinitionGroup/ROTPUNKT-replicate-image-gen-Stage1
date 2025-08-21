"use client";

import { TickerGallery as TickerGalleryType, TickerItem } from "@/sanity/sanity.types";
import { Ticker } from "motion-plus/react";
import { motion } from "motion/react";
import { useState } from "react";
import TickerItemModal from "./TickerItemModal";

function Box(props: TickerItem & {handleClick: () => void}) {
  const { imageCloudinary, title, handleClick} = props


  return (
    <>
      <motion.div
        className="item rounded-2xl  min-w-[300px]"
        onClick={handleClick}
        initial="hideInfo"
        whileHover="showInfo">
        <motion.img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          src={`${imageCloudinary?.secure_url}`}
          alt={title + " boxart"}
          variants={{
            hideInfo: { scale: 1, filter: "blur(0px)", opacity: 1 },
          }}
          />
        <motion.div
          className="title"
          variants={{
            hideInfo: { opacity: 0, scale: 1.2 },
            showInfo: { opacity: 1, scale: 1 },
          }}>
          {title}
        </motion.div>
      </motion.div>

    </>
  );
}

export default function TickerGallery({ tickerItems }: TickerGalleryType) {
  const [selectedItem, setSelectedItem] = useState<TickerItem|null>(null)

  return (
    <>
      <Ticker
        hoverFactor={0.2}
        velocity={22}
        items={tickerItems ? tickerItems.map((item) => (
          <Box
            handleClick={() => setSelectedItem(item)}
            key={item.title!}
            {...item}
          />
        )) : []
        }
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
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            text-shadow: 1px 1px 0px #000;
       }
      `}
    </style>
  );
}
