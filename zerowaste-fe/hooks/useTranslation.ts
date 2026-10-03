import { useAppSelector } from '@/store/hooks';
import { getTranslation, t as translate } from '@/lib/i18n';
import type { Language } from '@/store/slices/languageSlice';

export const useTranslation = () => {
  const language = useAppSelector((state) => state.language.language);
  const translations = getTranslation(language);

  const t = (path: string): string => {
    return translate(language, path);
  };

  return {
    t,
    language,
    translations,
  };
};

