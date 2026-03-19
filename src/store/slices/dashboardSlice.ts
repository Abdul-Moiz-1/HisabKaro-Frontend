import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportsApi } from '../../services/api';
import {
  DailyTransaction,
  DashboardSummary,
  RecentActivity,
} from '../../services/api/reports';

interface DashboardState {
  summary: DashboardSummary | null;
  recentActivity: RecentActivity[];
  dailyTransactions: DailyTransaction[];
  trends: {
    sales: Array<{ label: string; value: number }>;
    purchases: Array<{ label: string; value: number }>;
    profit: Array<{ label: string; value: number }>;
  };
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
  // UI State
  selectedTrendPeriod: 'week' | 'month' | 'year';
  // Directory counts
  customersCount: number;
  suppliersCount: number;
  productsCount: number;
  bankAccountsCount: number;
  pendingSuppliersCount: number;
}

const initialState: DashboardState = {
  summary: null,
  recentActivity: [],
  dailyTransactions: [],
  trends: {
    sales: [],
    purchases: [],
    profit: [],
  },
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,
  selectedTrendPeriod: 'week',
  customersCount: 0,
  suppliersCount: 0,
  productsCount: 0,
  bankAccountsCount: 0,
  pendingSuppliersCount: 0,
};

// Async thunks
export const fetchDashboardSummary = createAsyncThunk<
  DashboardSummary,
  void,
  { rejectValue: string }
>('dashboard/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    const response = await reportsApi.getDashboard();
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.message || 'Failed to fetch dashboard summary',
    );
  }
});

export const fetchRecentActivity = createAsyncThunk<
  RecentActivity[],
  number | undefined,
  { rejectValue: string }
>('dashboard/fetchRecentActivity', async (limit = 10, { rejectWithValue }) => {
  try {
    const response = await reportsApi.getRecentActivity(limit);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch recent activity');
  }
});

export const fetchDailyTransactions = createAsyncThunk<
  DailyTransaction[],
  { startDate: string; endDate: string },
  { rejectValue: string }
>(
  'dashboard/fetchDailyTransactions',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getDailyTransactions(
        startDate,
        endDate,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch daily transactions',
      );
    }
  },
);

export const fetchSalesTrend = createAsyncThunk<
  Array<{ label: string; value: number }>,
  'week' | 'month' | 'year',
  { rejectValue: string }
>('dashboard/fetchSalesTrend', async (period, { rejectWithValue }) => {
  try {
    const response = await reportsApi.getTrends('sales', period);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch sales trend');
  }
});

export const fetchPurchasesTrend = createAsyncThunk<
  Array<{ label: string; value: number }>,
  'week' | 'month' | 'year',
  { rejectValue: string }
>('dashboard/fetchPurchasesTrend', async (period, { rejectWithValue }) => {
  try {
    const response = await reportsApi.getTrends('purchases', period);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch purchases trend');
  }
});

export const fetchProfitTrend = createAsyncThunk<
  Array<{ label: string; value: number }>,
  'week' | 'month' | 'year',
  { rejectValue: string }
>('dashboard/fetchProfitTrend', async (period, { rejectWithValue }) => {
  try {
    const response = await reportsApi.getTrends('profit', period);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch profit trend');
  }
});

export const initializeDashboard = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('dashboard/initialize', async (_, { dispatch, rejectWithValue }) => {
  try {
    // Fetch all dashboard data in parallel
    await Promise.all([
      dispatch(fetchDashboardSummary()).unwrap(),
      dispatch(fetchRecentActivity(10)).unwrap(),
      // dispatch(fetchSalesTrend('week')).unwrap(),
    ]);

    // Get last 7 days transactions
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    await dispatch(fetchDailyTransactions({ startDate, endDate })).unwrap();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to initialize dashboard');
  }
});

export const refreshDashboard = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('dashboard/refresh', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const state = getState() as { dashboard: DashboardState };
    const period = state.dashboard.selectedTrendPeriod;

    // Refresh all data in parallel
    await Promise.all([
      dispatch(fetchDashboardSummary()).unwrap(),
      dispatch(fetchRecentActivity(10)).unwrap(),
      // dispatch(fetchSalesTrend(period)).unwrap(),
    ]);

    // Refresh last 7 days transactions
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    await dispatch(fetchDailyTransactions({ startDate, endDate })).unwrap();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to refresh dashboard');
  }
});

