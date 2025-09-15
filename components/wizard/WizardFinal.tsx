import React from "react";
import { motion } from "motion/react";
import { FcIdea } from "react-icons/fc";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

interface WizardFinalProps {
  extraWishes: string;
  onExtraWishesChange: (value: string) => void;
  showAuthPrompt: boolean;
  isSignedIn: boolean;
  onSubmit: () => void;
  onAuthRequired: () => void;
  loading?: boolean;
}

export const WizardFinal: React.FC<WizardFinalProps> = ({
  extraWishes,
  onExtraWishesChange,
  showAuthPrompt,
  isSignedIn,
  onSubmit,
  onAuthRequired,
  loading = false,
}) => {
  if (showAuthPrompt && !isSignedIn) {
    return (
      <motion.div
        key="auth-card"
        className="w-full p-6 text-red-100 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <div className="">
          <h3 className="text-2xl tracking-tight text-brand-secondary-1 mb-2">
            Du musst eingeloggt sein, um ein Bild zu generieren.
          </h3>
          <p className="text-gray-400 mb-3 text-sm">
            Bitte melde dich an oder registriere dich. Danach kannst du direkt
            fortfahren.
          </p>
        </div>

        <div className="flex items-center gap-3 max-w-lg w-full px-6">
          <SignInButton mode="modal">
            <motion.button
              className="cursor-pointer flex items-center font-bold justify-center gap-2 px-6 py-3 rounded-full border text-md min-h-[48px] w-full bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-900 hover:text-red-500 hover:border-red-600"
              whileHover={{ scaleX: 1.051 }}
              whileTap={{ scaleX: 0.98 }}
              transition={{ type: "spring" }}
            >
              Einloggen
            </motion.button>
          </SignInButton>
          <SignUpButton mode="modal">
            <motion.button
              className="cursor-pointer flex items-center font-bold justify-center gap-2 px-6 py-3 rounded-full border text-md min-h-[48px] w-full bg-brand-primary-2 border-red-600 text-brand-secondary-1 hover:bg-red-600 hover:border-red-700"
              whileHover={{ scaleX: 1.051 }}
              whileTap={{ scaleX: 0.98 }}
              transition={{ type: "spring" }}
            >
              Registrieren
            </motion.button>
          </SignUpButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="final-content"
      className="w-full flex flex-col items-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-center w-24">
        <div className="mb-4 h-8 w-8">
          <FcIdea className="w-full h-full text-red-400" />
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <h3 className="text-2xl tracking-tight text-brand-secondary-1 mb-2">
          Zusätzliche Wünsche?
        </h3>
        <p className="text-gray-400 mb-3 text-sm">
          Hier können Sie weitere Details eingeben (z.B. &quot;große
          Kücheninsel, viel Licht&quot;)
        </p>
      </div>

      <textarea
        className="w-full max-w-xl min-h-[80px] rounded-xl p-3 border border-gray-700 bg-gray-950 text-brand-secondary-1 mb-6 shadow-lg text-base focus:outline-none focus:ring-0"
        placeholder="Hier können Sie weitere Wünsche beschreiben..."
        value={extraWishes}
        onChange={(e) => onExtraWishesChange(e.target.value)}
        disabled={loading}
        maxLength={300}
        tabIndex={-1}
      />

      <motion.button
        onClick={isSignedIn ? onSubmit : onAuthRequired}
        disabled={loading}
        className={`cursor-pointer w-fit py-3 px-8 rounded-full font-semibold shadow-xl text-lg
          ${
            isSignedIn
              ? "bg-brand-primary-2 text-brand-secondary-1 hover:bg-red-600"
              : "bg-gray-800 text-gray-400"
          }`}
        whileHover={isSignedIn ? { scaleX: 1.051 } : undefined}
        whileTap={isSignedIn ? { scaleX: 0.98 } : undefined}
        transition={{ type: "spring" }}
        style={{ minWidth: 0 }}
      >
        Bild erstellen
      </motion.button>
    </motion.div>
  );
};
