import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import {
  isGenerationQualityExpectations,
  isGenerationVariantManifest,
  type GenerationCandidate,
  type GenerationQualityExpectations,
  type GenerationSetStatus,
  type GenerationVariantContext,
} from "@/lib/imageGenerationContract";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const STATUS_TIMEOUT_MS = 20_000;

type GenerationSetRow = {
  id: string;
  user_id: string;
  prompt: string;
  prompt_version: string;
  seed: number;
  model_version: string;
  guidance_scale: number;
  num_inference_steps: number;
  quality_expectations: unknown;
  prediction_manifest: unknown;
  selected_image_id: string | null;
};

type CandidateRow = {
  id: string;
  url: string;
  generation_set_id: string;
  candidate_index: number;
  lora_scale: number;
  is_selected_best: boolean;
};

type VariantResult = {
  status: string;
  candidate?: GenerationCandidate;
  error?: string;
};

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

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service role is not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function extractUrls(output: unknown): string[] {
  const urls: string[] = [];
  const processItem = (item: unknown) => {
    if (typeof item === "string") {
      urls.push(item);
      return;
    }
    if (!item || typeof item !== "object" || !("url" in item)) return;
    const maybeUrlFn = (item as { url?: unknown }).url;
    if (typeof maybeUrlFn !== "function") return;
    const result = maybeUrlFn.call(item);
    if (result && typeof result === "object" && "href" in result) {
      const href = (result as { href?: unknown }).href;
      if (typeof href === "string") urls.push(href);
    }
  };

  if (Array.isArray(output)) output.forEach(processItem);
  else processItem(output);
  return urls;
}

function toErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Generation failed";
}

function toCandidate(row: CandidateRow): GenerationCandidate {
  return {
    imageId: row.id,
    generationSetId: row.generation_set_id,
    index: row.candidate_index,
    url: row.url,
    loraScale: Number(row.lora_scale) as GenerationCandidate["loraScale"],
    isSelectedBest: row.is_selected_best,
    quality: {
      status: "not_evaluated",
      reasons: [],
    },
  };
}

