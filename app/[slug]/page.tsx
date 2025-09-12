import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import NotFound from "@/components/ui/not-found";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: await params,
  });

  return (
    <main>
      {page?.content ? <PageBuilder content={page?.content} /> : <NotFound />}
    </main>
  );
}
