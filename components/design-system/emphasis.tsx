import type { ReactNode } from "react";

/**
 * Content authors mark the one serif word of a headline with *asterisks*:
 * "Küchen, auf den *Punkt*." becomes <em>Punkt</em>.
 */
export function Emphasis({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={index}>{part.slice(1, -1)}</em>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}
