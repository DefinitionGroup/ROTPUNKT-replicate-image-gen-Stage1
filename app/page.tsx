import React from "react";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Home() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });

  return (
    <main>
      {page?.content ? (
        <PageBuilder content={page?.content} />
      ) : null}
    </main>
  );
}
