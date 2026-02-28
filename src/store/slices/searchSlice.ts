import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersApi, Customer } from '../../services/api/customers';
import { productsApi, Product } from '../../services/api/products';
import { invoicesApi, Invoice } from '../../services/api/invoices';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchResult {
  id: string;
  type: 'customer' | 'product' | 'invoice';
  title: string;
  subtitle?: string;
  data: Customer | Product | Invoice;
}

interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount: number;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  customerResults: Customer[];
  productResults: Product[];
  invoiceResults: Invoice[];
  recentSearches: RecentSearch[];
  isSearching: boolean;
  error: string | null;
  activeFilter: 'all' | 'customers' | 'products' | 'invoices';
}

const initialState: SearchState = {
  query: '',
  results: [],
  customerResults: [],
  productResults: [],
  invoiceResults: [],
  recentSearches: [],
  isSearching: false,
  error: null,
  activeFilter: 'all',
};

const RECENT_SEARCHES_KEY = 'hisabkaro_recent_searches';
const MAX_RECENT_SEARCHES = 10;

// Async thunks
export const globalSearch = createAsyncThunk(
  'search/globalSearch',
  async (query: string, { dispatch, rejectWithValue }) => {
    if (!query.trim()) {
      return { customers: [], products: [], invoices: [] };
    }
    
    try {
      const [customers, products, invoices] = await Promise.allSettled([
        customersApi.search(query, 5),
        productsApi.search(query, 5),
        invoicesApi.getAll({ search: query, limit: 5 }),
      ]);

      const customerResults = customers.status === 'fulfilled' ? customers.value : [];
      const productResults = products.status === 'fulfilled' ? products.value : [];
      const invoiceResults = invoices.status === 'fulfilled' ? invoices.value.data : [];

      // Save to recent searches
      const totalResults = customerResults.length + productResults.length + invoiceResults.length;
      if (totalResults > 0) {
        dispatch(addRecentSearch({ query, resultCount: totalResults }));
      }

      return {
        customers: customerResults,
        products: productResults,
        invoices: invoiceResults,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const searchCustomersOnly = createAsyncThunk(
  'search/searchCustomers',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await customersApi.search(query, 20);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Customer search failed');
    }
  }
);

export const searchProductsOnly = createAsyncThunk(
  'search/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await productsApi.search(query, 20);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Product search failed');
    }
  }
);

export const loadRecentSearches = createAsyncThunk(
  'search/loadRecent',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        return JSON.parse(stored) as RecentSearch[];
      }
      return [];
    } catch (error) {
      return rejectWithValue('Failed to load recent searches');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<SearchState['activeFilter']>) => {
      state.activeFilter = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.customerResults = [];
      state.productResults = [];
      state.invoiceResults = [];
      state.error = null;
    },
    addRecentSearch: (state, action: PayloadAction<{ query: string; resultCount: number }>) => {
      const newSearch: RecentSearch = {
        query: action.payload.query,
        timestamp: new Date().toISOString(),
        resultCount: action.payload.resultCount,
      };
      
      // Remove duplicate if exists
      state.recentSearches = state.recentSearches.filter(
        (s) => s.query.toLowerCase() !== action.payload.query.toLowerCase()
      );
      
      // Add to beginning
      state.recentSearches.unshift(newSearch);
      
      // Keep only MAX_RECENT_SEARCHES
      if (state.recentSearches.length > MAX_RECENT_SEARCHES) {
        state.recentSearches = state.recentSearches.slice(0, MAX_RECENT_SEARCHES);
      }

      // Persist to storage
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(state.recentSearches));
    },
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(
        (s) => s.query !== action.payload
      );
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(state.recentSearches));
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Global search
      .addCase(globalSearch.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.customerResults = action.payload.customers;
        state.productResults = action.payload.products;
        state.invoiceResults = action.payload.invoices;

        // Combine into unified results
        const results: SearchResult[] = [];
        
        action.payload.customers.forEach((customer) => {
          results.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: customer.phone || customer.city,
            data: customer,
          });
        });

        action.payload.products.forEach((product) => {
          results.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `PKR ${product.sale_price}`,
            data: product,
          });
        });

        action.payload.invoices.forEach((invoice) => {
          results.push({
            id: invoice.id,
            type: 'invoice',
            title: invoice.invoice_number,
            subtitle: `PKR ${invoice.total}`,
            data: invoice,
          });
        });

        state.results = results;
      })
      .addCase(globalSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Customer search
      .addCase(searchCustomersOnly.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchCustomersOnly.fulfilled, (state, action) => {
        state.isSearching = false;
        state.customerResults = action.payload;
      })
      // Product search
      .addCase(searchProductsOnly.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchProductsOnly.fulfilled, (state, action) => {
        state.isSearching = false;
        state.productResults = action.payload;
      })
      // Load recent searches
      .addCase(loadRecentSearches.fulfilled, (state, action) => {
        state.recentSearches = action.payload;
      });
  },
});

export const {
  setQuery,
  setActiveFilter,
  clearSearch,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  clearError,
} = searchSlice.actions;

export default searchSlice.reducer;
