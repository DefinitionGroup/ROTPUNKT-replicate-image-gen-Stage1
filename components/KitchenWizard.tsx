"use client";;
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardContent } from "./ui/card";
import {
  FaHome,
  FaRegClock,
  FaTree,
  FaMapMarkerAlt,
  FaPalette,
  FaCouch,
  FaSun,
  FaLayerGroup,
  FaArrowLeft,
} from "react-icons/fa";
import { FcIdea } from "react-icons/fc";

const steps = [
  {
    key: "color",
    label: "Farbe",
    options: [
      { value: "schwarz", label: "Schwarz" },
      { value: "rot", label: "Rot" },
      { value: "burgunderrot", label: "Burgunderrot" },
      { value: "weiß", label: "Weiß" },
      { value: "holz", label: "Holz" },
      { value: "dunkles holz", label: "Dunkles Holz" },
    ],
    icon: <FaPalette className="w-full  h-full text-red-400" />,
  },
  {
    key: "style",
    label: "Stil",
    options: [
      { value: "elegant", label: "Elegant" },
      { value: "modern", label: "Modern" },
      { value: "minimalistisch", label: "Minimalistisch" },
      { value: "klassisch", label: "Klassisch" },
    ],
    icon: <FaCouch className="w-full  h-full text-red-400" />,
  },
  {
    key: "kitchenLook",
    label: "Aussehen",
    options: [
      { value: "modern", label: "Modern" },
      { value: "offen", label: "Offen" },
      { value: "luxuriös", label: "Luxuriös" },
      { value: "kompakt", label: "Kompakt" },
    ],
    icon: <FaLayerGroup className="w-full h-full text-red-400" />,
  },
  {
    key: "environment",
    label: "Umgebung",
    options: [
      { value: "stilvoll", label: "Stilvoll" },
      { value: "modern", label: "Modern" },
      { value: "urban", label: "Urban" },
      { value: "naturnah", label: "Naturnah" },
    ],
    icon: <FaTree className="w-full  h-full  text-red-400" />,
  },
  {
    key: "location",
    label: "Standort",
    options: [
      {
        value: "ein Strand auf Gran Canaria",
        label: "Ein Strand auf Gran Canaria",
      },
      { value: "in den Bergen", label: "In den Bergen" },
      { value: "am Stadtrand", label: "Am Stadtrand" },
      { value: "am See", label: "Am See" },
    ],
    icon: <FaMapMarkerAlt className="w-full  h-full text-red-400" />,
  },
  {
    key: "time",
    label: "Tageszeit",
    options: [
      { value: "Sonnenaufgang", label: "Sonnenaufgang" },
      { value: "Nachmittag", label: "Nachmittag" },
      { value: "Abend", label: "Abend" },
      { value: "Sonnenuntergang", label: "Sonnenuntergang" },
      { value: "Nacht", label: "Nacht" },
    ],
    icon: <FaRegClock className="w-full  h-full text-red-400" />,
  },
  {
    key: "houseType",
    label: "Haustyp",
    options: [
      {
        value: "modernes Holzhaus mit großen Fenstern",
        label: "Modernes Holzhaus mit großen Fenstern",
      },
      { value: "Stadtwohnung", label: "Stadtwohnung" },
      { value: "Loft", label: "Loft" },
      { value: "Landhaus", label: "Landhaus" },
    ],
    icon: <FaHome className="w-full  h-full text-red-400" />,
  },
  {
    key: "background",
    label: "Hintergrund",
    options: [
      { value: "Ozean, Strand und Palmen", label: "Ozean, Strand und Palmen" },
      { value: "Berge", label: "Berge" },
      { value: "Wald", label: "Wald" },
      { value: "Stadtpanorama", label: "Stadtpanorama" },
    ],
    icon: <FaSun className="w-full  h-full text-red-400" />,
  },
];

type WizardState = {
  color?: string;
  style?: string;
  kitchenLook?: string;
  environment?: string;
  location?: string;
  time?: string;
  houseType?: string;
  background?: string;
  extra?: string;
};

