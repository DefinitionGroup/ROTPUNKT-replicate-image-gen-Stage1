"use client";
import { useState } from "react";
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
    icon: <FaPalette className="text-4xl text-red-400" />,
  },

  {
    key: "style",
    label: "Stil",
    options: ["elegant", "modern", "minimalistisch", "klassisch"],
    icon: <FaCouch className="text-4xl text-blue-400" />,
  },
  {
    key: "kitchenLook",
    label: "Aussehen",
    options: ["modern", "offen", "luxuriös", "kompakt"],
    icon: <FaLayerGroup className="text-4xl text-green-400" />,
  },
  {
    key: "environment",
    label: "Umgebung",
    options: ["stilvoll", "modern", "urban", "naturnah"],
    icon: <FaTree className="text-4xl text-lime-400" />,
  },
  {
    key: "location",
    label: "Standort",
    options: [
      "ein Strand auf Gran Canaria",
      "in den Bergen",
      "am Stadtrand",
      "am See",
    ],
    icon: <FaMapMarkerAlt className="text-4xl text-orange-400" />,
  },
  {
    key: "time",
    label: "Tageszeit",
    options: [
      "Sonnenaufgang",
      "Nachmittag",
      "Abend",
      "Sonnenuntergang",
      "Nacht",
    ],
    icon: <FaRegClock className="text-4xl text-yellow-300" />,
  },
  {
    key: "houseType",
    label: "Haustyp",
    options: [
      "modernes Holzhaus mit großen Fenstern",
      "Stadtwohnung",
      "Loft",
      "Landhaus",
    ],
    icon: <FaHome className="text-4xl text-gray-300" />,
  },
  {
    key: "background",
    label: "Hintergrund",
    options: ["Ozean, Strand und Palmen", "Berge", "Wald", "Stadtpanorama"],
    icon: <FaSun className="text-4xl text-yellow-400" />,
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
interface Props {
  onPromptReady: (prompt: string) => void;
  loading?: boolean;
}

export default function KitchenWizard({ onPromptReady, loading }: Props) {
  const [step, setStep] = useState(-1);
  const [state, setState] = useState<WizardState>({});
  const [extra, setExtra] = useState("");
  const [error, setError] = useState("");

  const handleOption = (option: string) => {
    if (step < 0) return;
    const key = steps[step].key as keyof WizardState;
    setState((prev) => ({ ...prev, [key]: option }));
    setError("");
    setTimeout(() => setStep((s) => s + 1), 90);
  };

  const handleBack = () => {
    if (step === -1) return;
    if (step === 0) setStep(-1);
    else setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (
      !state.color ||
      !state.style ||
      !state.kitchenLook ||
      !state.environment ||
      !state.location ||
      !state.time ||
      !state.houseType ||
      !state.background
    ) {
      setError("Bitte alle Schritte ausfüllen.");
      return;
    }
    const prompt =
      `Dann eine {${state.color}}, {${state.style}} Küche. {${state.kitchenLook}} aussehend in einer {${state.environment}} Umgebung. Standort ist: {${state.location}}. Die Tageszeit ist {${state.time}}. Das Haus ist {${state.houseType}}. Im Hintergrund sieht man: {${state.background}}.` +
      (extra.trim() ? ` Zusätzliche Wünsche: {${extra.trim()}}.` : "");

    onPromptReady(prompt);
  };

  if (step === steps.length + 1) return null;

  return (
    <div className="w-full min-h-[680px] flex items-center justify-center py-10">
      <Card className="w-full max-w-3xl min-h-[620px] flex flex-col bg-gradient-to-br from-black/80 via-gray-900 to-gray-950 border border-gray-800 shadow-2xl rounded-2xl">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleBack}
              disabled={step === -1 || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-red-500 bg-transparent text-red-400 text-base font-bold shadow hover:bg-red-600/10 focus:bg-red-600/20 transition-all
                ${
                  step === -1 || loading
                    ? "opacity-0 cursor-not-allowed"
                    : "hover:scale-105"
                }
              `}
              style={{ minWidth: 110 }}
            >
              <FaArrowLeft className="text-lg" />
              Zurück
            </button>
            {step >= 0 && (
              <div className="flex-1 flex flex-col items-end justify-end ml-3">
                <div className="h-2 w-48 rounded-full bg-gray-800 overflow-hidden">
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
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
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
                  className="mb-3 w-30 h-30"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.16, duration: 0.38 }}
                />
                <div className="flex flex-col gap-2 mb-3">
                  <h2 className="text-3xl font-extrabold text-white bg-red-500 bg-clip-text  tracking-tight drop-shadow-xl ">
                    Schaffen Sie sich Ihren neuen Raum{" "}
                  </h2>
                  <p className="text-gray-200 font-semibold tracking-tight text-base   max-w-xl">
                    Stellen Sie sich Ihre Traumküche Schritt für Schritt
                    zusammen. Unser AI-Assistent macht daraus ein Bild!
                  </p>
                </div>

                <motion.button
                  onClick={() => setStep(0)}
                  className="px-10 py-3 rounded-full bg-red-500 text-white text-lg font-bold shadow-md hover:scale-105 transition-all"
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
                className="w-full flex flex-col items-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                style={{ minHeight: 300 }}
              >
                <span className="mb-2">{steps[step].icon}</span>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {steps[step].label} auswählen
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl mx-auto mt-2 mb-7">
                  {steps[step].options.map((opt) => (
                    <motion.button
                      key={typeof opt === "string" ? opt : opt.value}
                      className={`
                        flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 font-semibold shadow-lg text-base
                        min-h-[52px]
                        ${
                          state[steps[step].key as keyof WizardState] === opt
                            ? "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-800 hover:border-red-400"
                        }
                        transition-all duration-200`}
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleOption(typeof opt === "string" ? opt : opt.value)
                      }
                      disabled={loading}
                    >
                      {typeof opt === "string"
                        ? opt.charAt(0).toUpperCase() + opt.slice(1)
                        : opt.label}
                    </motion.button>
                  ))}
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
                <span className="mb-2">
                  <FcIdea className="text-4xl text-yellow-400" />
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Zusätzliche Wünsche?
                </h3>
                <p className="text-gray-400 mb-3 text-base">
                  Hier können Sie weitere Details eingeben (z.B. "große
                  Kücheninsel, viel Licht")
                </p>
                <textarea
                  className="w-full min-h-[100px] rounded-xl p-4 border border-gray-700 bg-gray-950 text-white mb-5 shadow-lg text-base"
                  placeholder="Hier können Sie weitere Wünsche beschreiben..."
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  disabled={loading}
                />
                <motion.button
                  onClick={() => {
                    handleSubmit();
                    setStep(steps.length + 1);
                  }}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-xl text-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
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
    </div>
  );
}
