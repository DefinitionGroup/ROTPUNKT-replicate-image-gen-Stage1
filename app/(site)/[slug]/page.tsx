// app/(site)/[slug]/page.tsx
import { defineQuery } from "next-sanity";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import NotFound from "@/components/ui/not-found";

type Params = { slug: string };

export default async function Page({ params }: { params: Params }) {
  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params,
  });

  return (
    <main>
      {page?.content ? <PageBuilder content={page.content} /> : <NotFound />}
      {/* Or: if (!page?.content) return notFound(); */}
    </main>
  );
}
