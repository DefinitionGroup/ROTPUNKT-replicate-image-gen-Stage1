"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations('notFound');
  const tCommon = useTranslations('common');

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-6xl font-bold text-muted-foreground/40 mb-4">
              {t('code')}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="red" size="red" enableMotion>
              <Link href="/">{tCommon('toHomepage')}</Link>
            </Button>
            <Button asChild variant="red" size="red" enableMotion>
              <Link href="/kontakt">{tCommon('contact')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