async function getExistingCandidate(
  supabase: ReturnType<typeof getServiceClient>,
  setId: string,
  userId: string,
  candidateIndex: number
): Promise<GenerationCandidate | null> {
  const { data, error } = await supabase
    .from("images")
    .select(
      "id, url, generation_set_id, candidate_index, lora_scale, is_selected_best"
    )
    .eq("generation_set_id", setId)
    .eq("candidate_index", candidateIndex)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Candidate lookup failed: ${error.message}`);
  return data ? toCandidate(data as CandidateRow) : null;
}

async function finalizeVariant(params: {
  supabase: ReturnType<typeof getServiceClient>;
  set: GenerationSetRow;
  variant: GenerationVariantContext;
  userId: string;
  qualityExpectations: GenerationQualityExpectations | null;
}): Promise<VariantResult> {
  const { supabase, set, variant, userId, qualityExpectations } = params;
  const existing = await getExistingCandidate(
    supabase,
    set.id,
    userId,
    variant.candidateIndex
  );
  if (existing) return { status: "succeeded", candidate: existing };

  const prediction = await withTimeout(
    replicate.predictions.get(variant.predictionId),
    STATUS_TIMEOUT_MS,
    `Replicate status check for variant ${variant.candidateIndex}`
  );
  const status = prediction.status ?? "starting";
  if (status !== "succeeded") {
    return {
      status,
      error:
        status === "failed" || status === "canceled"
          ? toErrorMessage(prediction.error)
          : undefined,
    };
  }

  const [generatedUrl] = extractUrls(prediction.output);
  if (!generatedUrl) {
    return { status: "failed", error: "No output received" };
  }

  let finalUrl = generatedUrl;
  try {
    const [uploadedUrl] = await uploadImages([generatedUrl], {
      deterministicPrefix: `set-${set.id}-variant-${variant.candidateIndex}`,
    });
    if (uploadedUrl) finalUrl = uploadedUrl;
  } catch (storageError) {
    console.error(
      `MinIO upload failed for set ${set.id}, variant ${variant.candidateIndex}:`,
      storageError
    );
  }

  const { data, error } = await supabase
    .from("images")
    .insert({
      url: finalUrl,
      imageprompt: set.prompt,
      user_id: userId,
      generation_set_id: set.id,
      lora_scale: variant.loraScale,
      candidate_index: variant.candidateIndex,
      generation_metadata: {
        promptVersion: set.prompt_version,
        seed: Number(set.seed),
        modelVersion: set.model_version,
        guidanceScale: Number(set.guidance_scale),
        loraScale: variant.loraScale,
        numInferenceSteps: set.num_inference_steps,
        predictionId: variant.predictionId,
        qualityStatus: "not_evaluated",
        qualityExpectations,
      },
    })
    .select(
      "id, url, generation_set_id, candidate_index, lora_scale, is_selected_best"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      const concurrentCandidate = await getExistingCandidate(
        supabase,
        set.id,
        userId,
        variant.candidateIndex
      );
      if (concurrentCandidate) {
        return { status: "succeeded", candidate: concurrentCandidate };
      }
    }
    return { status: "failed", error: `Image insert failed: ${error.message}` };
  }

  return { status: "succeeded", candidate: toCandidate(data as CandidateRow) };
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { userId } = await getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { generationSetId } = await req.json();
    if (!generationSetId || typeof generationSetId !== "string") {
      return NextResponse.json(
        { error: "generationSetId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { data, error: setError } = await supabase
      .from("generation_sets")
      .select(
        "id, user_id, prompt, prompt_version, seed, model_version, guidance_scale, num_inference_steps, quality_expectations, prediction_manifest, selected_image_id"
      )
      .eq("id", generationSetId)
      .eq("user_id", userId)
      .maybeSingle();

    if (setError) {
      throw new Error(`Generation set lookup failed: ${setError.message}`);
    }
    if (!data) {
      return NextResponse.json(
        { error: "Generation set not found" },
        { status: 404 }
      );
    }

    const set = data as GenerationSetRow;
    if (!isGenerationVariantManifest(set.prediction_manifest)) {
      throw new Error("Generation set has an invalid prediction manifest");
    }
    const qualityExpectations = isGenerationQualityExpectations(
      set.quality_expectations
    )
      ? set.quality_expectations
      : null;

    const results = await Promise.all(
      set.prediction_manifest.map((variant) =>
        finalizeVariant({
          supabase,
          set,
          variant,
          userId,
          qualityExpectations,
        })
      )
    );
    const candidates = results
      .flatMap((result) => (result.candidate ? [result.candidate] : []))
      .sort((a, b) => a.index - b.index);
    const allSucceeded = results.every(
      (result) => result.status === "succeeded"
    );
    const hasRunning = results.some(
      (result) =>
        result.status === "starting" || result.status === "processing"
    );
    const hasFailure = results.some(
      (result) =>
        result.status === "failed" || result.status === "canceled"
    );
    const status: GenerationSetStatus = allSucceeded
      ? "succeeded"
      : hasRunning
        ? "processing"
        : hasFailure && candidates.length > 0
          ? "partial_failed"
          : "failed";
    const errors = results.flatMap((result) =>
      result.error ? [result.error] : []
    );

    await supabase
      .from("generation_sets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", generationSetId)
      .eq("user_id", userId);

    if (isDev) {
      console.log(
        `[${requestId}] Set ${generationSetId}: ${status}, ${candidates.length}/3 candidates persisted`
      );
    }

    return NextResponse.json({
      generationSetId,
      status,
      candidates,
      selectedImageId: set.selected_image_id,
      qualityExpectations,
      error: errors.length > 0 ? errors.join("; ") : null,
    });
  } catch (error) {
    console.error("Replicate comparison status route error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check generation status";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json(
        { error: "Status check timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to check comparison status" },
      { status: 500 }
    );
  }
}
