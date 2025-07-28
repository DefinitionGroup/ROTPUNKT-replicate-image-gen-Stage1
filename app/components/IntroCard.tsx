import { AnimatePresence, motion } from "motion/react";

export function IntroCard({ onStart }: { onStart: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="introcard"
        className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[360px]"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 22,
          duration: 0.7,
        }}
      >
        <motion.img
          src="/rotpunkt-kuechen-logo.svg"
          alt="Rotpunkt Küchen Logo"
          className="mb-6 w-32 h-32"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 120,
          }}
        />
        <motion.h2
          className="text-3xl font-extrabold text-white bg-red-500 bg-clip-text tracking-tighter drop-shadow-xl text-center mb-3"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          Schaffen Sie sich Ihren neuen Raum
        </motion.h2>
        <motion.p
          className="text-gray-200 font-semibold tracking-tight text-md max-w-xl text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.37, duration: 0.38 }}
        >
          Stellen Sie sich Ihre Traumküche Schritt für Schritt zusammen.
          <br />
          Unser AI-Assistent macht daraus ein Bild!
        </motion.p>
        <motion.button
          onClick={onStart}
          className="px-12 py-4 rounded-full bg-red-500 text-white text-lg font-bold shadow-md hover:scale-105 transition-all"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.54,
            type: "spring",
            stiffness: 200,
            damping: 13,
          }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.97 }}
          autoFocus
        >
          Jetzt starten
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
