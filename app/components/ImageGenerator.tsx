/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $prompt } from "../store/prompt";
import { useQuery } from "@tanstack/react-query";

export default function ImageGenerator({ onBack }: {  onBack?: () => void }) {
  const prompt = useStore($prompt)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isError, isLoading } = useQuery({
    queryKey: ['/api/replicate'],
    queryFn: () => fetch('/api/replicate', {
      body: JSON.stringify({ prompt }),
      method: 'POST'
    }).then(res => res.json() as Promise<string[]>),
  })

  useEffect(() => {
    if (images) setSelectedImage(images[0]!)
  }, [images])

  return (
    <div className="w-full  mx-auto h-full flex flex-col justify-center items-center transition-all duration-300">
      {onBack && images && images.length > 0 && !isLoading && (
        <button
          onClick={onBack}
          className="mb-10 px-4 py-2 rounded-full bg-gray-800 text-white text-xs hover:bg-red-500 transition-all"
        >
          ⇦ Zurück zum Küchen-Wizard
        </button>
      )}

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[45rem]">
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="flex flex-col items-center justify-center w-full max-w-3xl min-h-[600px] bg-gradient-to-br from-black/90 via-gray-900 to-gray-950 border border-gray-800 shadow-2xl rounded-2xl p-8"
            >
              <div className="flex items-center justify-center w-48 h-48 mb-4 ">
                <DotLottieReact
                  src="/UI/LoadingImageAnimation.lottie"
                  loop
                  autoplay
                />
              </div>
              <span className="mt-2 text-lg text-white font-medium text-center">
                Ich generiere gerade dein Bild...
              </span>
              <div className="text-xs text-gray-400 mt-2 text-center">
                Die Bilder werden in aller Regel innerhalb von 30&nbsp;s
                generiert.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isError && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-center text-base my-4"
          >
            Failed to generate image. Please try again.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && images && images.length > 0 && (
          <motion.div
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {images.map((img) => (
                <div key={img} className="flex items-center justify-center">
                  <img
                    src={img}
                    alt="Generated image"
                    crossOrigin="anonymous"
                    className="rounded-xl shadow-2xl w-full"
                    onClick={() => setSelectedImage(img)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Popover Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedImage(null)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                className="absolute top-2 right-2 z-10 p-2 bg-gray-700/10 hover:bg-gray-600/20 cursor-pointer rounded-full text-white backdrop-blur-sm transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
              <motion.div
                className="relative overflow-hidden rounded-xl"
                layoutId={`image-${selectedImage}`}
              >
                <motion.img
                  src={selectedImage}
                  alt="Generated image - full size"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/100 to-transparent p-6 pt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col justify-start text-left text-white">
                      <h3 className="text-lg font-normal">Generated Image</h3>
                      <p className="text-gray-300 text-xs">
                        Click to download in full resolution
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div
                className="mt-4 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-blue-700 text-gray-500 hover:text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage);
                  }}
                >
                  Copy Link
                </motion.button>
              {/* <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-red-700 text-gray-500 hover:text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setImages((prev) =>
                      prev.filter((img) => img !== selectedImage)
                    );
                    setSelectedImage(null);
                  }}
                >
                  Delete Image
                </motion.button> */}

                <motion.a
                  href={selectedImage}
                  target="_blank"
                  download={`generated-image-${Date.now()}.png`}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
