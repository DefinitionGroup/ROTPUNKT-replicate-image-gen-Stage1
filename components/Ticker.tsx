"use client";

import { Ticker } from "motion-plus/react";
import { motion } from "motion/react";

function Box({ src, title }: { src: string; title: string }) {
  return (
    <motion.div
      className="item rounded-2xl  min-w-[300px]"
      initial="hideInfo"
      whileHover="showInfo">
      <motion.img
        style={{
          width: "100%",

          height: "100%",
          objectFit: "cover",
        }}
        src={`${src}`}
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
  );
}

export default function TickerExample() {
  return (
    <>
      <Ticker
        hoverFactor={0.2}
        velocity={22}
        items={[
          <Box src="/tmp3_jymwi5.jpg" title="1" />,
          <Box src="/tmp4h0jaxcl.jpg" title="2" />,
          <Box src="/tmpfzpy88xv.jpg" title="3" />,
          <Box src="/tmpwdynab9d.jpg" title="4" />,
          <Box src="/tmpa6zqgme2.jpg" title="4" />,
          <Box src="/tmpy28old9z.jpg" title="4" />,
          <Box src="/tmpsgpmfvgd.jpg" title="4" />,
          <Box
            src="/replicate-prediction-qzf4gx436nrma0cr34ya9f8fj4.png"
            title="4"
          />,
        ]}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 5%, black 10%, black 90%, transparent 95%)",
        }}
      />
      <Stylesheet />
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
