const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 'vsilsxth',
    dataset: 'production',
    apiVersion: '2025-08-21',
    useCdn: false,
    token: 'skF7r0Mp4PvbYbrbocLezN6UgGpYIzr32uiXBXWuRWmfaR3vPCj5cco6iRbLLhzvHXQ6R7gIaPmUY02QOE7re2dFZs8I2WDmSnKp0On3Oki2GIwz4OXlFc3Ood91kdjdih20g4XDRtu8a8RtFb3DL9zaouJromFFFGPGNVc4BL2O0cbB3xZo'
});

async function run() {
    const slug = 'ueber-uns'; // The slug user is testing

    // 1. Find the page document(s) with this slug
    const pages = await client.fetch(`*[_type == "page" && slug.current == $slug]{ _id, title, language, slug }`, { slug });
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
