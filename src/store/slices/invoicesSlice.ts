import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoicesApi, Invoice, InvoiceFilters } from '../../services/api';

interface InvoicesState {
  invoices: Invoice[];
  salesInvoices: Invoice[];
  purchaseInvoices: Invoice[];
  selectedInvoice: Invoice | null;
  pendingInvoices: Invoice[];
  recentInvoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: InvoicesState = {
  invoices: [],
  salesInvoices: [],
  purchaseInvoices: [],
  selectedInvoice: null,
  pendingInvoices: [],
  recentInvoices: [],
  isLoading: false,
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
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (filters: InvoiceFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchSalesInvoices = createAsyncThunk(
  'invoices/fetchSales',
  async (filters: Omit<InvoiceFilters, 'type'> | undefined, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getSales(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sales invoices');
    }
  }
);

export const fetchPurchaseInvoices = createAsyncThunk(
  'invoices/fetchPurchases',
  async (filters: Omit<InvoiceFilters, 'type'> | undefined, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getPurchases(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoice');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (payload: Parameters<typeof invoicesApi.create>[0], { rejectWithValue }) => {
    try {
      const response = await invoicesApi.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, payload }: { id: string; payload: Parameters<typeof invoicesApi.update>[1] }, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await invoicesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete invoice');
    }
  }
);

export const markInvoiceAsPaid = createAsyncThunk(
  'invoices/markPaid',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.markAsPaid(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark invoice as paid');
    }
  }
);

export const fetchPendingInvoices = createAsyncThunk(
  'invoices/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getPending();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending invoices');
    }
  }
);

export const fetchRecentInvoices = createAsyncThunk(
  'invoices/fetchRecent',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await invoicesApi.getRecent(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent invoices');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<InvoiceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch sales invoices
      .addCase(fetchSalesInvoices.fulfilled, (state, action) => {
        state.salesInvoices = action.payload.data;
      })
      // Fetch purchase invoices
      .addCase(fetchPurchaseInvoices.fulfilled, (state, action) => {
        state.purchaseInvoices = action.payload.data;
      })
      // Fetch by ID
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.selectedInvoice = action.payload;
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
        if (action.payload.type === 'sales') {
          state.salesInvoices.unshift(action.payload);
        } else {
          state.purchaseInvoices.unshift(action.payload);
        }
        state.pagination.total += 1;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const updateList = (list: Invoice[]) => {
          const index = list.findIndex((i) => i.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        updateList(state.invoices);
        updateList(state.salesInvoices);
        updateList(state.purchaseInvoices);
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      })
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        const filterOut = (list: Invoice[]) => list.filter((i) => i.id !== action.payload);
        state.invoices = filterOut(state.invoices);
        state.salesInvoices = filterOut(state.salesInvoices);
        state.purchaseInvoices = filterOut(state.purchaseInvoices);
        state.pagination.total -= 1;
        if (state.selectedInvoice?.id === action.payload) {
          state.selectedInvoice = null;
        }
      })
      // Mark as paid
      .addCase(markInvoiceAsPaid.fulfilled, (state, action) => {
        const updateList = (list: Invoice[]) => {
          const index = list.findIndex((i) => i.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        updateList(state.invoices);
        updateList(state.salesInvoices);
        updateList(state.purchaseInvoices);
        state.pendingInvoices = state.pendingInvoices.filter((i) => i.id !== action.payload.id);
      })
      // Pending invoices
      .addCase(fetchPendingInvoices.fulfilled, (state, action) => {
        state.pendingInvoices = action.payload;
      })
      // Recent invoices
      .addCase(fetchRecentInvoices.fulfilled, (state, action) => {
        state.recentInvoices = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedInvoice,
  clearSelectedInvoice,
  clearError,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
