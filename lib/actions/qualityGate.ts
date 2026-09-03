"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServer";
import type { ValidatorCheck, ValidatorFixture } from "@/lib/visionValidator";

export type HumanVerdict = "validator_correct" | "validator_wrong";

export type ValidationAttemptRow = {
  id: string;
  generation_set_id: string;
  image_id: string | null;
  user_id: string;
  attempt_number: number;
  candidate_index: number;
  seed: number;
  prediction_id: string;
  candidate_url: string | null;
  gate_mode: "shadow" | "enforce";
  prompt_version: string;
  validator_model: string;
  validator_prompt_version: string;
  quality_expectations: unknown;
  verdict: "pass" | "fail" | "uncertain" | "error" | null;
  confidence: number | null;
  report: {
    modelVerdict?: string | null;
    fixtures?: ValidatorFixture[];
    checks?: Record<string, ValidatorCheck>;
    hardChecks?: string[];
    rawText?: string;
  } | null;
  reasons: string[];
  duration_ms: number | null;
  error: string | null;
  human_verdict: HumanVerdict | null;
  human_note: string | null;
  human_reviewed_by: string | null;
  human_reviewed_at: string | null;
  claimed_at: string;
  completed_at: string | null;
  created_at: string;
};

const ATTEMPT_COLUMNS =
  "id, generation_set_id, image_id, user_id, attempt_number, candidate_index, seed, prediction_id, candidate_url, gate_mode, prompt_version, validator_model, validator_prompt_version, quality_expectations, verdict, confidence, report, reasons, duration_ms, error, human_verdict, human_note, human_reviewed_by, human_reviewed_at, claimed_at, completed_at, created_at";

function isQualityGateAdmin(userId: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const allowlist = (process.env.QUALITY_GATE_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowlist.includes(userId);
}

export async function requireQualityGateAdmin(): Promise<
  { userId: string; isAdmin: true } | { userId: string | null; isAdmin: false }
> {
  const { userId } = await auth();
  if (!userId) return { userId: null, isAdmin: false };
  return isQualityGateAdmin(userId)
    ? { userId, isAdmin: true }
    : { userId, isAdmin: false };
}

export async function listValidationAttempts(
  limit = 60
): Promise<ValidationAttemptRow[]> {
  const access = await requireQualityGateAdmin();
  if (!access.isAdmin) throw new Error("Unauthorized");

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("generation_validation_attempts")
    .select(ATTEMPT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 200));

  if (error) {
    // PGRST205: PostgREST does not know the table -> migration not applied yet.
    if (error.code === "PGRST205") {
      throw new Error("MIGRATION_MISSING");
    }
    console.error("Error listing validation attempts:", error.message);
    throw new Error("Failed to load validation attempts");
  }
  return (data ?? []) as unknown as ValidationAttemptRow[];
}

export async function setHumanVerdict(params: {
  attemptId: string;
  verdict: HumanVerdict | null;
  note?: string;
}): Promise<Pick<ValidationAttemptRow, "id" | "human_verdict" | "human_note" | "human_reviewed_at">> {
  const access = await requireQualityGateAdmin();
  if (!access.isAdmin) throw new Error("Unauthorized");

  const supabase = createSupabaseServiceClient();
  const reviewedAt = params.verdict ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("generation_validation_attempts")
    .update({
      human_verdict: params.verdict,
      human_note: params.note?.trim().slice(0, 500) || null,
      human_reviewed_by: params.verdict ? access.userId : null,
      human_reviewed_at: reviewedAt,
    })
    .eq("id", params.attemptId)
    .select("id, human_verdict, human_note, human_reviewed_at")
    .single();

  if (error || !data) {
    console.error("Error saving human verdict:", error?.message);
    throw new Error("Failed to save review");
  }
  return data as Pick<
    ValidationAttemptRow,
    "id" | "human_verdict" | "human_note" | "human_reviewed_at"
  >;
}
