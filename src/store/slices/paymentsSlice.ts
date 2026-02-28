import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentsApi, Payment, PaymentFilters, CreatePaymentPayload } from '../../services/api/payments';

interface PaymentFlowState {
  partyId: string | null;
  partyName: string | null;
  partyType: 'customer' | 'supplier' | null;
  balance: number;
  amount: number;
  method: 'cash' | 'bank' | 'jazzcash' | 'easypaisa';
  allocations: Array<{
    invoice_id: string;
    amount: number;
  }>;
}

interface PaymentsState {
  payments: Payment[];
  recentPayments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  filters: PaymentFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Payment flow state
  flowState: PaymentFlowState;
}

const initialFlowState: PaymentFlowState = {
  partyId: null,
  partyName: null,
  partyType: null,
  balance: 0,
  amount: 0,
  method: 'cash',
  allocations: [],
};

const initialState: PaymentsState = {
  payments: [],
  recentPayments: [],
  selectedPayment: null,
  isLoading: false,
  isCreating: false,
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
  flowState: initialFlowState,
};

// Async thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async (filters: PaymentFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payments');
    }
  }
);

export const fetchReceivedPayments = createAsyncThunk(
  'payments/fetchReceived',
  async (filters: Omit<PaymentFilters, 'type'> | undefined, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getReceived(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch received payments');
    }
  }
);

export const fetchPaidPayments = createAsyncThunk(
  'payments/fetchPaid',
  async (filters: Omit<PaymentFilters, 'type'> | undefined, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getPaid(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch paid payments');
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payment');
    }
  }
);

export const receivePayment = createAsyncThunk(
  'payments/receive',
  async (payload: Omit<CreatePaymentPayload, 'type'>, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.receivePayment(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to receive payment');
    }
  }
);

export const makePayment = createAsyncThunk(
  'payments/make',
  async (payload: Omit<CreatePaymentPayload, 'type'>, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.makePayment(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to make payment');
    }
  }
);

export const cancelPayment = createAsyncThunk(
  'payments/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.cancel(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel payment');
    }
  }
);

export const fetchTodaysPayments = createAsyncThunk(
  'payments/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getToday();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch today\'s payments');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PaymentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Flow state actions
    setFlowParty: (
      state,
      action: PayloadAction<{
        partyId: string;
        partyName: string;
        partyType: 'customer' | 'supplier';
        balance: number;
      }>
    ) => {
      state.flowState.partyId = action.payload.partyId;
      state.flowState.partyName = action.payload.partyName;
      state.flowState.partyType = action.payload.partyType;
      state.flowState.balance = action.payload.balance;
    },
    setFlowAmount: (state, action: PayloadAction<number>) => {
      state.flowState.amount = action.payload;
    },
    setFlowMethod: (
      state,
      action: PayloadAction<'cash' | 'bank' | 'jazzcash' | 'easypaisa'>
    ) => {
      state.flowState.method = action.payload;
    },
    setFlowAllocations: (
      state,
      action: PayloadAction<Array<{ invoice_id: string; amount: number }>>
    ) => {
      state.flowState.allocations = action.payload;
    },
    resetFlowState: (state) => {
      state.flowState = initialFlowState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch received payments
      .addCase(fetchReceivedPayments.fulfilled, (state, action) => {
        state.payments = action.payload.data;
      })
      // Fetch paid payments
      .addCase(fetchPaidPayments.fulfilled, (state, action) => {
        state.payments = action.payload.data;
      })
      // Fetch by ID
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.selectedPayment = action.payload;
      })
      // Receive payment
      .addCase(receivePayment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(receivePayment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.payments.unshift(action.payload);
        state.recentPayments.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(receivePayment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Make payment
      .addCase(makePayment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.payments.unshift(action.payload);
        state.recentPayments.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(makePayment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Cancel payment
      .addCase(cancelPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      })
      // Today's payments
      .addCase(fetchTodaysPayments.fulfilled, (state, action) => {
        state.recentPayments = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedPayment,
  clearSelectedPayment,
  clearError,
  setFlowParty,
  setFlowAmount,
  setFlowMethod,
  setFlowAllocations,
  resetFlowState,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
