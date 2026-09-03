import { NextRequest, NextResponse, after } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createSupabaseUserClient } from "@/lib/supabaseServer";
import {
  attachImageToAttempt,
  getQualityGateMode,
  isQualityGateFailOpen,
  readValidationAttempt,
  runEnforceValidation,
  runShadowValidation,
  type QualityGateMode,
} from "@/lib/qualityGate";
import { resolveValidatorModel } from "@/lib/visionValidator";
import {
  isGenerationQualityExpectations,
  isGenerationVariantManifest,
  type CandidateQualityStatus,
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
  generation_metadata?: unknown;
};

type GateConfig = {
  mode: QualityGateMode;
  validatorModel: string;
  failOpen: boolean;
};

const CANDIDATE_COLUMNS =
  "id, url, generation_set_id, candidate_index, lora_scale, is_selected_best, generation_metadata";

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
  const stored = (row.generation_metadata as { qualityStatus?: unknown } | null)
    ?.qualityStatus;
  const status: CandidateQualityStatus =
    stored === "accepted" || stored === "rejected" ? stored : "not_evaluated";
  return {
    imageId: row.id,
    generationSetId: row.generation_set_id,
    index: row.candidate_index,
    url: row.url,
    loraScale: Number(row.lora_scale) as GenerationCandidate["loraScale"],
    isSelectedBest: row.is_selected_best,
    quality: {
      status,
      reasons: [],
    },
  };
}

