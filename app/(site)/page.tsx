// app/(site)/page.tsx
import { defineQuery } from "next-sanity";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries"; // keep if you already have it

// If you like, you can inline the query with defineQuery instead of importing:
// const HOME_PAGE_QUERY = defineQuery(`*[_type=="home"][0]{ content }`);

export default async function Home() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });

  return (
    <main>{page?.content ? <PageBuilder content={page.content} /> : null}</main>
  );
}
