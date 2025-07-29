import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { prompt, model = "black-forest-labs/flux-1.1-pro-ultra-finetuned" } =
      await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    console.log("Received prompt:", prompt);
    // Add RDTDOT activation keyword to the prompt
    const enhancedPrompt = `RDTDOT ${prompt}`;

    console.log("Starting Replicate generation...");

    const prediction = await replicate.predictions.create({
      model: model,
      input: {
        prompt: enhancedPrompt,
        finetune_id: "ef2a1a03-c2d2-4b23-bd94-ae0cf1609f0f",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 80,
      },
    });

    console.log("Prediction created:", prediction.id);

    // Wait for the prediction to complete
    let finalPrediction = prediction;
    while (
      finalPrediction.status !== "succeeded" &&
      finalPrediction.status !== "failed"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
      console.log("Prediction status:", finalPrediction.status);
    }

    if (finalPrediction.status === "failed") {
      throw new Error("Prediction failed: " + finalPrediction.error);
    }

    console.log("Final prediction output:", finalPrediction.output);
    return NextResponse.json({ output: finalPrediction.output });
  } catch (error) {
    console.error("Replicate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
