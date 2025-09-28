import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import interviewSlice from './slices/interviewSlice';
import candidatesSlice from './slices/candidatesSlice';
import authSlice from './slices/authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidates', 'interview'], // Only persist these slices
};

const rootReducer = combineReducers({
  interview: interviewSlice,
  candidates: candidatesSlice,
  auth: authSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;