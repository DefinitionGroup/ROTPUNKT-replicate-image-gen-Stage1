import type { ReactNode } from "react";

/**
 * The head of every configurator step: a red glyph, the question as a title,
 * one line of guidance in graphite. Steps differ in what they offer, never in
 * how they introduce themselves.
 */
export function StepHeader({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 shrink-0 text-left">
      <div className="flex items-center gap-3">
        {icon ? (
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center text-signature [&>svg]:size-4">
            {icon}
          </span>
        ) : null}
        <h2 className="text-title font-medium tracking-tight text-ink">{title}</h2>
      </div>
      <p className="mt-2 max-w-xl text-body text-graphite">{description}</p>
    </div>
  );
}
