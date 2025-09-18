import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function IntroCard({ onStart }: { onStart: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="introcard"
        className="w-full max-w-5xl mx-auto flex flex-col border border-white/5 rounded-sm items-center justify-center min-h-[360px]"
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

        <motion.h2
          className="text-3xl font-bold text-brand-secondary-1 tracking-loose drop-shadow-xl text-center mb-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          Neue Räume träumen.
        </motion.h2>

        <Button
          enableMotion
          onClick={onStart}
          variant="red"
          size="red"
          autoFocus
        >
          Jetzt starten
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
