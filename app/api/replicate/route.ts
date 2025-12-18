import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL = "mainframeai/rddt-finetune-dec-2025:9620255525bcbad26f909dd62b2820aaae39aa99d0d9de5933c4a39465c6ff83";
const NEGATIVE_PROMPT =
  "duplicate sinks, double faucets, extra taps, floating lamps, disembodied lighting, distorted structure, warped cabinetry, incorrect perspective";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await getAuth(req);
  if (!userId) {
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
    console.log("Received prompt:", prompt);

    const output = await replicate.run(MODEL, {
      input: {
        prompt: prompt.trim(),
        go_fast: true,
        guidance: 3,
        strength: 0.9,
        image_size: "optimize_for_quality",
        lora_scale: 1,
        aspect_ratio: "16:9",
        output_format: "webp",
        enhance_prompt: true,
        output_quality: 80,
        negative_prompt: NEGATIVE_PROMPT,
        num_inference_steps: 30,
      },
    });

    // Extract URLs from the FileOutput objects
    const generatedUrls: string[] = [];
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item && typeof item.url === "function") {
          // .url() returns a URL object, convert to string
          generatedUrls.push(item.url().href);
        } else if (typeof item === "string") {
          generatedUrls.push(item);
        }
      }
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

    const insertPayload = minioUrls.map((url) => ({ url, imageprompt: prompt }));
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
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