// Fetch counts for directory screen
export const fetchDirectoryCounts = createAsyncThunk<
  {
    customersCount: number;
    suppliersCount: number;
    productsCount: number;
    bankAccountsCount: number;
    pendingSuppliersCount: number;
  },
  void,
  { rejectValue: string }
>('dashboard/fetchDirectoryCounts', async (_, { rejectWithValue }) => {
  try {
    // Import APIs dynamically to avoid circular dependencies
    const { customersApi } = await import('../../services/api/customers');
    const { suppliersApi } = await import('../../services/api/suppliers');
    const { productsApi } = await import('../../services/api/products');
    const { bankAccountsApi } = await import('../../services/api/bankAccounts');

    // Fetch all counts in parallel
    const [customers, suppliers, products, bankAccounts] = await Promise.all([
      customersApi.getAll({ limit: 1 }),
      suppliersApi.getAll({ limit: 1 }),
      productsApi.getAll({ limit: 1 }),
      bankAccountsApi.getAll(),
    ]);

    return {
      customersCount: customers.total || 0,
      suppliersCount: suppliers.total || 0,
      productsCount: products.total || 0,
      bankAccountsCount: (bankAccounts as any).total || bankAccounts.data?.length || 0,
      pendingSuppliersCount: 0, // Would need to be calculated from suppliers with payables
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch directory counts');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearDashboard: state => {
      Object.assign(state, initialState);
    },
    setSelectedTrendPeriod: (
      state,
      action: PayloadAction<'week' | 'month' | 'year'>,
    ) => {
      state.selectedTrendPeriod = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Initialize Dashboard
      .addCase(initializeDashboard.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeDashboard.fulfilled, state => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(initializeDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to initialize dashboard';
      })

      // Fetch Summary
      .addCase(fetchDashboardSummary.pending, state => {
        if (!state.summary) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch summary';
      })

      // Recent Activity
      .addCase(fetchRecentActivity.pending, state => {
        if (state.recentActivity.length === 0) {
          state.isLoading = true;
        }
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch recent activity';
      })

      // Daily Transactions
      .addCase(fetchDailyTransactions.fulfilled, (state, action) => {
        state.dailyTransactions = action.payload;
      })

      // Sales Trend
      .addCase(fetchSalesTrend.fulfilled, (state, action) => {
        state.trends.sales = action.payload;
      })

      // Purchases Trend
      .addCase(fetchPurchasesTrend.fulfilled, (state, action) => {
        state.trends.purchases = action.payload;
      })

      // Profit Trend
      .addCase(fetchProfitTrend.fulfilled, (state, action) => {
        state.trends.profit = action.payload;
      })

      // Refresh Dashboard
      .addCase(refreshDashboard.pending, state => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, state => {
        state.isRefreshing = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload || 'Failed to refresh dashboard';
      })

      // Fetch Directory Counts
      .addCase(fetchDirectoryCounts.fulfilled, (state, action) => {
        state.customersCount = action.payload.customersCount;
        state.suppliersCount = action.payload.suppliersCount;
        state.productsCount = action.payload.productsCount;
        state.bankAccountsCount = action.payload.bankAccountsCount;
        state.pendingSuppliersCount = action.payload.pendingSuppliersCount;
      })
      .addCase(fetchDirectoryCounts.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch directory counts';
      });
  },
});

export const { clearError, clearDashboard, setSelectedTrendPeriod } =
  dashboardSlice.actions;

// Selectors
export const selectDashboardSummary = (state: { dashboard: DashboardState }) =>
  state.dashboard.summary;
export const selectRecentActivity = (state: { dashboard: DashboardState }) =>
  state.dashboard.recentActivity;
export const selectDailyTransactions = (state: { dashboard: DashboardState }) =>
  state.dashboard.dailyTransactions;
export const selectSalesTrend = (state: { dashboard: DashboardState }) =>
  state.dashboard.trends.sales;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.isLoading;
export const selectDashboardRefreshing = (state: {
  dashboard: DashboardState;
}) => state.dashboard.isRefreshing;
export const selectDashboardError = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;
export const selectLastUpdated = (state: { dashboard: DashboardState }) =>
  state.dashboard.lastUpdated;
export const selectDirectoryCounts = (state: { dashboard: DashboardState }) => ({
  customersCount: state.dashboard.customersCount,
  suppliersCount: state.dashboard.suppliersCount,
  productsCount: state.dashboard.productsCount,
  bankAccountsCount: state.dashboard.bankAccountsCount,
  pendingSuppliersCount: state.dashboard.pendingSuppliersCount,
});

export default dashboardSlice.reducer;
