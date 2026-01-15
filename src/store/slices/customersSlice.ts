import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersApi, Customer, CustomerFilters } from '../../services/api';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  frequentCustomers: Customer[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filters: CustomerFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchResults: Customer[];
  searchQuery: string;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  frequentCustomers: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  searchResults: [],
  searchQuery: '',
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (filters: CustomerFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await customersApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  },
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customersApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customer');
    }
  },
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (
    payload: Parameters<typeof customersApi.create>[0],
    { rejectWithValue },
  ) => {
    try {
      const response = await customersApi.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create customer');
    }
  },
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async (
    {
      id,
      payload,
    }: { id: string; payload: Parameters<typeof customersApi.update>[1] },
    { rejectWithValue },
  ) => {
    try {
      const response = await customersApi.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update customer');
    }
  },
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await customersApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete customer');
    }
  },
);

export const searchCustomers = createAsyncThunk(
  'customers/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await customersApi.search(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  },
);

export const fetchFrequentCustomers = createAsyncThunk(
  'customers/fetchFrequent',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await customersApi.getFrequent(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch frequent customers',
      );
    }
  },
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: state => {
      state.filters = initialState.filters;
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: state => {
      state.selectedCustomer = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: state => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchCustomerById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          c => c.id === action.payload.id,
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      // Search customers
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Frequent customers
      .addCase(fetchFrequentCustomers.fulfilled, (state, action) => {
        state.frequentCustomers = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedCustomer,
  clearSelectedCustomer,
  setSearchQuery,
  clearSearchResults,
  clearError,
} = customersSlice.actions;

export default customersSlice.reducer;
