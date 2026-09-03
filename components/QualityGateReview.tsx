"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  setHumanVerdict,
  type HumanVerdict,
  type ValidationAttemptRow,
} from "@/lib/actions/qualityGate";
import AiGeneratedLabel from "@/components/AiGeneratedLabel";

const VERDICT_STYLES: Record<string, string> = {
  pass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  fail: "bg-brand-primary-2/15 text-brand-primary-2",
  uncertain: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  error: "bg-muted text-muted-foreground",
  pending: "bg-muted text-muted-foreground",
};

function formatDate(value: string | null) {
  if (!value) return "–";
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function QualityGateReview({
  attempts,
}: {
  attempts: ValidationAttemptRow[];
}) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Noch keine Validator-Urteile. Setze <code>QUALITY_GATE_MODE=shadow</code>{" "}
        und erzeuge ein Bild.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {attempts.map((attempt) => (
        <AttemptCard key={attempt.id} attempt={attempt} />
      ))}
    </ul>
  );
}

function AttemptCard({ attempt }: { attempt: ValidationAttemptRow }) {
  const [humanVerdict, setLocalVerdict] = useState<HumanVerdict | null>(
    attempt.human_verdict
  );
  const [note, setNote] = useState(attempt.human_note ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const verdict = attempt.verdict ?? "pending";
  const checks = attempt.report?.checks ?? {};
  const hardChecks = new Set(attempt.report?.hardChecks ?? []);

  const save = (next: HumanVerdict | null) => {
    setSaveError(null);
    startTransition(async () => {
      try {
        const saved = await setHumanVerdict({
          attemptId: attempt.id,
          verdict: next,
          note,
        });
        setLocalVerdict(saved.human_verdict);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Speichern fehlgeschlagen");
      }
    });
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-0 md:grid-cols-[320px_1fr]">
        <div className="relative aspect-video bg-muted md:aspect-auto md:min-h-[220px]">
          {attempt.candidate_url ? (
            <Image
              src={attempt.candidate_url}
              alt={`Kandidat ${attempt.candidate_index} aus Satz ${attempt.generation_set_id}`}
              fill
              unoptimized
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Kein Bild
            </div>
          )}
          <AiGeneratedLabel className="pointer-events-none absolute bottom-2 left-2" />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] ${VERDICT_STYLES[verdict] ?? VERDICT_STYLES.pending}`}
            >
              {verdict}
            </span>
            {attempt.confidence !== null && (
              <span className="text-xs text-muted-foreground">
                Konfidenz {Math.round(Number(attempt.confidence) * 100)}%
              </span>
            )}
            {attempt.report?.modelVerdict &&
              attempt.report.modelVerdict !== attempt.verdict && (
                <span className="text-xs text-muted-foreground">
                  Modell sagte „{attempt.report.modelVerdict}“
                </span>
              )}
            <span className="ml-auto text-xs text-muted-foreground">
              {formatDate(attempt.created_at)}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
            <Meta label="Seed" value={String(attempt.seed)} />
            <Meta label="Prompt" value={attempt.prompt_version} />
            <Meta label="Validator" value={attempt.validator_model} />
            <Meta
              label="Dauer"
              value={attempt.duration_ms ? `${(attempt.duration_ms / 1000).toFixed(1)} s` : "–"}
            />
          </dl>

          {Object.keys(checks).length > 0 && (
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-1 font-medium">Prüfung</th>
                  <th className="pb-1 font-medium">Erwartet</th>
                  <th className="pb-1 font-medium">Gesehen</th>
                  <th className="pb-1 font-medium">Ergebnis</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(checks).map(([id, check]) => (
                  <tr key={id} className="border-t border-border/60 align-top">
                    <td className="py-1.5 pr-2 font-medium text-foreground">
                      {id}
                      {hardChecks.has(id) && (
                        <span className="ml-1 text-[9px] uppercase text-muted-foreground">
                          hard
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {String(check.expected ?? "–")}
                    </td>
                    <td className="py-1.5 pr-2 text-foreground">
                      {check.observed === null ? "–" : String(check.observed)}
                    </td>
                    <td className="py-1.5">
                      <span
                        className={
                          check.passed === true
                            ? "text-emerald-600 dark:text-emerald-400"
                            : check.passed === false
                              ? "text-brand-primary-2"
                              : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        {check.passed === true
                          ? "ok"
                          : check.passed === false
                            ? "fehlt"
                            : "unklar"}
                      </span>
                      {check.note && (
                        <span className="block text-muted-foreground">{check.note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(attempt.report?.fixtures?.length ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Inventar: </span>
              {attempt.report?.fixtures
                ?.map((f) => `${f.type}${f.position ? ` (${f.position})` : ""}`)
                .join(" · ")}
            </p>
          )}

          {attempt.reasons.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-foreground">
              {attempt.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          )}

          {attempt.error && (
            <p className="text-xs text-brand-primary-2">Fehler: {attempt.error}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">Urteil ist …</span>
            <ReviewButton
              active={humanVerdict === "validator_correct"}
              disabled={isPending}
              onClick={() => save(humanVerdict === "validator_correct" ? null : "validator_correct")}
            >
              richtig
            </ReviewButton>
            <ReviewButton
              active={humanVerdict === "validator_wrong"}
              disabled={isPending}
              onClick={() => save(humanVerdict === "validator_wrong" ? null : "validator_wrong")}
            >
              falsch
            </ReviewButton>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              onBlur={() => humanVerdict && save(humanVerdict)}
              placeholder="Notiz (z. B. „zweite Armatur am Kochfeld übersehen“)"
              maxLength={500}
              className="min-w-[200px] flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
            />
            {isPending && <span className="text-xs text-muted-foreground">speichert …</span>}
            {saveError && <span className="text-xs text-brand-primary-2">{saveError}</span>}
          </div>
        </div>
      </div>
    </li>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline text-foreground">{value}</dd>
    </div>
  );
}

function ReviewButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand-primary-2 bg-brand-primary-2 text-white"
          : "border-border bg-background text-foreground hover:bg-muted"
      } disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