async function getExistingCandidate(
  supabase: ReturnType<typeof createSupabaseUserClient>,
  setId: string,
  userId: string,
  candidateIndex: number
): Promise<GenerationCandidate | null> {
  const { data, error } = await supabase
    .from("images")
    .select(CANDIDATE_COLUMNS)
    .eq("generation_set_id", setId)
    .eq("candidate_index", candidateIndex)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Candidate lookup failed: ${error.message}`);
  return data ? toCandidate(data as CandidateRow) : null;
}

async function finalizeVariant(params: {
  supabase: ReturnType<typeof createSupabaseUserClient>;
  set: GenerationSetRow;
  variant: GenerationVariantContext;
  userId: string;
  qualityExpectations: GenerationQualityExpectations | null;
  requestId: string;
  gate: GateConfig;
  // Fires once per candidate, only from the poll that actually inserted it.
  onCandidatePersisted?: (
    candidate: GenerationCandidate,
    variant: GenerationVariantContext
  ) => void;
}): Promise<VariantResult> {
  const { supabase, set, variant, userId, qualityExpectations, requestId, gate } =
    params;
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

  // Enforce mode: the candidate is validated before it becomes an image row.
  // The poll that finds no attempt claims it and validates in the background;
  // later polls read the verdict.
  let qualityStatus: CandidateQualityStatus = "not_evaluated";
  let attemptId: string | null = null;
  const enforce = gate.mode === "enforce" && qualityExpectations !== null;
  if (enforce && qualityExpectations) {
    const attempt = await readValidationAttempt(
      set.id,
      variant.candidateIndex,
      gate.validatorModel
    );
    if (!attempt) {
      const candidateUrl = finalUrl;
      after(async () => {
        try {
          await runEnforceValidation({
            requestId,
            set: {
              id: set.id,
              userId,
              seed: Number(set.seed),
              promptVersion: set.prompt_version,
            },
            variant,
            candidateUrl,
            qualityExpectations,
            model: gate.validatorModel,
          });
        } catch (validationError) {
          console.error(
            `[${requestId}] quality-gate enforce task crashed:`,
            validationError
          );
        }
      });
      return { status: "validating" };
    }
    if (attempt.verdict === null) return { status: "validating" };
    if (attempt.verdict === "pass") {
      qualityStatus = "accepted";
      attemptId = attempt.id;
    } else if (attempt.verdict === "error" && gate.failOpen) {
      console.warn(
        `[${requestId}] quality-gate: validator error on set ${set.id}, delivering unevaluated (fail-open)`
      );
      attemptId = attempt.id;
    } else {
      return {
        status: "rejected",
        error:
          attempt.reasons.join("; ") ||
          attempt.error ||
          `Validator verdict: ${attempt.verdict}`,
      };
    }
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
        seed: variant.seed ?? Number(set.seed),
        modelVersion: set.model_version,
        guidanceScale: Number(set.guidance_scale),
        loraScale: variant.loraScale,
        numInferenceSteps: set.num_inference_steps,
        predictionId: variant.predictionId,
        qualityStatus,
        qualityExpectations,
      },
    })
    .select(CANDIDATE_COLUMNS)
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

  const candidate = toCandidate(data as CandidateRow);
  if (attemptId) await attachImageToAttempt(attemptId, candidate.imageId);
  if (!enforce) params.onCandidatePersisted?.(candidate, variant);
  return { status: "succeeded", candidate };
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { userId, getToken } = await getAuth(req);
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

    const supabase = createSupabaseUserClient(() =>
      getToken({ template: "supabase" })
    );
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

    // Shadow mode: validate after the response is sent so delivery is not
    // delayed; the attempt row's unique index keeps it to one run per candidate.
    const gate: GateConfig = {
      mode: getQualityGateMode(),
      validatorModel: resolveValidatorModel(),
      failOpen: isQualityGateFailOpen(),
    };
    const scheduleValidation =
      gate.mode === "shadow" && qualityExpectations
        ? (candidate: GenerationCandidate, variant: GenerationVariantContext) => {
            after(async () => {
              try {
                await runShadowValidation({
                  mode: "shadow",
                  requestId,
                  set: {
                    id: set.id,
                    userId,
                    seed: Number(set.seed),
                    promptVersion: set.prompt_version,
                  },
                  variant,
                  candidate,
                  qualityExpectations,
                });
              } catch (validationError) {
                console.error(
                  `[${requestId}] quality-gate background task crashed:`,
                  validationError
                );
              }
            });
          }
        : undefined;

    const results = await Promise.all(
      set.prediction_manifest.map((variant) =>
        finalizeVariant({
          supabase,
          set,
          variant,
          userId,
          qualityExpectations,
          requestId,
          gate,
          onCandidatePersisted: scheduleValidation,
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
    const hasValidating = results.some(
      (result) => result.status === "validating"
    );
    const hasFailure = results.some(
      (result) =>
        result.status === "failed" || result.status === "canceled"
    );
    const rejectedCount = results.filter(
      (result) => result.status === "rejected"
    ).length;
    const enforce = gate.mode === "enforce" && qualityExpectations !== null;

    let status: GenerationSetStatus;
    if (enforce) {
      // One accepted candidate is enough; everything else only costs money.
      status =
        candidates.length > 0
          ? "succeeded"
          : hasRunning || hasValidating
            ? "processing"
            : "failed";
      if (status === "succeeded") {
        const stillRunning = set.prediction_manifest.filter((_, index) => {
          const s = results[index]?.status;
          return s === "starting" || s === "processing";
        });
        if (stillRunning.length > 0) {
          void Promise.allSettled(
            stillRunning.map((variant) =>
              replicate.predictions.cancel(variant.predictionId)
            )
          );
        }
      }
    } else {
      status = allSucceeded
        ? "succeeded"
        : hasRunning
          ? "processing"
          : hasFailure && candidates.length > 0
            ? "partial_failed"
            : "failed";
    }
    const qualityFailure = enforce && status === "failed" && rejectedCount > 0;
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
        `[${requestId}] Set ${generationSetId}: ${status}, ${candidates.length}/${set.prediction_manifest.length} candidates persisted`
      );
    }

    return NextResponse.json({
      generationSetId,
      status,
      phase:
        candidates.length === 0 && hasValidating && !hasRunning
          ? "validating"
          : "generating",
      gateMode: gate.mode,
      qualityFailure,
      rejectedCount,
      candidates,
      selectedImageId: set.selected_image_id,
      qualityExpectations,
      error: errors.length > 0 ? errors.join("; ") : null,
    });
  } catch (error) {
    console.error("Replicate generation status route error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check generation status";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json(
        { error: "Status check timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to check generation status" },
      { status: 500 }
    );
  }
}
