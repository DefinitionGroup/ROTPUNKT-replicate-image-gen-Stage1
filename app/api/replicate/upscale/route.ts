import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const UPSCALE_TIMEOUT_MS = 300_000;

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

const UPSCALE_MODEL = "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  if (isDev) console.log(`[${requestId}] 🚀 New upscale request received`);

  const { userId, getToken } = await getAuth(req);
  if (!userId) {
    if (isDev) console.log(`[${requestId}] ❌ Unauthorized`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDev) console.log(`[${requestId}] 👤 User: ${userId}`);

  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }
    if (isDev) console.log(`[${requestId}] 🖼️ Upscaling image: ${imageUrl.slice(0, 50)}...`);

    const startTime = Date.now();
    const output = await withTimeout(replicate.run(UPSCALE_MODEL, {
      input: {
        seed: 1337,
        image: imageUrl,
        prompt: prompt || "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
        dynamic: 6,
        handfix: "disabled",
        pattern: false,
        sharpen: 0,
        sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        scheduler: "DPM++ 3M SDE Karras",
        creativity: 0.35,
        lora_links: "",
        downscaling: false,
        resemblance: 0.6,
        scale_factor: 2,
        tiling_width: 112,
        output_format: "png",
        tiling_height: 144,
        custom_sd_model: "",
        negative_prompt: "(text-elements, typography, worst quality, low quality, normal quality:2) JuggernautNegative-neg",
        num_inference_steps: 18,
        downscaling_resolution: 768
      },
    }), UPSCALE_TIMEOUT_MS, "Replicate upscale");
    const totalTime = Date.now() - startTime;

    // Cold start typically > 20s, warm < 10s
    const isColdStart = totalTime > 20000;
    if (isDev) {
      console.log(`[${requestId}] ⏱️ Replicate upscale took ${(totalTime / 1000).toFixed(1)}s — ${isColdStart ? '🥶 COLD START' : '🔥 WARM'}`);
    }

    // Extract URLs from the FileOutput objects
    const generatedUrls: string[] = [];
    const processItem = (item: unknown) => {
      if (item && typeof item === "object" && "url" in item && typeof (item as { url: () => { href: string } }).url === "function") {
        return (item as { url: () => { href: string } }).url().href;
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

    if (generatedUrls.length === 0) throw new Error("No output received from upscaler");

    // Upload to MinIO with "upscaled-" prefix
    const minioUrls = await uploadImages(generatedUrls);

    // Save to Supabase with is_upscaled flag
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
      imageprompt: prompt || "High-res upscaled version",
      is_upscaled: true,
      original_image_url: imageUrl,
      user_id: userId,
    }));

    const { error: dbError } = await supabase
      .from("images")
      .insert(insertPayload);

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      // Don't fail the request if DB insert fails - user still gets the image
      console.warn(`[${requestId}] ⚠️ DB insert failed but continuing with response`);
    }

    if (isDev) console.log(`[${requestId}] ✅ Upscale complete, returning ${minioUrls.length} URLs`);
    return NextResponse.json(minioUrls);
  } catch (error) {
    console.error("Upscale route error:", error);
    const message = error instanceof Error ? error.message : "Failed to upscale image";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json({ error: "Upscale timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to upscale image" }, { status: 500 });
  }
}
