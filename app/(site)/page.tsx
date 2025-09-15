import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Home() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });

  return (
    <main className="pt-20 md:pt-24 lg:pt-28 min-h-screen">
      {page?.content ? <PageBuilder content={page.content} /> : null}
    </main>
  );
}
