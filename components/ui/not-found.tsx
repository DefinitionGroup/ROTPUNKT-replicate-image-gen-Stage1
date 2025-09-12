import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
              404
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Seite nicht gefunden
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Die angeforderte Seite existiert nicht oder wurde verschoben.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="red" size="red" enableMotion>
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button asChild variant="red" size="red" enableMotion>
              <Link href="/kontakt">Kontakt</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
