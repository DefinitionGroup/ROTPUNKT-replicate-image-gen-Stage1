"use client";

import { motion, AnimatePresence } from "motion/react";
import ImageGenerator from "./components/ImageGenerator";
import TickerExample from "./components/Ticker";
export default function Home() {
  return (
    <main>
      <div className="bg-black grid grid-cols-1 grid-rows-1  text-white h-[50vh] min-h-[500px] overflow-hidden items-center justify-center">
        {" "}
        <motion.div
          className="w-full  mb-4 col-span-1 row-span-1 col-start-1 row-start-1 object-cover "
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 0.4, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 72,
            mass: 1,
            damping: 20,
            delay: 1.1,
          }}>
          <img
            className="w-full  mb-4 col-span-1 row-span-1 col-start-1 row-start-1 object-cover object-bottom "
            src={"tmp9fp4q57x.jpg"}
            alt="Logo"
          />{" "}
        </motion.div>
        <div className=" container mx-auto px-4 py-16 items-center flex-wrap flex flex-col justify-center row-start-1 col-start-1 z-2">
          <motion.div
            className="mx-auto  px-4 py-16 w-full "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}>
            <div>
              <img
                src="/rotpunkt-kuechen-logo.svg"
                alt="Logo"
                className="mx-auto mb-2 w-24 max-h-24 "
              />
            </div>
          </motion.div>
          <motion.div
            className="mx-auto   w-full "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", delay: 1.22 }}>
            <h1 className="text-6xl font-bold uppercase tracking-tighter text-center  bg-red-500 bg-clip-text text-transparent">
              Traumküchen.
            </h1>
          </motion.div>
          <motion.div
            className="mx-auto   w-full "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", delay: 1.45 }}>
            <p className="text-center text-lg text-gray-200 font-black tracking-tight">
              Träumen Sie Ihre Rotpunkt-Traumküche mit unserem AI-Assistenten.
            </p>{" "}
          </motion.div>
          <motion.div
            className="mx-auto  max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", delay: 1.7 }}>
            <p className="text-center text-sm text-gray-300 leading-relaxed mb-12 tracking-wide">
              Einfach eine Beschreibung eingeben und die AI generiert ein Bild
              Ihrer Traumküche. Und wenn wir Sie nicht haben, dann bauen wir sie
              für Sie.
            </p>{" "}
          </motion.div>
        </div>{" "}
      </div>

      <div className="text-center mt-8">
        <motion.div
          className="my-32"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", mass: 60, delay: 2.2 }}>
          <ImageGenerator />
        </motion.div>{" "}
        <TickerExample />
      </div>
    </main>
  );
}
