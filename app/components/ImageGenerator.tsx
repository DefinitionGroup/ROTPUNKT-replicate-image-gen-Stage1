"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const testimage = "tmp3_jymwi5.jpg";
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data); // Debug log
        console.log("API Response structure:", JSON.stringify(data, null, 2)); // Debug log

        // Handle different possible response formats
        let imageUrl = null;
        if (data.output) {
          console.log("data.output exists:", data.output);
          console.log("data.output type:", typeof data.output);

          // If output is an array, take the first item
          if (Array.isArray(data.output)) {
            console.log("Output is array, length:", data.output.length);
            const firstItem = data.output[0];
            console.log("First item:", firstItem, "type:", typeof firstItem);

            // Check if it's a string URL or an object with a URL property
            if (typeof firstItem === "string") {
              imageUrl = firstItem;
            } else if (firstItem && typeof firstItem === "object") {
              // Common object properties that might contain the URL
              imageUrl =
                firstItem.url ||
                firstItem.image ||
                firstItem.src ||
                firstItem.uri;
              console.log("Extracted from object:", imageUrl);
            }
          } else if (typeof data.output === "string") {
            // If output is a single URL string
            console.log("Output is string:", data.output);
            imageUrl = data.output;
          } else if (data.output && typeof data.output === "object") {
            // If output is an object with a URL property
            console.log("Output is object:", data.output);
            imageUrl =
              data.output.url ||
              data.output.image ||
              data.output.src ||
              data.output.uri;
            console.log("Extracted from output object:", imageUrl);
          }
        } else {
          console.log("No data.output found in response");
        }

        console.log("Final extracted image URL:", imageUrl); // Debug log

        if (imageUrl && typeof imageUrl === "string") {
          console.log("Adding image to state:", imageUrl); // Debug log
          setImages([imageUrl, ...images]);
          setPrompt("");
          // Automatically open the newly generated image in popover
          setSelectedImage(imageUrl);
        } else {
          console.error("No valid image URL found in response:", data);
          setError("No image generated. Please try again.");
        }
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-4 mb-4">
          <textarea
            rows={5}
            cols={33}
            placeholder="Was möchtest du generieren? (z.B. 'Ein Sonnenuntergang über dem Meer')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-6 py-4 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <motion.button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-12 py-2  self-center bg-red-500 mt-8 text-white font-normal rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:scale-105"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}>
            {loading ? (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Ich generiere gerade dein Bild...
              </motion.div>
            ) : (
              "Erstellen"
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Debug info */}

        <div className="text-xs text-gray-500 mt-2">
          Images array length: {images.length}
          {images.length > 0 && <div>Latest image URL: {images[0]}</div>}
          <div>Selected image: {selectedImage ? "Yes" : "No"}</div>
          {/* Test Popover Button */}
          <motion.button
            onClick={() => setSelectedImage("/tmp3_jymwi5.jpg")}
            className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            🔍 Test Popover (First Image)
          </motion.button>
        </div>

        <div className="text-xs text-gray-600 mt-2">
          <p> Die Bilder werden in aller Regel innerhalb von 30 s generiert.</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            {images.map((img, index) => (
              <motion.div
                key={`${img}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group">
                <motion.img
                  src={typeof img === "string" ? img : ""}
                  alt="Generated image"
                  className="w-full rounded-xl shadow-2xl cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    console.log("Image clicked:", img);
                    setSelectedImage(img);
                  }}
                  onError={(e) => {
                    console.error("Image failed to load:", img);
                    // Optionally remove failed images from state
                    setImages((prev) => prev.filter((_, i) => i !== index));
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}>
                  <div className="absolute bottom-4 left-4 right-4  pointer-events-auto">
                    <motion.a
                      href={typeof img === "string" ? img : "#"}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm text-white rounded-lg 0 transition-colors"
                      whileHover={{ scale: 1.35 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            ))}
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
            onClick={() => setSelectedImage(null)}>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative  rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <motion.button
                className="absolute top-2 right-2 z-10 p-2 bg-gray-700/10 hover:bg-gray-600/20 cursor-pointer rounded-full text-white backdrop-blur-sm transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Image */}
              <motion.div
                className="relative overflow-hidden rounded-xl"
                layoutId={`image-${selectedImage}`}>
                <motion.img
                  src={selectedImage}
                  alt="Generated image - full size"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />

                {/* Image overlay with download button */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0  bg-gradient-to-t from-black/100 to-transparent p-6 pt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}>
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

              {/* Additional Actions */}
              <motion.div
                className="mt-4 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-blue-700 text-gray-500 hover:text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage);
                    // You could add a toast notification here
                  }}>
                  Copy Link
                </motion.button>

                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-red-700 text-gray-500 hover:text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setImages((prev) =>
                      prev.filter((img) => img !== selectedImage)
                    );
                    setSelectedImage(null);
                  }}>
                  Delete Image
                </motion.button>

                <motion.a
                  href={selectedImage}
                  download={`generated-image-${Date.now()}.png`}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
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
