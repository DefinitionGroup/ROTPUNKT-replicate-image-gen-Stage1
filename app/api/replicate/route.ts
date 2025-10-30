import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL = "black-forest-labs/flux-1.1-pro-ultra-finetuned";
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

    const prediction = await replicate.predictions.create({
      model: MODEL,
      input: {
        prompt: `RDTDOT ${prompt.trim()}`,
        negative_prompt: NEGATIVE_PROMPT,
        finetune_id: "ef2a1a03-c2d2-4b23-bd94-ae0cf1609f0f",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 80,
      },
    });

    if ((prediction as any)?.error) {
      throw new Error("Prediction failed");
    }

    const result = await replicate.wait(prediction);
    const out = (result as any)?.output as string | string[] | null | undefined;
    const generatedUrls = Array.isArray(out) ? out : out ? [out] : [];
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

    const insertPayload = minioUrls.map((url) => ({ url }));
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
