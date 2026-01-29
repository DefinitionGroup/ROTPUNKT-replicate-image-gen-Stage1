const { createClient } = require('@sanity/client');
// Load environment variables from .env.local
// dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'vsilsxth',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-08-21',
    useCdn: false,
    // Using token from .env.local or falling back to the one I saw in debug-sanity.js if env fails
    token: process.env.SANITY_VIEWER_TOKEN || 'skF7r0Mp4PvbYbrbocLezN6UgGpYIzr32uiXBXWuRWmfaR3vPCj5cco6iRbLLhzvHXQ6R7gIaPmUY02QOE7re2dFZs8I2WDmSnKp0On3Oki2GIwz4OXlFc3Ood91kdjdih20g4XDRtu8a8RtFb3DL9zaouJromFFFGPGNVc4BL2O0cbB3xZo'
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
        const homePages = await client.fetch(`*[_type == "page" && slug.current == "home"]{
        _id,
        title,
        language,
        slug
    }`);
        console.log('Home Pages (slug="home"):', JSON.stringify(homePages, null, 2));
        // Check metadata for the German Home Page
        const homeId = "564b8631-8274-4b89-bc02-6471f3257cf4";
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

    } catch (err) {
        console.error('Error fetching pages:', err);
    }
}

run();
