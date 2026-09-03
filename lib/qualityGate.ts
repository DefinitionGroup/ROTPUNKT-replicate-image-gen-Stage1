import { createSupabaseServiceClient } from "./supabaseServer";
import {
  MAX_PARALLEL_CANDIDATES,
  type GenerationCandidate,
  type GenerationQualityExpectations,
  type GenerationVariantContext,
} from "./imageGenerationContract";
import {
  VALIDATOR_PROMPT_VERSION,
  resolveValidatorModels,
  runVisionValidator,
} from "./visionValidator";

export type QualityGateMode = "off" | "shadow" | "enforce";

export function getQualityGateMode(): QualityGateMode {
  const raw = (process.env.QUALITY_GATE_MODE ?? "off").trim().toLowerCase();
  if (raw === "shadow") return "shadow";
  if (raw === "enforce") return "enforce";
  return "off";
}

/** Enforce mode generates this many candidates in parallel (1..3, default 2). */
export function getQualityGateCandidateCount(): number {
  const raw = Number.parseInt(process.env.QUALITY_GATE_CANDIDATES ?? "2", 10);
  if (!Number.isFinite(raw)) return 2;
  return Math.min(MAX_PARALLEL_CANDIDATES, Math.max(1, raw));
}

/**
 * When the validator itself fails (not the image), fail-open delivers the
 * image unevaluated instead of blocking every user on a validator outage.
 */
export function isQualityGateFailOpen(): boolean {
  const raw = (process.env.QUALITY_GATE_FAIL_OPEN ?? "true").trim().toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "off";
}

export type AttemptVerdict = "pass" | "fail" | "uncertain" | "error";

export type AttemptState = {
  id: string;
  verdict: AttemptVerdict | null;
  reasons: string[];
  error: string | null;
  imageId: string | null;
};

type ClaimParams = {
  mode: Exclude<QualityGateMode, "off">;
  set: { id: string; userId: string; seed: number; promptVersion: string };
  variant: GenerationVariantContext;
  candidateUrl: string;
  imageId: string | null;
  qualityExpectations: GenerationQualityExpectations;
  model: string;
  attemptNumber?: number;
};

