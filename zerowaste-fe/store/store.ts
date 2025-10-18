import { configureStore } from '@reduxjs/toolkit';
import schoolReducer from './slices/schoolSlice';
import classReducer from './slices/classSlice';

export const store = configureStore({
  reducer: {
    schools: schoolReducer,
    classes: classReducer,
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
