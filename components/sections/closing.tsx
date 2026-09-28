import { Emphasis } from "@/components/design-system/emphasis";
import { Pill } from "@/components/design-system/pill";
import { Reveal } from "@/components/design-system/reveal";
import type { ClosingContent } from "@/lib/content/types";

/** The close: one headline, one sentence, the one red action. */
export function Closing({ closing }: { closing: ClosingContent }) {
  return (
    <section className="signature-container pt-24 md:pt-40">
      <Reveal className="flex flex-col items-center gap-6 text-center md:gap-8">
        <h2 className="m-0 max-w-[14ch] text-balance text-heading-lg">
          <Emphasis text={closing.title} />
        </h2>
        <p className="m-0 max-w-[46ch] text-body text-graphite">{closing.body}</p>
        <Pill href={closing.cta.href}>{closing.cta.label}</Pill>
      </Reveal>
    </section>
  );
}
