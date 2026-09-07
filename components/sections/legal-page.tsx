import { marked } from "marked";
import RichTextComponent from "@/components/pagebuildercomponents/RichTextComponent";
import type { PageContent } from "@/lib/content/types";

/** Long-form legal text, from markdown (content.md) or Portable Text (Sanity), on the same measure. */
export function LegalPage({ page }: { page: PageContent }) {
  return (
    <section className="signature-container pt-32 md:pt-40">
      {page.markdown ? (
        <div className="prose-signature" dangerouslySetInnerHTML={{ __html: marked.parse(page.markdown, { async: false }) as string }} />
      ) : (
        <div className="prose-signature">
          <RichTextComponent value={page.portableText as never} />
        </div>
      )}
    </section>
  );
}
