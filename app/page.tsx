import React from "react";
import PageContent from "@/components/PageContent";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Home() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });

  console.debug(page)

  return (
    <main>
      <PageContent>
        {page?.content ? (
          <PageBuilder content={page?.content} />
        ) : null}
      </PageContent>
    </main>
  );
}
