import { atom } from "nanostores";

export const $prompt = atom<string | null>(null);
export const $isKitchenRoom = atom<boolean>(true);
