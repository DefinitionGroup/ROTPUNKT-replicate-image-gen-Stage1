import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { FaWhatsapp, FaFacebook, FaTelegram, FaLink } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import Image from "next/image";
import UpscaleModal from "@/components/UpscaleModal";
import { useTranslations } from "next-intl";

export default function ImageModal({
  src,
  onClose,
  prompt,
}: {
  src: string;
  onClose: () => void;
  prompt?: string;
}) {
  const t = useTranslations('imageModal');
  const tCommon = useTranslations('common');
  const [isMobileEnv, setIsMobileEnv] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showUpscale, setShowUpscale] = useState(false);

  useEffect(() => {
    const isMobile = () => {
      if (typeof navigator === "undefined") return false;
      const ua = navigator.userAgent || "";
      const mobileRe =
        /(Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|BlackBerry|webOS)/i;
      const coarse =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;
      const touch =
        (navigator as any).maxTouchPoints &&
        (navigator as any).maxTouchPoints > 1;
      return mobileRe.test(ua) || coarse || touch;
    };
    setIsMobileEnv(isMobile());
  }, []);

  const normalizedUrl = useMemo(() => {
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://rotpunkt-visions.de/";
      const u = new URL(src, base);
      return u.href;
    } catch {
      return src;
    }
  }, [src]);

  const handleShare = async () => {
    if (!isMobileEnv) {
      setShareOpen(true);
      return;
    }
    try {
      const isHttps =
        typeof window !== "undefined" && window.location.protocol === "https:";
      if (!isHttps) {
        setShareOpen(true);
        return;
      }
      const payload: any = { url: normalizedUrl };
      if (
        typeof (navigator as any).canShare === "function" &&
        !(navigator as any).canShare(payload)
      ) {
        setShareOpen(true);
        return;
      }
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(payload);
        return;
      }
      setShareOpen(true);
    } catch {
      setShareOpen(true);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        className="relative rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <motion.button
          type="button"
          aria-label={tCommon('close')}
          className="absolute top-3 right-3 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 hover:bg-brand-primary-2 border border-white/20 text-brand-secondary-1 shadow-md backdrop-blur-sm transition-colors leading-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
        >
          <span className="text-lg">×</span>
        </motion.button>

        <Image
          src={src}
          width={800}
          height={800}
          alt="Generated image - full size"
          unoptimized
          className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
        />

        <div className="mt-4 flex justify-between gap-3">
          <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full px-6 py-3 text-xs font-medium shadow-lg"
                variant="secondary"
                onClick={isMobileEnv ? handleShare : undefined}
              >
                {t('share')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-50 z-[60] bg-black/60 text-brand-secondary-1 shadow-md backdrop-blur-sm border-white/20"
              side="top"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuItem asChild>
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(
                    normalizedUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                >
                  <FaWhatsapp className="inline mr-2" />
                  WhatsApp
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    normalizedUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                >
                  <FaTelegram className="inline mr-2" />
                  Telegram
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    normalizedUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                >
                  <FaFacebook className="inline mr-2" />
                  Facebook
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    normalizedUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                >
                  <FaSquareXTwitter className="inline mr-2" />X (Twitter)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem asChild>
                <Link
                  href={`mailto:?body=${encodeURIComponent(normalizedUrl)}`}
                  onClick={() => setShareOpen(false)}
                >
                  <MdEmail className="inline mr-2" />
                  Email
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(normalizedUrl);
                  setShareOpen(false);
                }}
              >
                <FaLink className="inline mr-2" />
                {t('copyLink')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowUpscale(true)}
              className="px-6 py-3 text-xs font-medium shadow-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              ✨ {t('upscale')}
            </Button>
            <Button
              asChild
              className="px-6 py-3 text-xs font-medium shadow-lg rounded-full bg-brand-primary-2"
            >
              <Link
                href={normalizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`generated-image-${Date.now()}.png`}
              >
                {tCommon('download')}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showUpscale && (
          <UpscaleModal
            src={src}
            prompt={prompt}
            onClose={() => setShowUpscale(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
