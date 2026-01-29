'use client';

import { useEffect } from 'react';
import { setTranslations, type TranslationMap } from '@/store/translations';

export function TranslationSetter({ translations }: { translations: TranslationMap }) {
  useEffect(() => {
    setTranslations(translations);
    return () => setTranslations({}); // Cleanup on unmount
  }, [translations]);

  return null;
}
