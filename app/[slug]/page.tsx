import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: await params,
  });

  console.debug(page)

  return page?.content ? (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-30">
      <PageBuilder content={page.content} />
    </main>
  ) : null;
}
