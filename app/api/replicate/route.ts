import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const REPLICATE_TIMEOUT_MS = 180_000;

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

const MODEL = "mainframeai/rddt-finetune-dec-2025:9620255525bcbad26f909dd62b2820aaae39aa99d0d9de5933c4a39465c6ff83";
const NEGATIVE_PROMPT =
  "duplicate sinks, double faucets, extra taps, floating lamps, disembodied lighting,text on surfaces, text, typography, distorted structure, warped cabinetry, incorrect perspective";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  if (isDev) console.log(`[${requestId}] 🚀 New generation request received`);

  const { userId, getToken } = await getAuth(req);
  if (!userId) {
    if (isDev) console.log(`[${requestId}] ❌ Unauthorized`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDev) console.log(`[${requestId}] 👤 User: ${userId}`);

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (isDev) console.log(`[${requestId}] 📝 Prompt: ${prompt.slice(0, 50)}...`);

    const finalPrompt = `RDTDOT ${prompt.trim()}`;

    const startTime = Date.now();
    const output = await withTimeout(replicate.run(MODEL, {
      // input: {
      //   prompt: finalPrompt,
      //   go_fast: true,
      //   guidance: 3,
      //   strength: 0.9,
      //   image_size: "optimize_for_quality",
      //   lora_scale: 1,
      //   aspect_ratio: "16:9",
      //   output_format: "webp",
      //   enhance_prompt: true,
      //   output_quality: 80,
      //   negative_prompt: NEGATIVE_PROMPT,
      //   num_inference_steps: 30,
      //   num_outputs: 1,
      // },
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
    }), REPLICATE_TIMEOUT_MS, "Replicate generation");
    const totalTime = Date.now() - startTime;

    // Cold start typically > 20s, warm < 10s
    const isColdStart = totalTime > 20000;
    if (isDev) {
      console.log(`[${requestId}] ⏱️ Replicate generation took ${(totalTime / 1000).toFixed(1)}s — ${isColdStart ? '🥶 COLD START' : '🔥 WARM'}`);
    }

    // Extract URLs from the FileOutput objects
    const generatedUrls: string[] = [];
    const processItem = (item: any) => {
      if (item && typeof item.url === "function") {
        return item.url().href;
      } else if (typeof item === "string") {
        return item;
      }
      return null;
    };

    if (Array.isArray(output)) {
      for (const item of output) {
        const url = processItem(item);
        if (url) generatedUrls.push(url);
      }
    } else {
      const url = processItem(output);
      if (url) generatedUrls.push(url);
    }

    if (generatedUrls.length === 0) throw new Error("No output received");

    const minioUrls = await uploadImages(generatedUrls);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({ template: "supabase" });
            const headers = new Headers(options.headers);
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return fetch(url, { ...options, headers });
          },
        },
      }
    );


    const insertPayload = minioUrls.map((url) => ({
      url,
      imageprompt: prompt,
      user_id: userId,
    }));
    const { error: dbError } = await supabase
      .from("images")
      .insert(insertPayload);
    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    return NextResponse.json(minioUrls);
  } catch (error) {
    console.error("Replicate route error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate image";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json({ error: "Generation timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
