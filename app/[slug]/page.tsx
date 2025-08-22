import { PageBuilder } from "@/components/PageBuilder";
import Navbar from "@/components/ui/navbar";
import { sanityFetch } from "@/sanity/lib/live";
import { NAVBAR_QUERY, PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: await params,
  });

  const { data: navbar } = await sanityFetch({
    query: NAVBAR_QUERY,
  });


  return (
    <>
      {navbar && (
        <Navbar
          {...navbar}
        />
      )}

      <main>
        {page?.content ? (
          <PageBuilder content={page?.content} />
        ) : null}
      </main>
    </>
  );
}
