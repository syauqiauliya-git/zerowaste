import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initializeLanguage } from '@/store/slices/languageSlice';

export function LanguageInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeLanguage());
  }, [dispatch]);

  return <>{children}</>;
}

