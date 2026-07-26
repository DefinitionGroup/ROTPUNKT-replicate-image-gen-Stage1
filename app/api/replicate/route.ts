import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import {
  PROMPT_VERSION,
  isGenerationQualityExpectations,
  withLoraTrigger,
  type GenerationContext,
  type PromptVersion,
} from "@/lib/imageGenerationContract";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const START_TIMEOUT_MS = 30_000;

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

const MODEL = "rotpunkt007/basemodel-5-2026:0672a9098a0c17393feeb70989b90488a89e80404be9543ccabe9c87aca4ac08";
const MODEL_VERSION = MODEL.split(":")[1];
const GUIDANCE_SCALE = 3.2;
const KITCHEN_LORA_SCALE = 0.85;
const INTERIOR_LORA_SCALE = 0.65;
const NUM_INFERENCE_STEPS = 28;

function clampInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function getCandidateCount(kitchenMode: boolean): number {
  if (!kitchenMode) return 1;
  const configured = Number(process.env.REPLICATE_KITCHEN_CANDIDATES ?? "2");
  return clampInteger(configured, 2, 1, 4);
}

function normalizePromptVersion(value: unknown): PromptVersion {
  return value === "legacy-debug" ? "legacy-debug" : PROMPT_VERSION;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  if (isDev) console.log(`[${requestId}] 🚀 New async generation request received`);

  const { userId } = await getAuth(req);
  if (!userId) {
    if (isDev) console.log(`[${requestId}] ❌ Unauthorized`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      prompt,
      isKitchen,
      seed: requestedSeed,
      promptVersion: requestedPromptVersion,
      qualityExpectations: requestedQualityExpectations,
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Default to kitchen mode for backward compatibility
    const kitchenMode = typeof isKitchen === "boolean" ? isKitchen : true;

    if (!MODEL_VERSION) {
      throw new Error("Replicate model version is not configured");
    }

    const finalPrompt = withLoraTrigger(prompt);
    const seed = clampInteger(
      requestedSeed,
      Math.floor(Math.random() * 2 ** 32),
      0,
      2 ** 32 - 1
    );
    const numOutputs = getCandidateCount(kitchenMode);
    const loraScale = kitchenMode
      ? KITCHEN_LORA_SCALE
      : INTERIOR_LORA_SCALE;
    const promptVersion = normalizePromptVersion(requestedPromptVersion);
    const qualityExpectations = isGenerationQualityExpectations(
      requestedQualityExpectations
    )
      ? requestedQualityExpectations
      : null;
    const generation: GenerationContext = {
      promptVersion,
      seed,
      numOutputs,
      modelVersion: MODEL_VERSION,
      guidanceScale: GUIDANCE_SCALE,
      loraScale,
      numInferenceSteps: NUM_INFERENCE_STEPS,
    };

    const prediction = await withTimeout(
      replicate.predictions.create({
        version: MODEL_VERSION,
        input: {
          prompt: finalPrompt,
          go_fast: false,
          guidance_scale: GUIDANCE_SCALE,
          megapixels: "1",
          lora_scale: loraScale,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 80,
          seed,
          num_inference_steps: NUM_INFERENCE_STEPS,
          num_outputs: numOutputs,
        },
      }),
      START_TIMEOUT_MS,
      "Replicate prediction start"
    );

    if (!prediction?.id) {
      throw new Error("Replicate did not return a prediction id");
    }

    if (isDev) {
      console.log(`[${requestId}] ✅ Prediction started: ${prediction.id}`);
    }

    return NextResponse.json(
      {
        predictionId: prediction.id,
        status: prediction.status ?? "starting",
        generation,
        qualityExpectations,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Replicate start route error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start generation";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json(
        { error: "Generation start timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to start generation" },
      { status: 500 }
    );
  }
}
