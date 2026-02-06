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
  try {
    const pages = await client.fetch(`*[_type == "page"]{ 
      _id, 
      title, 
      "slug": slug.current, 
      language 
    }`);
    console.log('All Pages:', JSON.stringify(pages, null, 2));

    // Also specifically look for home
    const homePages = await client.fetch(
      `*[_type == "page" && slug.current == "home"]{ _id, title, language, slug }`
    );
    console.log('Home Pages (slug="home"):', JSON.stringify(homePages, null, 2));

    // Check metadata for the German Home Page (replace with a real ID if needed)
    const homeId = process.env.SANITY_HOME_PAGE_ID;
    if (homeId) {
      console.log('Checking metadata for Home Page ID:', homeId);
      const metadataQuery = `*[_type == "translation.metadata" && references($id)]{
        _id,
        translations[]{
          _key,
          value->{ _id, language, slug }
        }
      }`;
      const metadata = await client.fetch(metadataQuery, { id: homeId });
      console.log('Home Metadata:', JSON.stringify(metadata, null, 2));
    }
  } catch (err) {
    console.error('Error fetching pages:', err);
  }
}

run();
