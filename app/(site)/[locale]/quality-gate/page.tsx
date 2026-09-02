import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import QualityGateReview from "@/components/QualityGateReview";
import {
  listValidationAttempts,
  requireQualityGateAdmin,
} from "@/lib/actions/qualityGate";
import { getQualityGateMode } from "@/lib/qualityGate";
import { resolveValidatorModel } from "@/lib/visionValidator";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function QualityGatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const access = await requireQualityGateAdmin();
  if (!access.userId) {
    redirect({ href: "/sign-in?redirect_url=/quality-gate", locale });
  }
  if (!access.isAdmin) {
    notFound();
  }

  const attempts = await listValidationAttempts(60);
  const counts = attempts.reduce<Record<string, number>>((acc, attempt) => {
    const key = attempt.verdict ?? "pending";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const reviewed = attempts.filter((a) => a.human_verdict).length;
  const wrong = attempts.filter((a) => a.human_verdict === "validator_wrong").length;

  return (
    <main className="mx-auto max-w-6xl px-6 pt-30 pb-16">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
          Qualitäts-Gate · intern
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Validator-Urteile prüfen
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Jede Generierung wird im Shadow Mode vom Vision-Validator bewertet, ohne
          die Auslieferung zu beeinflussen. Markiere hier, ob das Urteil stimmt –
          daraus entsteht der Testsatz für die Kalibrierung.
        </p>
        <dl className="mt-5 flex flex-wrap gap-3 text-xs">
          <Stat label="Modus" value={getQualityGateMode()} />
          <Stat label="Modell" value={resolveValidatorModel()} />
          <Stat label="Urteile" value={String(attempts.length)} />
          <Stat label="pass" value={String(counts.pass ?? 0)} />
          <Stat label="fail" value={String(counts.fail ?? 0)} />
          <Stat label="uncertain" value={String(counts.uncertain ?? 0)} />
          <Stat label="error" value={String(counts.error ?? 0)} />
          <Stat label="geprüft" value={`${reviewed} (${wrong} falsch)`} />
        </dl>
      </header>

      <QualityGateReview attempts={attempts} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border bg-card px-3 py-1.5">
      <dt className="inline text-muted-foreground">{label}: </dt>
      <dd className="inline font-medium text-foreground">{value}</dd>
    </div>
  );
}
