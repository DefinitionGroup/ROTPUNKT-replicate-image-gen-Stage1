"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import AiGeneratedLabel from "@/components/AiGeneratedLabel";
import { GlassBadge } from "@/components/design-system/glass";
import { getPaginatedImages, type ImageRow } from "@/lib/actions/images";
import { DURATION, REVEAL_RISE, SIGNATURE_EASE, STAGGER } from "@/lib/motion";
import ImageModal from "./ImageModal";

const itemVariants = {
  hidden: { opacity: 0, y: REVEAL_RISE },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * STAGGER, duration: DURATION.reveal, ease: SIGNATURE_EASE },
  }),
};

/** The person's own images, newest first, loading more as the page scrolls. */
export default function ImagesGalleryClient() {
  const t = useTranslations("imageGallery");
  const [selected, setSelected] = useState<ImageRow | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
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
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-signature" />
      </div>
    );
  }

  if (status === "error") {
    return <p className="rounded-card border border-hairline bg-charcoal p-6 text-body text-signature">{t("error")}</p>;
  }

  const allImages = data?.pages.flatMap((page) => page.images) || [];

  if (allImages.length === 0) {
    return <p className="rounded-card border border-hairline bg-charcoal p-6 text-body text-graphite">{t("empty")}</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allImages.map((img, index) => (
          <motion.li
            custom={index % 12}
            initial="hidden"
            key={img.id}
            variants={itemVariants}
            viewport={{ once: true, margin: "-40px" }}
            whileInView="visible"
          >
            <button
              className="group relative block w-full overflow-hidden rounded-card border border-hairline bg-charcoal text-left transition-colors duration-state ease-signature hover:border-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              onClick={() => setSelected(img)}
              type="button"
            >
              <div className="absolute left-3 top-3 z-10 flex gap-2">
                {img.is_selected_best && <GlassBadge>{t("selectedBest")}</GlassBadge>}
                {img.is_upscaled && <GlassBadge>High-Res</GlassBadge>}
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  alt={t("generatedImageAlt")}
                  className="object-cover transition-transform duration-reveal ease-signature group-hover:scale-[1.02]"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  src={img.url}
                  unoptimized
                />
                <AiGeneratedLabel className="pointer-events-none absolute bottom-2 left-2" />
              </div>
              <p className="tnum px-4 py-3 text-caption text-graphite transition-colors duration-state ease-signature group-hover:text-ink" suppressHydrationWarning>
                {new Date(img.created_at).toLocaleString()}
              </p>
            </button>
          </motion.li>
        ))}
      </ul>

      <div className="mt-6 flex min-h-20 items-center justify-center py-10" ref={observerTarget}>
        {isFetchingNextPage ? (
          <Loader2 className="size-5 animate-spin text-signature" />
        ) : (
          <span className="text-caption text-graphite">{hasNextPage ? t("scrollMore") : t("allImages")}</span>
        )}
      </div>

      {selected && (
        <ImageModal onClose={() => setSelected(null)} prompt={selected.imageprompt || ""} src={selected.url} />
      )}
    </>
  );
}
