import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";

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

const MODEL =
  "mainframeai/rddt-finetune-dec-2025:9620255525bcbad26f909dd62b2820aaae39aa99d0d9de5933c4a39465c6ff83";
const MODEL_VERSION = MODEL.split(":")[1];
const NEGATIVE_PROMPT =
  "duplicate sinks, double faucets, extra taps, floating lamps, disembodied lighting,text on surfaces, text, typography, distorted structure, warped cabinetry, incorrect perspective";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  if (isDev) console.log(`[${requestId}] 🚀 New async generation request received`);

  const { userId } = await getAuth(req);
  if (!userId) {
    if (isDev) console.log(`[${requestId}] ❌ Unauthorized`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!MODEL_VERSION) {
      throw new Error("Replicate model version is not configured");
    }

    const finalPrompt = `RDTDOT ${prompt.trim()}`;

    const prediction = await withTimeout(
      replicate.predictions.create({
        version: MODEL_VERSION,
        input: {
          prompt: finalPrompt,
          go_fast: false,
          guidance: 5,
          strength: 0.9,
          image_size: "optimize_for_speed",
          lora_scale: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          enhance_prompt: true,
          output_quality: 80,
          negative_prompt: NEGATIVE_PROMPT,
          num_inference_steps: 24,
          num_outputs: 1,
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
