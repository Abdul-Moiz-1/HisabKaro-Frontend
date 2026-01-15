import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  bankAccountsApi,
  BankAccount,
  BankAccountTransaction,
  BankAccountFilters,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
  DepositPayload,
  WithdrawalPayload,
} from '../../services/api/bankAccounts';

interface BankAccountsState {
  accounts: BankAccount[];
  activeAccounts: BankAccount[];
  selectedAccount: BankAccount | null;
  transactions: BankAccountTransaction[];
  cashInHand: number;
  totalBankBalance: number;
  isLoading: boolean;
  isTransacting: boolean;
  error: string | null;
  filters: BankAccountFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BankAccountsState = {
  accounts: [],
  activeAccounts: [],
  selectedAccount: null,
  transactions: [],
  cashInHand: 0,
  totalBankBalance: 0,
  isLoading: false,
  isTransacting: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    status: 'active',
    sort_by: 'bank_name',
    sort_order: 'asc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async Thunks
export const fetchBankAccounts = createAsyncThunk(
  'bankAccounts/fetchAll',
  async (filters: BankAccountFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bank accounts');
    }
  }
);

export const fetchActiveBankAccounts = createAsyncThunk(
  'bankAccounts/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.getActive();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch active accounts');
    }
  }
);

export const fetchBankAccountById = createAsyncThunk(
  'bankAccounts/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bank account');
    }
  }
);

export const createBankAccount = createAsyncThunk(
  'bankAccounts/create',
  async (payload: CreateBankAccountPayload, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create bank account');
    }
  }
);

export const updateBankAccount = createAsyncThunk(
  'bankAccounts/update',
  async ({ id, payload }: { id: string; payload: UpdateBankAccountPayload }, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update bank account');
    }
  }
);

export const deleteBankAccount = createAsyncThunk(
  'bankAccounts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await bankAccountsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete bank account');
    }
  }
);

export const depositToBank = createAsyncThunk(
  'bankAccounts/deposit',
  async (payload: DepositPayload, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.deposit(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to deposit');
    }
  }
);

export const withdrawFromBank = createAsyncThunk(
  'bankAccounts/withdraw',
  async (payload: WithdrawalPayload, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.withdraw(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to withdraw');
    }
  }
);

export const fetchAccountTransactions = createAsyncThunk(
  'bankAccounts/fetchTransactions',
  async (
    { accountId, startDate, endDate }: { accountId: string; startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await bankAccountsApi.getTransactions(accountId, startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchCashInHand = createAsyncThunk(
  'bankAccounts/fetchCashInHand',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.getCashInHand();
      return response.balance;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cash balance');
    }
  }
);

export const fetchTotalBankBalance = createAsyncThunk(
  'bankAccounts/fetchTotalBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.getTotalBankBalance();
      return response.total_balance;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch total balance');
    }
  }
);

export const setDefaultAccount = createAsyncThunk(
  'bankAccounts/setDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bankAccountsApi.setDefault(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set default account');
    }
  }
);

const bankAccountsSlice = createSlice({
  name: 'bankAccounts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BankAccountFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedAccount: (state, action: PayloadAction<BankAccount | null>) => {
      state.selectedAccount = action.payload;
    },
    clearSelectedAccount: (state) => {
      state.selectedAccount = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts
      .addCase(fetchBankAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch active accounts
      .addCase(fetchActiveBankAccounts.fulfilled, (state, action) => {
        state.activeAccounts = action.payload;
      })

      // Fetch by ID
      .addCase(fetchBankAccountById.fulfilled, (state, action) => {
        state.selectedAccount = action.payload;
      })

      // Create account
      .addCase(createBankAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBankAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.unshift(action.payload);
        if (action.payload.status === 'active') {
          state.activeAccounts.push(action.payload);
        }
        state.pagination.total += 1;
      })
      .addCase(createBankAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update account
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        const activeIndex = state.activeAccounts.findIndex((a) => a.id === action.payload.id);
        if (action.payload.status === 'active') {
          if (activeIndex !== -1) {
            state.activeAccounts[activeIndex] = action.payload;
          } else {
            state.activeAccounts.push(action.payload);
          }
        } else if (activeIndex !== -1) {
          state.activeAccounts.splice(activeIndex, 1);
        }
        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = action.payload;
        }
      })

      // Delete account
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex((a) => a.id === action.payload);
        if (index !== -1) {
          state.accounts[index].status = 'closed';
        }
        state.activeAccounts = state.activeAccounts.filter((a) => a.id !== action.payload);
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      })

      // Deposit
      .addCase(depositToBank.pending, (state) => {
        state.isTransacting = true;
        state.error = null;
      })
      .addCase(depositToBank.fulfilled, (state, action) => {
        state.isTransacting = false;
        state.transactions.unshift(action.payload);
        // Update account balance in state
        const account = state.accounts.find((a) => a.id === action.payload.bank_account_id);
        if (account) {
          account.current_balance = action.payload.balance_after;
        }
        const activeAccount = state.activeAccounts.find((a) => a.id === action.payload.bank_account_id);
        if (activeAccount) {
          activeAccount.current_balance = action.payload.balance_after;
        }
        // Update cash in hand
        state.cashInHand -= action.payload.amount;
      })
      .addCase(depositToBank.rejected, (state, action) => {
        state.isTransacting = false;
        state.error = action.payload as string;
      })

      // Withdraw
      .addCase(withdrawFromBank.pending, (state) => {
        state.isTransacting = true;
        state.error = null;
      })
      .addCase(withdrawFromBank.fulfilled, (state, action) => {
        state.isTransacting = false;
        state.transactions.unshift(action.payload);
        // Update account balance in state
        const account = state.accounts.find((a) => a.id === action.payload.bank_account_id);
        if (account) {
          account.current_balance = action.payload.balance_after;
        }
        const activeAccount = state.activeAccounts.find((a) => a.id === action.payload.bank_account_id);
        if (activeAccount) {
          activeAccount.current_balance = action.payload.balance_after;
        }
        // Update cash in hand
        state.cashInHand += action.payload.amount;
      })
      .addCase(withdrawFromBank.rejected, (state, action) => {
        state.isTransacting = false;
        state.error = action.payload as string;
      })

      // Transactions
      .addCase(fetchAccountTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      // Cash in hand
      .addCase(fetchCashInHand.fulfilled, (state, action) => {
        state.cashInHand = action.payload;
      })

      // Total balance
      .addCase(fetchTotalBankBalance.fulfilled, (state, action) => {
        state.totalBankBalance = action.payload;
      })

      // Set default
      .addCase(setDefaultAccount.fulfilled, (state, action) => {
        // Remove default from all accounts
        state.accounts.forEach((a) => {
          a.is_default = false;
        });
        state.activeAccounts.forEach((a) => {
          a.is_default = false;
        });
        // Set the new default
        const account = state.accounts.find((a) => a.id === action.payload.id);
        if (account) {
          account.is_default = true;
        }
        const activeAccount = state.activeAccounts.find((a) => a.id === action.payload.id);
        if (activeAccount) {
          activeAccount.is_default = true;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedAccount,
  clearSelectedAccount,
  clearTransactions,
  clearError,
} = bankAccountsSlice.actions;

export default bankAccountsSlice.reducer;
