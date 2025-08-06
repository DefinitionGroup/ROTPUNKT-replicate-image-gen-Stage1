# AI Image Generator with Replicate

A modern image generation interface built with Next.js, Tailwind CSS, and Motion (formerly Framer Motion), powered by Replicate AI.

## Features

- 🎨 Generate images using state-of-the-art AI models
- ✨ Beautiful animations with Motion
- 🎯 Modern UI with Tailwind CSS
- 💾 Download generated images
- 📱 Fully responsive design
- ⚡ Fast and optimized with Next.js 15

## Prerequisites

- Node.js 20+ installed
- [PNPM](https://pnpm.io/) installed
- A Replicate account and API token

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd replicate-image-gen
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Replicate API token:
```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

You can get your API token from [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

5. Run the development server:
```bash
pnpm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Motion** - Animation library for React
- **Replicate AI** - AI model hosting platform

## Usage

1. Enter a descriptive prompt in the text field
2. Click "Generate" or press Enter
3. Wait for the AI to generate your image
4. Hover over generated images to download them

## Customization

### Changing the AI Model

By default, this uses the FLUX Schnell model. You can change it in `/app/api/replicate/route.ts`:

```typescript
const { prompt, model = "black-forest-labs/flux-schnell" } = await request.json();
```

Other popular models:
- `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b`
- `openai/dall-e-3:dc6bad83e327429194f5e8b1f6e1c1c0e5a7e7e5`

### Styling

The app uses Tailwind CSS for styling. You can customize colors, spacing, and more in `tailwind.config.ts`.

## Deployment

More to come here
 ... Moving forward for automaed builds!
## License

MIT
