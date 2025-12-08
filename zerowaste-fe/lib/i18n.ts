import { id } from '@/locales/id';
import { en } from '@/locales/en';
import type { Language } from '@/store/slices/languageSlice';

type Translations = typeof id;

const translations: Record<Language, Translations> = {
  id,
  en,
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.id;
};

// Helper function to get nested translation
export const t = (language: Language, path: string): string => {
  const keys = path.split('.');
  let value: any = translations[language] || translations.id;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path;
};