export async function readValidationAttempt(
  setId: string,
  candidateIndex: number,
  model: string,
  attemptNumber = 1
): Promise<AttemptState | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("generation_validation_attempts")
    .select("id, verdict, reasons, error, image_id")
    .eq("generation_set_id", setId)
    .eq("candidate_index", candidateIndex)
    .eq("attempt_number", attemptNumber)
    .eq("validator_model", model)
    .maybeSingle();
  if (error) throw new Error(`Validation attempt lookup failed: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id as string,
    verdict: (data.verdict as AttemptVerdict | null) ?? null,
    reasons: (data.reasons as string[] | null) ?? [],
    error: (data.error as string | null) ?? null,
    imageId: (data.image_id as string | null) ?? null,
  };
}

/**
 * The claim: inserting the attempt row wins or loses on the unique index, so
 * only one poll ever pays for validating a given candidate with a given model.
 */
export async function claimValidationAttempt(
  params: ClaimParams
): Promise<{ claimed: true; attemptId: string } | { claimed: false; reason: "already_claimed" | "claim_failed" }> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("generation_validation_attempts")
    .insert({
      generation_set_id: params.set.id,
      image_id: params.imageId,
      user_id: params.set.userId,
      attempt_number: params.attemptNumber ?? 1,
      candidate_index: params.variant.candidateIndex,
      seed: params.variant.seed ?? params.set.seed,
      prediction_id: params.variant.predictionId,
      candidate_url: params.candidateUrl,
      gate_mode: params.mode,
      prompt_version: params.set.promptVersion,
      validator_model: params.model,
      validator_prompt_version: VALIDATOR_PROMPT_VERSION,
      quality_expectations: params.qualityExpectations,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return { claimed: false, reason: "already_claimed" };
    console.error(`quality-gate claim failed for set ${params.set.id}:`, error?.message);
    return { claimed: false, reason: "claim_failed" };
  }
  return { claimed: true, attemptId: data.id as string };
}

/** Runs the validator for a claimed attempt and records the outcome. Never throws. */
export async function completeValidationAttempt(params: {
  attemptId: string;
  model: string;
  imageUrl: string;
  qualityExpectations: GenerationQualityExpectations;
  requestId?: string;
}): Promise<AttemptVerdict> {
  const supabase = createSupabaseServiceClient();
  const requestId = params.requestId ?? "bg";
  try {
    const { report, durationMs } = await runVisionValidator({
      imageUrl: params.imageUrl,
      expectations: params.qualityExpectations,
      model: params.model,
    });
    const { error } = await supabase
      .from("generation_validation_attempts")
      .update({
        verdict: report.verdict,
        confidence: report.confidence,
        report: {
          modelVerdict: report.modelVerdict,
          fixtures: report.fixtures,
          checks: report.checks,
          hardChecks: report.hardChecks,
          rawText: report.rawText,
        },
        reasons: report.reasons,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", params.attemptId);
    if (error) throw new Error(`Attempt update failed: ${error.message}`);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${requestId}] quality-gate: attempt ${params.attemptId.slice(0, 8)} -> ${report.verdict} (${params.model}, ${durationMs}ms)`
      );
    }
    return report.verdict;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${requestId}] quality-gate validation failed:`, message);
    await supabase
      .from("generation_validation_attempts")
      .update({
        verdict: "error",
        error: message.slice(0, 1000),
        completed_at: new Date().toISOString(),
      })
      .eq("id", params.attemptId);
    return "error";
  }
}

export async function attachImageToAttempt(attemptId: string, imageId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase
    .from("generation_validation_attempts")
    .update({ image_id: imageId })
    .eq("id", attemptId);
}

export type ShadowValidationOutcome =
  | { status: "skipped"; reason: "already_claimed" | "claim_failed" }
  | { status: "completed"; attemptId: string; verdict: AttemptVerdict };

/**
 * Shadow mode: runs every configured model on an already delivered candidate
 * (in parallel) so the calibration set compares models on identical inputs.
 */
export async function runShadowValidation(params: {
  mode: Exclude<QualityGateMode, "off">;
  requestId?: string;
  set: { id: string; userId: string; seed: number; promptVersion: string };
  variant: GenerationVariantContext;
  candidate: GenerationCandidate;
  qualityExpectations: GenerationQualityExpectations;
}): Promise<ShadowValidationOutcome[]> {
  return Promise.all(
    resolveValidatorModels().map(async (model): Promise<ShadowValidationOutcome> => {
      const claim = await claimValidationAttempt({
        mode: params.mode,
        set: params.set,
        variant: params.variant,
        candidateUrl: params.candidate.url,
        imageId: params.candidate.imageId,
        qualityExpectations: params.qualityExpectations,
        model,
      });
      if (!claim.claimed) return { status: "skipped", reason: claim.reason };
      const verdict = await completeValidationAttempt({
        attemptId: claim.attemptId,
        model,
        imageUrl: params.candidate.url,
        qualityExpectations: params.qualityExpectations,
        requestId: params.requestId,
      });
      return { status: "completed", attemptId: claim.attemptId, verdict };
    })
  );
}

/**
 * Enforce mode: claims and validates a candidate that is not yet delivered.
 * Meant to run behind after(); the polling route reads the attempt row.
 */
export async function runEnforceValidation(params: {
  requestId?: string;
  set: { id: string; userId: string; seed: number; promptVersion: string };
  variant: GenerationVariantContext;
  candidateUrl: string;
  qualityExpectations: GenerationQualityExpectations;
  model: string;
}): Promise<ShadowValidationOutcome> {
  const claim = await claimValidationAttempt({
    mode: "enforce",
    set: params.set,
    variant: params.variant,
    candidateUrl: params.candidateUrl,
    imageId: null,
    qualityExpectations: params.qualityExpectations,
    model: params.model,
  });
  if (!claim.claimed) return { status: "skipped", reason: claim.reason };
  const verdict = await completeValidationAttempt({
    attemptId: claim.attemptId,
    model: params.model,
    imageUrl: params.candidateUrl,
    qualityExpectations: params.qualityExpectations,
    requestId: params.requestId,
  });
  return { status: "completed", attemptId: claim.attemptId, verdict };
}
