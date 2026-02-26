import { atom } from "nanostores";

function parseBoolean(input: string | undefined, fallback: boolean): boolean {
  if (typeof input !== "string") return fallback;
  const raw = input.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes" || raw === "on") {
    return true;
  }
  if (raw === "false" || raw === "0" || raw === "no" || raw === "off") {
    return false;
  }
  return fallback;
}

const envDefault = parseBoolean(
  process.env.NEXT_PUBLIC_PROMPT_PIPELINE_V2,
  true
);

export const $promptPipelineV2Enabled = atom<boolean>(envDefault);

let hasLoadedRuntimeConfig = false;

export async function loadRuntimeConfig(): Promise<void> {
  if (hasLoadedRuntimeConfig || typeof window === "undefined") return;
  hasLoadedRuntimeConfig = true;

  try {
    const response = await fetch("/CONF.DAT", { cache: "no-store" });
    if (!response.ok) return;

    const content = await response.text();
    const lines = content.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 0) continue;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key === "NEXT_PUBLIC_PROMPT_PIPELINE_V2") {
        $promptPipelineV2Enabled.set(
          parseBoolean(value, $promptPipelineV2Enabled.get())
        );
      }
    }
  } catch {
    // Keep env default when CONF.DAT is unavailable.
  }
}

