import { uploadImages } from "@/lib/minioClient";
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL = "black-forest-labs/flux-1.1-pro-ultra-finetuned"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    console.log("Received prompt:", prompt);

    const prediction = await replicate.predictions.create({
      model: MODEL,
      input: {
        prompt: `RDTDOT ${prompt}`, // Add RDTDOT activation keyword to the prompt
        finetune_id: "ef2a1a03-c2d2-4b23-bd94-ae0cf1609f0f",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 80,
      },
    });
    console.log("Prediction created:", prediction.id);

    if (prediction.error) throw new Error('Prediction failed')
    const result = await replicate.wait(prediction)
    const image: string | null = result.output
    if (!image) throw new Error('No output received')
    const imageOnMinio =await uploadImages([image])
    return NextResponse.json({ output: imageOnMinio });
  } catch (error) {
    console.error("Replicate API error:", error);

    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
