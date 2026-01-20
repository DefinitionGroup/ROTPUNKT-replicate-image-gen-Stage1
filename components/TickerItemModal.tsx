import { motion } from "motion/react";
import Image from "next/image";
import type { CloudinaryAsset } from "@/sanity/sanity.types";

/** Same minimal shape used in the gallery */
type RenderableTickerItem = {
  _key?: string | null;
  title?: string | null;
  description?: string | null;
  imageCloudinary?: CloudinaryAsset | null;
};

type Props = {
  onClose: () => void;
} & RenderableTickerItem;

export default function TickerItemModal({
  onClose,
  imageCloudinary,
  title,
  description,
}: Props) {
  const src = imageCloudinary?.secure_url ?? "/placeholder.svg";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <motion.button
          type="button"
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 hover:bg-brand-primary-2 border border-white/20 text-brand-secondary-1 shadow-md backdrop-blur-sm transition-colors leading-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
        >
          <span className="text-lg">×</span>
        </motion.button>

        <Image
          src={src}
          width={1200}
          height={800}
          alt={title ? `${title} – full size` : "Image"}
          unoptimized
          className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
        />

        <div className="mt-4 flex flex-col gap-2">
          {title && (
            <h2 className="text-2xl font-bold text-brand-secondary-1 leading-loose">
              {title}
            </h2>
          )}
          {description && <p className="text-neutral-300">{description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
