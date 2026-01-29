import { map } from 'nanostores';

export type TranslationMap = Record<string, string>;

export const $translations = map<TranslationMap>({});

export function setTranslations(translations: TranslationMap) {
    $translations.set(translations);
}
