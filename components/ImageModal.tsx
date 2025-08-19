import { motion } from "motion/react";
import { useEffect, useState } from "react";
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
export default function ImageModal({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const [isMobileEnv, setIsMobileEnv] = useState(false);

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

  const handleNativeShare = async () => {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: "Generated image",
          text: "",
          url: src,
        });
      }
    } catch {
      // user canceled or share failed — ignore
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
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 hover:bg-red-500 border border-white/20 text-white shadow-md backdrop-blur-sm transition-colors leading-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
        >
          <span className="text-lg">×</span>
        </motion.button>

        <motion.img
          src={src}
          alt="Generated image - full size"
          className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
        />

        <div className="mt-4 flex gap-3">
          {isMobileEnv ? (
            <Button
              onClick={handleNativeShare}
              className="rounded-full text-xs font-medium shadow-lg"
            >
              Share
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-full px-6 py-3 text-xs font-medium shadow-lg"
                  variant="secondary"
                >
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-50 z-[60] bg-black/60 text-white  shadow-md backdrop-blur-sm border-white/20"
                side="top"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`https://wa.me/?text=${encodeURIComponent(src)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp className="inline mr-2" />
                    WhatsApp
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      src
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTelegram className="inline mr-2" />
                    Telegram
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      src
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="inline mr-2" />
                    Facebook
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      src
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSquareXTwitter className="inline mr-2" />X (Twitter)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem asChild>
                  <Link href={`mailto:?body=${encodeURIComponent(src)}`}>
                    <MdEmail className="inline mr-2" />
                    Email{" "}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(src)}
                >
                  <FaLink className="inline mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            asChild
            className="px-6 py-3 text-xs font-medium shadow-lg rounded-full"
          >
            <Link
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              download={`generated-image-${Date.now()}.png`}
            >
              Download
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
