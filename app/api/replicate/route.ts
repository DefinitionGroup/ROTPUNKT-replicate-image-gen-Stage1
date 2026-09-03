import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { createSupabaseUserClient } from "@/lib/supabaseServer";
import {
  DEFAULT_GENERATION_SEED,
  LORA_GENERATION_SCALE,
  PROMPT_VERSION,
  candidateSeeds,
  findPromptContractMismatch,
  isGenerationQualityExpectations,
  isGenerationVariantManifest,
  normalizeGenerationSeed,
  withLoraTrigger,
  type GenerationSetContext,
  type GenerationVariantContext,
  type PromptVersion,
} from "@/lib/imageGenerationContract";
import {
  getQualityGateCandidateCount,
  getQualityGateMode,
} from "@/lib/qualityGate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const START_TIMEOUT_MS = 30_000;
const MODEL =
  "rotpunkt007/basemodel-5-2026:0672a9098a0c17393feeb70989b90488a89e80404be9543ccabe9c87aca4ac08";
const MODEL_VERSION = MODEL.split(":")[1];
const GUIDANCE_SCALE = 3.2;
const NUM_INFERENCE_STEPS = 28;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

function normalizePromptVersion(value: unknown): PromptVersion {
  return value === "legacy-debug" ? "legacy-debug" : PROMPT_VERSION;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  let generationSetId: string | null = null;
  let supabase: ReturnType<typeof createSupabaseUserClient> | null = null;
  const { userId, getToken } = await getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      prompt,
      seed: requestedSeed,
      promptVersion: requestedPromptVersion,
      qualityExpectations: requestedQualityExpectations,
      previousGenerationSetId,
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (!MODEL_VERSION) {
      throw new Error("Replicate model version is not configured");
    }

    supabase = createSupabaseUserClient(() =>
      getToken({ template: "supabase" })
    );
    generationSetId = crypto.randomUUID();
    let seed = isDev
      ? normalizeGenerationSeed(requestedSeed)
      : DEFAULT_GENERATION_SEED;
    // A retry continues the deterministic seed sequence instead of
    // reproducing the very same image.
    if (typeof previousGenerationSetId === "string" && previousGenerationSetId) {
      const { data: previous } = await supabase
        .from("generation_sets")
        .select("seed, prediction_manifest")
        .eq("id", previousGenerationSetId)
        .eq("user_id", userId)
        .maybeSingle();
      if (previous) {
        const manifest = isGenerationVariantManifest(previous.prediction_manifest)
          ? previous.prediction_manifest
          : [];
        const usedSeeds = [
          Number(previous.seed),
          ...manifest.map((variant) => variant.seed ?? Number(previous.seed)),
        ];
        seed = normalizeGenerationSeed(Math.max(...usedSeeds) + 1);
      }
    }
    const promptVersion = normalizePromptVersion(requestedPromptVersion);
    if (!isGenerationQualityExpectations(requestedQualityExpectations)) {
      return NextResponse.json(
        { error: "A valid quality contract is required" },
        { status: 400 }
      );
    }
    const qualityExpectations = requestedQualityExpectations;
    const contractMismatch = findPromptContractMismatch({
      prompt,
      promptVersion,
      qualityExpectations,
    });
    if (contractMismatch) {
      return NextResponse.json(
        {
          error: `Prompt and quality contract are inconsistent: ${contractMismatch}`,
        },
        { status: 400 }
      );
    }
    const finalPrompt = withLoraTrigger(prompt);
    const now = new Date().toISOString();
    // Enforce mode races several candidates so the validator can pick one.
    const gateMode = getQualityGateMode();
    const candidateCount =
      gateMode === "enforce" ? getQualityGateCandidateCount() : 1;
    const seeds = candidateSeeds(seed, candidateCount);

    const { error: setInsertError } = await supabase
      .from("generation_sets")
      .insert({
        id: generationSetId,
        user_id: userId,
        prompt: prompt.trim(),
        prompt_version: promptVersion,
        seed,
        model_version: MODEL_VERSION,
        guidance_scale: GUIDANCE_SCALE,
        num_inference_steps: NUM_INFERENCE_STEPS,
        requested_lora_scales: seeds.map(() => LORA_GENERATION_SCALE),
        quality_expectations: qualityExpectations,
        status: "starting",
        updated_at: now,
      });

    if (setInsertError) {
      throw new Error(`Generation set insert failed: ${setInsertError.message}`);
    }

    const starts = await Promise.allSettled(
      seeds.map((variantSeed, candidateIndex) =>
        withTimeout(
          replicate.predictions.create({
            version: MODEL_VERSION,
            input: {
              prompt: finalPrompt,
              go_fast: false,
              guidance_scale: GUIDANCE_SCALE,
              megapixels: "1",
              lora_scale: LORA_GENERATION_SCALE,
              aspect_ratio: "16:9",
              output_format: "webp",
              output_quality: 80,
              seed: variantSeed,
              num_inference_steps: NUM_INFERENCE_STEPS,
              num_outputs: 1,
            },
          }).then((prediction) => {
            if (!prediction.id) {
              throw new Error(`No prediction id for candidate ${candidateIndex}`);
            }
            return {
              predictionId: prediction.id,
              status: prediction.status ?? "starting",
              candidateIndex,
              loraScale: LORA_GENERATION_SCALE,
              seed: variantSeed,
            } satisfies GenerationVariantContext;
          }),
          START_TIMEOUT_MS,
          `Replicate prediction start for candidate ${candidateIndex}`
        )
      )
    );

    const variants = starts.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : []
    );

    if (variants.length !== seeds.length) {
      await Promise.allSettled(
        variants.map((variant) =>
          replicate.predictions.cancel(variant.predictionId)
        )
      );
      await supabase
        .from("generation_sets")
        .update({
          prediction_manifest: variants,
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", generationSetId)
        .eq("user_id", userId);
      throw new Error("The LoRA generation could not be started");
    }

    const { error: manifestError } = await supabase
      .from("generation_sets")
      .update({
        prediction_manifest: variants,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", generationSetId)
      .eq("user_id", userId);

    if (manifestError) {
      await Promise.allSettled(
        variants.map((variant) =>
          replicate.predictions.cancel(variant.predictionId)
        )
      );
      throw new Error(`Prediction manifest update failed: ${manifestError.message}`);
    }

    const generationSet: GenerationSetContext = {
      generationSetId,
      status: "processing",
      promptVersion,
      seed,
      modelVersion: MODEL_VERSION,
      guidanceScale: GUIDANCE_SCALE,
      numInferenceSteps: NUM_INFERENCE_STEPS,
      variants,
    };

    if (isDev) {
      console.log(
        `[${requestId}] Started generation set ${generationSetId} (${gateMode}) with seeds ${seeds.join(", ")}`
      );
    }

    return NextResponse.json(
      { generationSet, qualityExpectations, gateMode, candidateCount: seeds.length },
      { status: 202 }
    );
  } catch (error) {
    console.error("Replicate generation start route error:", error);
    if (generationSetId && supabase) {
      try {
        await supabase
          .from("generation_sets")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", generationSetId)
          .eq("user_id", userId);
      } catch (setUpdateError) {
        console.error(
          `Could not mark generation set ${generationSetId} as failed:`,
          setUpdateError
        );
      }
    }
    const message =
      error instanceof Error ? error.message : "Failed to start generation";
    const status = message.toLowerCase().includes("timed out") ? 504 : 500;
    return NextResponse.json(
      {
        error:
          status === 504
            ? "Generation start timed out"
            : "Failed to start generation",
        generationSetId,
      },
      { status }
    );
  }
}
