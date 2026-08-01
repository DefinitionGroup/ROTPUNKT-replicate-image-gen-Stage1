"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPaginatedImages, type ImageRow } from "@/lib/actions/images";
import { Loader2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import AiGeneratedLabel from "@/components/AiGeneratedLabel";

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }),
};

export default function ImagesGalleryClient() {
  const t = useTranslations('imageGallery');
  const [selected, setSelected] = useState<ImageRow | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["images"],
    queryFn: ({ pageParam = 0 }) => getPaginatedImages(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-brand-primary-2 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-destructive">
        {t('error')}
      </div>
    );
  }

  const allImages = data?.pages.flatMap((page) => page.images) || [];

  if (allImages.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-muted-foreground">
        {t('empty')}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allImages.map((img, index) => (
          <motion.button
            key={img.id}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            custom={index % 12}
            type="button"
            onClick={() => setSelected(img)}
            className="group relative block text-left rounded-xl overflow-hidden border border-border bg-card hover:border-brand-primary-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2"
          >
            {img.is_upscaled && (
              <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-[10px] font-medium text-white">
                ✨ High-Res
              </div>
            )}
            {img.is_selected_best && (
              <div
                className="absolute left-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-emerald-400 text-black shadow-lg"
                title={t("selectedBest")}
              >
                <Star className="size-4" fill="currentColor" />
              </div>
            )}
            <div className="relative">
              <Image
                src={img.url}
                alt="Generated"
                width={800}
                height={800}
                unoptimized
                className="w-full h-auto object-cover"
              />
              <AiGeneratedLabel className="pointer-events-none absolute bottom-2 left-2" />
            </div>
            <div
              className="px-4 py-3 text-xs text-muted-foreground group-hover:text-foreground transition"
              suppressHydrationWarning
            >
              {new Date(img.created_at).toLocaleString()}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Loading target for Infinite Scroll */}
      <div ref={observerTarget} className="flex justify-center items-center py-10 mt-6 min-h-20">
        {isFetchingNextPage ? (
          <Loader2 className="w-6 h-6 text-brand-primary-2 animate-spin" />
        ) : hasNextPage ? (
          <span className="text-xs text-muted-foreground">{t('scrollMore')}</span>
        ) : (
          <span className="text-xs text-muted-foreground">{t('allImages')}</span>
        )}
      </div>

      {selected && (
        <ImageModal
          src={selected.url}
          onClose={() => setSelected(null)}
          prompt={selected.imageprompt || ""}
        />
      )}
    </>
  );
}
