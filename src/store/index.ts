import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Slices
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import customersReducer from './slices/customersSlice';
import invoicesReducer from './slices/invoicesSlice';
import dashboardReducer from './slices/dashboardSlice';
import searchReducer from './slices/searchSlice';
import paymentsReducer from './slices/paymentsSlice';
import purchasesReducer from './slices/purchasesSlice';
import salesReducer from './slices/salesSlice';
import receiptsReducer from './slices/receiptsSlice';
import supplierPaymentReducer from './slices/supplierPayment';
import bankAccountsReducer from './slices/bankAccountsSlice';
import accountTransfersReducer from './slices/accountTransfersSlice';
import expensesReducer from './slices/expensesSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'theme'], // Only persist user and theme
};

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  customers: customersReducer,
  invoices: invoicesReducer,
  dashboard: dashboardReducer,
  search: searchReducer,
  payments: paymentsReducer,
  purchases: purchasesReducer,
  sales: salesReducer,
  receipts: receiptsReducer,
  supplierPayment: supplierPaymentReducer,
  bankAccounts: bankAccountsReducer,
  accountTransfers: accountTransfersReducer,
  expenses: expensesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
