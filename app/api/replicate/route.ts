import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { prompt, model = "black-forest-labs/flux-1.1-pro-ultra-finetuned" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Add RDTDOT activation keyword to the prompt
    const enhancedPrompt = `RDTDOT ${prompt}`;

    const output = await replicate.run(
      model as `${string}/${string}:${string}`,
      {
        input: {
          prompt: enhancedPrompt,
          finetune_id:"ef2a1a03-c2d2-4b23-bd94-ae0cf1609f0f",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 80
        }
      }
    );

    console.log("Replicate output:", output); // Debug log
    return NextResponse.json({ output });
  } catch (error) {
    console.error('Replicate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
