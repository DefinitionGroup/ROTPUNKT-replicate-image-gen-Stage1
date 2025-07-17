"use client";

import { motion, AnimatePresence } from "motion/react";
import ImageGenerator from "./components/ImageGenerator";
import TickerExample from "./components/Ticker";
export default function Home() {
  return (
    <main>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="container mx-auto px-4 py-16">
          <img
            src="/rotpunkt-kuechen-logo.svg"
            alt="Logo"
            className="mx-auto mb-2 w-24 h-24 "
          />
        </div>
      </motion.div>
      <TickerExample />
      <div className="text-center mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 222, delay: 0.7 }}>
          <h1 className="text-5xl font-normal text-center py-2 mb-2 bg-red-500 bg-clip-text text-transparent">
            Traumküchen.
          </h1>
        </motion.div>{" "}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 222, delay: 1.2 }}>
          <p className="text-center text-lg text-gray-300 mb-12">
            Tröumen Sie Ihre Rotpunkt-Traumküche mit unserem AI-Generator.
          </p>{" "}
        </motion.div>
        <motion.div
          className="my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 122, delay: 1.2 }}>
          <ImageGenerator />
        </motion.div>
      </div>
    </main>
  );
}
