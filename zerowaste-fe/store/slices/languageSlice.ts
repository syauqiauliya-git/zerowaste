import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  loading: boolean;
}

const LANGUAGE_STORAGE_KEY = 'app_language';

// Load language from storage
const loadLanguage = async (): Promise<Language> => {
  try {
    const stored = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    return (stored as Language) || 'id'; // Default to Indonesian
  } catch {
    return 'id';
  }
};

// Save language to storage
const saveLanguage = async (language: Language): Promise<void> => {
  try {
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
};

const initialState: LanguageState = {
  language: 'id',
  loading: true,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      saveLanguage(action.payload);
    },
    setLanguageLoaded: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      state.loading = false;
    },
  },
});

export const { setLanguage, setLanguageLoaded } = languageSlice.actions;

// Async thunk to initialize language
export const initializeLanguage = () => async (dispatch: any) => {
  const language = await loadLanguage();
  dispatch(setLanguageLoaded(language));
};

export default languageSlice.reducer;

