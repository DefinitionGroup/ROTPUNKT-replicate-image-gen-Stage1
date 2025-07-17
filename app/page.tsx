import ImageGenerator from "./components/ImageGenerator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-center text-gray-300 mb-12">
          Powered by Replicate AI
        </p>
        <ImageGenerator />
      </div>
    </main>
  );
}
