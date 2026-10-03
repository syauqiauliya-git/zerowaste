import { configureStore } from '@reduxjs/toolkit';
import schoolReducer from './slices/schoolSlice';
import classReducer from './slices/classSlice';
import authReducer from './slices/authSlice';
import menuReducer from './slices/menuSlice';
import sppgReducer from './slices/sppgSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    schools: schoolReducer,
    classes: classReducer,
    auth: authReducer,
    menus: menuReducer,
    sppg: sppgReducer,
    language: languageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
