import "server-only";

/**
 * Where the Rotpunkt LoRA runs on Replicate.
 *
 * Two shapes are supported:
 *  - `owner/model:version`  — the fine-tune's own model (its weights are
 *    served by Replicate; this is how it ran until 2026-09-24).
 *  - `owner/model`          — a public LoRA runner such as
 *    `black-forest-labs/flux-dev-lora`, which loads the trained weights from
 *    `REPLICATE_LORA_WEIGHTS` (a tarball/safetensors URL, `owner/model`, or
 *    `huggingface.co/owner/repo`; a private repo also needs
 *    `REPLICATE_LORA_HF_TOKEN`, a read token).
 *
 * The default is the public runner, because on 2026-09-25 Replicate stopped
 * serving the fine-tune's weights (`…/_weights` → 404) and every prediction
 * on `rotpunkt007/basemodel-5-2026` stayed in "starting". The training
 * tarball is still downloadable, so the same weights run unchanged through
 * the public runner. See DOCS/production-audit-2026-09-21.md.
 */
export const FINE_TUNE_MODEL =
  "rotpunkt007/basemodel-5-2026:0672a9098a0c17393feeb70989b90488a89e80404be9543ccabe9c87aca4ac08";
export const PUBLIC_LORA_RUNNER = "black-forest-labs/flux-dev-lora";
/** Output of training 6rt0kj6cg9rmr0cwf128t1h9ac (2026-02-19), 172 MB. */
export const TRAINED_WEIGHTS_URL =
  "https://replicate.delivery/xezq/p4Dr1UqHWNZEOFdugZAiZYbCbHUaBetgoqT3YYPCBmY7nqELA/flux-lora.tar";

export const GUIDANCE_SCALE = 3.2;
export const NUM_INFERENCE_STEPS = 28;

export type GenerationTarget =
  | { kind: "fine-tune"; model: string; version: string; label: string }
  | {
      kind: "lora-runner";
      model: string;
      loraWeights: string;
      /** Read token for a private Hugging Face repo; sent to Replicate as `hf_api_token`. */
      hfToken?: string;
      label: string;
    };

function readEnv(name: string): string | undefined {
  const raw = process.env[name]?.trim().replace(/^['"]|['"]$/g, "");
  return raw ? raw : undefined;
}

export function getGenerationTarget(): GenerationTarget {
  const model = readEnv("REPLICATE_GENERATION_MODEL") ?? PUBLIC_LORA_RUNNER;
  const colon = model.indexOf(":");
  if (colon > 0) {
    return {
      kind: "fine-tune",
      model: model.slice(0, colon),
      version: model.slice(colon + 1),
      label: model,
    };
  }
  const loraWeights = readEnv("REPLICATE_LORA_WEIGHTS") ?? TRAINED_WEIGHTS_URL;
  const hfToken = readEnv("REPLICATE_LORA_HF_TOKEN");
  return { kind: "lora-runner", model, loraWeights, hfToken, label: `${model}+${loraWeights}` };
}

type CommonInput = {
  prompt: string;
  seed: number;
  loraScale: number;
};

/**
 * The input for one candidate. The fine-tune and the public runner differ
 * only in how guidance and the LoRA are named; every other setting (16:9,
 * one megapixel, 28 steps, webp) is identical so seeds stay comparable.
 */
export function buildPredictionInput(target: GenerationTarget, input: CommonInput) {
  const shared = {
    prompt: input.prompt,
    go_fast: false,
    megapixels: "1",
    aspect_ratio: "16:9",
    output_format: "webp",
    output_quality: 80,
    seed: input.seed,
    num_inference_steps: NUM_INFERENCE_STEPS,
    num_outputs: 1,
  };
  if (target.kind === "fine-tune") {
    return { ...shared, guidance_scale: GUIDANCE_SCALE, lora_scale: input.loraScale };
  }
  return {
    ...shared,
    guidance: GUIDANCE_SCALE,
    lora_weights: target.loraWeights,
    lora_scale: input.loraScale,
    ...(target.hfToken ? { hf_api_token: target.hfToken } : {}),
  };
}

/** `predictions.create` wants either a pinned version or a public model name. */
export function predictionCreateTarget(target: GenerationTarget) {
  return target.kind === "fine-tune" ? { version: target.version } : { model: target.model };
}
