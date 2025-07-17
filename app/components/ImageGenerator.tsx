"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        // Handle different possible response formats
        let imageUrl = null;
        if (data.output) {
          // If output is an array, take the first item
          if (Array.isArray(data.output)) {
            const firstItem = data.output[0];
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
            }
          } else if (typeof data.output === "string") {
            // If output is a single URL string
            imageUrl = data.output;
          } else if (data.output && typeof data.output === "object") {
            // If output is an object with a URL property
            imageUrl =
              data.output.url ||
              data.output.image ||
              data.output.src ||
              data.output.uri;
          }
        }

        console.log("Extracted image URL:", imageUrl); // Debug log

        if (imageUrl && typeof imageUrl === "string") {
          console.log("Adding image to state:", imageUrl); // Debug log
          setImages([imageUrl, ...images]);
          setPrompt("");
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
            type="textarea"
            rows="5"
            cols="33"
            placeholder="Was möchtest du generieren? (z.B. 'Ein Sonnenuntergang über dem Meer')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-6 py-4 bg-grazß900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <motion.button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-12 py-2  self-center bg-red-500 text-white font-normal rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:scale-105"
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
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 mt-2">
            Images array length: {images.length}
            {images.length > 0 && <div>Latest image URL: {images[0]}</div>}
          </div>
        )}
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
                  className="w-full rounded-xl shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onError={(e) => {
                    console.error("Image failed to load:", img);
                    // Optionally remove failed images from state
                    setImages((prev) => prev.filter((_, i) => i !== index));
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}>
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.a
                      href={typeof img === "string" ? img : "#"}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <svg
                        className="w-5 h-5"
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
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
