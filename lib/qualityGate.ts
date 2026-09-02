import { createSupabaseServiceClient } from "./supabaseServer";
import type {
  GenerationCandidate,
  GenerationQualityExpectations,
  GenerationVariantContext,
} from "./imageGenerationContract";
import {
  VALIDATOR_PROMPT_VERSION,
  resolveValidatorModel,
  runVisionValidator,
} from "./visionValidator";

export type QualityGateMode = "off" | "shadow" | "enforce";

let warnedAboutEnforce = false;

export function getQualityGateMode(): QualityGateMode {
  const raw = (process.env.QUALITY_GATE_MODE ?? "off").trim().toLowerCase();
  if (raw === "shadow") return "shadow";
  if (raw === "enforce") {
    if (!warnedAboutEnforce) {
      console.warn(
        "[quality-gate] QUALITY_GATE_MODE=enforce is not implemented yet; validating in shadow mode"
      );
      warnedAboutEnforce = true;
    }
    return "enforce";
  }
  return "off";
}

export type ShadowValidationOutcome =
  | { status: "skipped"; reason: "already_claimed" | "claim_failed" }
  | { status: "completed"; attemptId: string; verdict: string }
  | { status: "error"; attemptId: string; error: string };

type ShadowValidationParams = {
  mode: Exclude<QualityGateMode, "off">;
  requestId?: string;
  set: { id: string; userId: string; seed: number; promptVersion: string };
  variant: GenerationVariantContext;
  candidate: GenerationCandidate;
  qualityExpectations: GenerationQualityExpectations;
  attemptNumber?: number;
};

/**
 * Claims the attempt row first so concurrent status polls cannot validate the
 * same candidate twice, then records the verdict. Never throws: a failed
 * validation is a recorded "error" verdict, not a failed request.
 */
export async function runShadowValidation(
  params: ShadowValidationParams
): Promise<ShadowValidationOutcome> {
  const {
    mode,
    requestId = "bg",
    set,
    variant,
    candidate,
    qualityExpectations,
    attemptNumber = 1,
  } = params;
  const supabase = createSupabaseServiceClient();
  const model = resolveValidatorModel();

  const { data: claimed, error: claimError } = await supabase
    .from("generation_validation_attempts")
    .insert({
      generation_set_id: set.id,
      image_id: candidate.imageId,
      user_id: set.userId,
      attempt_number: attemptNumber,
      candidate_index: variant.candidateIndex,
      seed: set.seed,
      prediction_id: variant.predictionId,
      candidate_url: candidate.url,
      gate_mode: mode,
      prompt_version: set.promptVersion,
      validator_model: model,
      validator_prompt_version: VALIDATOR_PROMPT_VERSION,
      quality_expectations: qualityExpectations,
    })
    .select("id")
    .single();

  if (claimError || !claimed) {
    if (claimError?.code === "23505") {
      return { status: "skipped", reason: "already_claimed" };
    }
    console.error(
      `[${requestId}] quality-gate claim failed for set ${set.id}:`,
      claimError?.message
    );
    return { status: "skipped", reason: "claim_failed" };
  }

  const attemptId = claimed.id as string;

  try {
    const { report, durationMs } = await runVisionValidator({
      imageUrl: candidate.url,
      expectations: qualityExpectations,
      model,
    });

    const { error: updateError } = await supabase
      .from("generation_validation_attempts")
      .update({
        verdict: report.verdict,
        confidence: report.confidence,
        report: {
          modelVerdict: report.modelVerdict,
          checks: report.checks,
          hardChecks: report.hardChecks,
          rawText: report.rawText,
        },
        reasons: report.reasons,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (updateError) {
      throw new Error(`Attempt update failed: ${updateError.message}`);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${requestId}] quality-gate ${mode}: set ${set.id} -> ${report.verdict} (${model}, ${durationMs}ms)`
      );
    }
    return { status: "completed", attemptId, verdict: report.verdict };
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
      .eq("id", attemptId);
    return { status: "error", attemptId, error: message };
  }
}