const capitalizeFirst = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface WizardProps {
  onPromptReady: (prompt: string) => void;
  loading?: boolean;
  onClose?: () => void;
}

export default function KitchenWizard({
  onPromptReady,
  loading,
  onClose,
}: WizardProps) {
  const [step, setStep] = useState(-1);
  const [state, setState] = useState<WizardState>({});
  const [extra, setExtra] = useState("");
  const [error, setError] = useState("");

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const CARD_HEIGHT = 600;
  const CARD_WIDTH = 720;

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.target === overlayRef.current && onClose) {
      onClose();
    }
  }

  const handleOption = (option: string) => {
    if (step < 0) return;
    const key = steps[step].key as keyof WizardState;
    setState((prev) => ({ ...prev, [key]: option }));
    setError("");
    setStep((s) => s + 1)
    // setTimeout(() =>  , 100);
  };

  const handleBack = () => {
    if (step === -1) return;
    if (step === 0) {
      setStep(-1);
      return
    }

    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const valuesAreValid = Object.values(state).every(Boolean)
    if (!valuesAreValid) {
      setError("Bitte alle Schritte ausfüllen.");
      return;
    }

    const prompt =
      `Dann eine ${state.color}, ${state.style}e Küche. ${capitalizeFirst(
        state.kitchenLook!
      )} aussehend in einer ${state.environment}en Umgebung. Standort ist: ${
        state.location
      }. Die Tageszeit ist ${state.time}. Das Haus ist ${
        state.houseType
      }. Im Hintergrund sieht man: ${state.background}.` +
      (extra.trim() ? ` Zusätzliche Wünsche: ${extra.trim()}.` : "");

    onPromptReady(prompt);
    if (onClose) onClose();
  };


  return (
    <AnimatePresence>
      <motion.div
        key="wizard-popover"
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        tabIndex={-1}
        onMouseDown={handleOverlayClick}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, type: "spring" }}
          className="relative"
          style={{
            width: CARD_WIDTH,
            minWidth: CARD_WIDTH,
            maxWidth: "98vw",
            minHeight: CARD_HEIGHT,
            maxHeight: "96vh",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full h-full min-h-[670px] max-h-[96vh] flex flex-col shadow-2xl bg-gradient-to-br from-black/90 via-gray-900 to-gray-950 border border-gray-800 rounded-2xl">
            <CardHeader className="relative flex flex-row items-center justify-between w-full px-8   ">
              <button
                onClick={handleBack}
                disabled={step === -1 || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-red-400 bg-transparent text-red-400 text-sm font-medium shadow hover:bg-red-500/10 transition-all
                  ${
                    step === -1 || loading
                      ? "opacity-0 cursor-not-allowed pointer-events-none"
                      : "hover:scale-105"
                  }
                `}
                tabIndex={step > -1 ? 0 : -1}
                style={{ minWidth: 108 }}
              >
                <FaArrowLeft className="text-base" />
                Zurück
              </button>
              <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 gap-1">
                {step >= 0 && (
                  <>
                    <div className="h-2 w-64 rounded-full bg-gray-800 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full bg-red-500"
                        initial={false}
                        animate={{
                          width: `${
                            ((Math.min(step, steps.length) + 1) /
                              (steps.length + 1)) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{`Schritt ${Math.min(
                      step + 1,
                      steps.length + 1
                    )} / ${steps.length + 1}`}</span>
                  </>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="ml-3 text-gray-500 hover:text-red-400 text-3xl font-bold"
                  aria-label="Schließen"
                  tabIndex={0}
                >
                  ×
                </button>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col items-center justify-center p-8  ">
              <AnimatePresence mode="wait" initial={false}>
                {step === -1 && (
                  <motion.div
                    key="intro"
                    className="w-full flex flex-col items-center justify-center text-center gap-7"
                    style={{ minHeight: 360 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.38, type: "spring" }}
                  >
                    <motion.img
                      src="/rotpunkt-kuechen-logo.svg"
                      alt="Rotpunkt Küchen Logo"
                      className="mb-3 w-28 h-28"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.16, duration: 0.38 }}
                    />
                    <div className="flex flex-col gap-2 mb-3">
                      <h2 className="text-2xl font-extrabold text-white bg-red-500 bg-clip-text tracking-tight drop-shadow-xl">
                        Küchen-Konfigurator
                      </h2>
                      <p className="text-gray-200  tracking-tight text-sm max-w-xl">
                        Starten Sie jetzt und gestalten Sie Ihre Traumküche
                        Schritt für Schritt.
                      </p>
                    </div>
                    <motion.button
                      onClick={() => setStep(0)}
                      className="px-8 py-3 rounded-full bg-red-500 text-white text-base font-bold shadow-md border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.97 }}
                      autoFocus
                    >
                      Jetzt starten
                    </motion.button>
                  </motion.div>
                )}
                {step >= 0 && step < steps.length && (
                  <motion.div
                    key={step}
                    className="w-full flex flex-col items-center  justify-center"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    style={{ minHeight: 300 }}
                  >
                    <div className="flex   justify-center flex-column  w-24">
                      <div className="mb-4 h-8 w-8 ">{steps[step].icon}</div>
                    </div>
                    <h3 className="text-2xl tracking-tight text-white mb-12">
                      {steps[step].label} auswählen
                    </h3>
                    <div
                      className={`w-full max-w-2xl mx-auto mt-2 mb-7 grid gap-5 ${
                        steps[step].options.length === 5
                          ? "grid-cols-2"
                          : "grid-cols-1 sm:grid-cols-2"
                      }`}
                    >
                      {steps[step].options.map((opt, idx) => {
                        const isOddLast =
                          steps[step].options.length === 5 && idx >= 4;
                        return (
                          <motion.button
                            key={opt.value}
                            className={`
                              flex items-center font-bold justify-center gap-2 px-6 py-3 rounded-full border text-xs h-[48px] min-h-[48px] w-full
                              ${
                                state[steps[step].key as keyof WizardState] ===
                                opt.value
                                  ? "bg-red-500 border-red-600 text-white "
                                  : "bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-900 hover:text-red-500 hover:border-red-600"
                              }
                              ${isOddLast ? "col-span-2 mx-auto w-2/3" : ""}
                            `}
                            whileHover={{ scaleX: 1.051 }}
                            whileTap={{ scaleX: 0.98 }}
                            onClick={() => handleOption(opt.value)}
                            disabled={loading}
                            transition={{
                              type: "spring",
                            }}
                            style={{ minWidth: 0 }}
                          >
                            {opt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                {step === steps.length && (
                  <motion.div
                    key="final"
                    className="w-full flex flex-col items-center"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    style={{ minHeight: 300 }}
                  >
                    <div className="flex   justify-center flex-column  w-24">
                      <div className="mb-4 h-8 w-8 ">
                        <FcIdea className="w-full h-full text-red-400" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center mb-6 ">
                      <h3 className="text-2xl tracking-tight text-white mb-2">
                        Zusätzliche Wünsche?
                      </h3>
                      <p className="text-gray-400 mb-3 text-sm">
                        Hier können Sie weitere Details eingeben (z.B. &quot;große
                        Kücheninsel, viel Licht&quot;)
                      </p>
                    </div>
                    <textarea
                      className="w-full max-w-xl min-h-[80px] rounded-xl p-3 border border-gray-700 bg-gray-950 text-white mb-6 shadow-lg text-base focus:outline-none focus:ring-0"
                      placeholder="Hier können Sie weitere Wünsche beschreiben..."
                      value={extra}
                      onChange={(e) => setExtra(e.target.value)}
                      disabled={loading}
                      maxLength={300}
                      tabIndex={-1}
                    />
                    <motion.button
                      onClick={() => {
                        handleSubmit();
                        setStep(steps.length + 1);
                      }}
                      disabled={loading}
                      className="w-fit py-3 px-8 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600  shadow-xl text-lg"
                      whileHover={{ scaleX: 1.051 }}
                      whileTap={{ scaleX: 0.98 }}
                      transition={{
                        type: "spring",
                      }}
                      style={{ minWidth: 0 }}
                    >
                      Bild erstellen
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-center mt-3"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
