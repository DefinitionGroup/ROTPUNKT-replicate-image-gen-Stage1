const { createClient } = require('@sanity/client');

const projectId = "vsilsxth";
const dataset = "production";
const apiVersion = '2025-08-21';
const token = "skF7r0Mp4PvbYbrbocLezN6UgGpYIzr32uiXBXWuRWmfaR3vPCj5cco6iRbLLhzvHXQ6R7gIaPmUY02QOE7re2dFZs8I2WDmSnKp0On3Oki2GIwz4OXlFc3Ood91kdjdih20g4XDRtu8a8RtFb3DL9zaouJromFFFGPGNVc4BL2O0cbB3xZo";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function run() {
  console.log('--- Checking all page documents for slugs "home" or "home-en" ---');
  const pages = await client.fetch(
    '*[_type == "page" && slug.current in ["home", "home-en"]]{ _id, _type, title, language, slug }'
  );
  console.log(JSON.stringify(pages, null, 2));

  console.log('\n--- Checking translation metadata for these documents ---');
  for (const page of pages) {
    const metadata = await client.fetch(
      '*[_type == "translation.metadata" && references($id)]{ _id, translations }',
      { id: page._id }
    );
    console.log(`Metadata for ${page.title} (${page._id}):`, JSON.stringify(metadata, null, 2));
  }
}

run().catch(console.error);
