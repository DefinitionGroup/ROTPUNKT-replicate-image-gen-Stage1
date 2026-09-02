import { atom } from "nanostores";
import type { GenerationRequestSpec } from "@/lib/imageGenerationContract";

// Prompt and quality contract are captured together when the wizard submits;
// the generator must never rebuild either from the (possibly reset) wizard state.
export const $generationSpec = atom<GenerationRequestSpec | null>(null);
export const $isKitchenRoom = atom<boolean>(true);
