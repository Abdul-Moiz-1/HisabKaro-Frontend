import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  accountTransfersApi,
  AccountTransfer,
  TransferFilters,
  TransferType,
} from '../../services/api/accountTransfers';

interface AccountTransfersState {
  transfers: AccountTransfer[];
  recentTransfers: AccountTransfer[];
  selectedTransfer: AccountTransfer | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  filters: TransferFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total_deposits: number;
    total_withdrawals: number;
    total_bank_transfers: number;
    total_wallet_transfers: number;
    transfer_count: number;
  } | null;
}

const initialState: AccountTransfersState = {
  transfers: [],
  recentTransfers: [],
  selectedTransfer: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    sort_by: 'date',
    sort_order: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  summary: null,
};

// Async Thunks
export const fetchTransfers = createAsyncThunk(
  'accountTransfers/fetchAll',
  async (filters: TransferFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await accountTransfersApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfers');
    }
  }
);

export const fetchTransferById = createAsyncThunk(
  'accountTransfers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await accountTransfersApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfer');
    }
  }
);

export const fetchRecentTransfers = createAsyncThunk(
  'accountTransfers/fetchRecent',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await accountTransfersApi.getRecent(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent transfers');
    }
  }
);

export const depositCashToBank = createAsyncThunk(
  'accountTransfers/depositCashToBank',
  async (
    payload: { bank_account_id: string; amount: number; date: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.depositCashToBank(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to deposit');
    }
  }
);

export const withdrawBankToCash = createAsyncThunk(
  'accountTransfers/withdrawBankToCash',
  async (
    payload: { bank_account_id: string; amount: number; date: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.withdrawBankToCash(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to withdraw');
    }
  }
);

export const transferBankToBank = createAsyncThunk(
  'accountTransfers/bankToBank',
  async (
    payload: {
      from_account_id: string;
      to_account_id: string;
      amount: number;
      date: string;
      notes?: string;
      fee?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.transferBankToBank(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to transfer');
    }
  }
);

export const transferToWallet = createAsyncThunk(
  'accountTransfers/toWallet',
  async (
    payload: {
      from_type: 'cash' | 'bank';
      from_account_id?: string;
      to_wallet_id: string;
      amount: number;
      date: string;
      notes?: string;
      fee?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.transferToWallet(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to transfer to wallet');
    }
  }
);

export const transferFromWallet = createAsyncThunk(
  'accountTransfers/fromWallet',
  async (
    payload: {
      from_wallet_id: string;
      to_type: 'cash' | 'bank';
      to_account_id?: string;
      amount: number;
      date: string;
      notes?: string;
      fee?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.transferFromWallet(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to transfer from wallet');
    }
  }
);

export const cancelTransfer = createAsyncThunk(
  'accountTransfers/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await accountTransfersApi.cancel(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel transfer');
    }
  }
);

export const fetchTransferSummary = createAsyncThunk(
  'accountTransfers/fetchSummary',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountTransfersApi.getSummary(startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch summary');
    }
  }
);

const accountTransfersSlice = createSlice({
  name: 'accountTransfers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TransferFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedTransfer: (state, action: PayloadAction<AccountTransfer | null>) => {
      state.selectedTransfer = action.payload;
    },
    clearSelectedTransfer: (state) => {
      state.selectedTransfer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transfers
      .addCase(fetchTransfers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transfers = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchTransferById.fulfilled, (state, action) => {
        state.selectedTransfer = action.payload;
      })

      // Fetch recent
      .addCase(fetchRecentTransfers.fulfilled, (state, action) => {
        state.recentTransfers = action.payload;
      })

      // Deposit cash to bank
      .addCase(depositCashToBank.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(depositCashToBank.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transfers.unshift(action.payload);
        state.recentTransfers.unshift(action.payload);
        if (state.recentTransfers.length > 5) {
          state.recentTransfers.pop();
        }
        state.pagination.total += 1;
      })
      .addCase(depositCashToBank.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Withdraw bank to cash
      .addCase(withdrawBankToCash.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(withdrawBankToCash.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transfers.unshift(action.payload);
        state.recentTransfers.unshift(action.payload);
        if (state.recentTransfers.length > 5) {
          state.recentTransfers.pop();
        }
        state.pagination.total += 1;
      })
      .addCase(withdrawBankToCash.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Bank to bank
      .addCase(transferBankToBank.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(transferBankToBank.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transfers.unshift(action.payload);
        state.recentTransfers.unshift(action.payload);
        if (state.recentTransfers.length > 5) {
          state.recentTransfers.pop();
        }
        state.pagination.total += 1;
      })
      .addCase(transferBankToBank.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // To wallet
      .addCase(transferToWallet.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(transferToWallet.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transfers.unshift(action.payload);
        state.recentTransfers.unshift(action.payload);
        if (state.recentTransfers.length > 5) {
          state.recentTransfers.pop();
        }
        state.pagination.total += 1;
      })
      .addCase(transferToWallet.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // From wallet
      .addCase(transferFromWallet.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(transferFromWallet.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transfers.unshift(action.payload);
        state.recentTransfers.unshift(action.payload);
        if (state.recentTransfers.length > 5) {
          state.recentTransfers.pop();
        }
        state.pagination.total += 1;
      })
      .addCase(transferFromWallet.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Cancel
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        const index = state.transfers.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transfers[index] = action.payload;
        }
        const recentIndex = state.recentTransfers.findIndex((t) => t.id === action.payload.id);
        if (recentIndex !== -1) {
          state.recentTransfers[recentIndex] = action.payload;
        }
        if (state.selectedTransfer?.id === action.payload.id) {
          state.selectedTransfer = action.payload;
        }
      })

      // Summary
      .addCase(fetchTransferSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedTransfer,
  clearSelectedTransfer,
  clearError,
} = accountTransfersSlice.actions;

export default accountTransfersSlice.reducer;
