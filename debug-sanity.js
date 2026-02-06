const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-21';
const token = process.env.SANITY_VIEWER_TOKEN;

if (!projectId || !token) {
  throw new Error(
    'Missing Sanity env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_VIEWER_TOKEN before running.'
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function run() {
  const slug = 'ueber-uns'; // The slug user is testing

  // 1. Find the page document(s) with this slug
  const pages = await client.fetch(
    `*[_type == "page" && slug.current == $slug]{ _id, title, language, slug }`,
    { slug }
  );
  console.log('Pages with slug "ueber-uns":', JSON.stringify(pages, null, 2));

  if (pages.length > 0) {
    // Try each page found (in case of multiple for different langs)
    for (const page of pages) {
      console.log('Checking metadata for page ID:', page._id);

      // 2. Find metadata referencing this ID
      const metadataQuery = `*[_type == "translation.metadata" && references($id)]{
        _id,
        translations[]{
          _key,
          value->{ _id, language, slug }
        }
      }`;
      const metadata = await client.fetch(metadataQuery, { id: page._id });
      console.log('Metadata found:', JSON.stringify(metadata, null, 2));
    }
  } else {
    console.log('No pages found with slug:', slug);
  }
}

run();
