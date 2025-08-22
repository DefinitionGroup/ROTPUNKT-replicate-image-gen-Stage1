import React from "react";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY, NAVBAR_QUERY } from "@/sanity/lib/queries";
import Navbar from "@/components/ui/navbar";

export default async function Home() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
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
