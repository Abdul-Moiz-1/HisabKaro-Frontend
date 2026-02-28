import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  expensesApi,
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseSummary,
  CreateExpensePayload,
  UpdateExpensePayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../services/api/expenses';

interface ExpensesState {
  expenses: Expense[];
  recentExpenses: Expense[];
  recurringExpenses: Expense[];
  selectedExpense: Expense | null;
  categories: ExpenseCategory[];
  selectedCategory: ExpenseCategory | null;
  summary: ExpenseSummary | null;
  categoryAverages: { [categoryId: string]: { average: number; last_month: number } };
  isLoading: boolean;
  isCategoriesLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ExpensesState = {
  expenses: [],
  recentExpenses: [],
  recurringExpenses: [],
  selectedExpense: null,
  categories: [],
  selectedCategory: null,
  summary: null,
  categoryAverages: {},
  isLoading: false,
  isCategoriesLoading: false,
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
};

// Async Thunks - Expenses
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch expense');
    }
  }
);

export const fetchRecentExpenses = createAsyncThunk(
  'expenses/fetchRecent',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getRecent(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent expenses');
    }
  }
);

export const fetchRecurringExpenses = createAsyncThunk(
  'expenses/fetchRecurring',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getRecurring();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recurring expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (payload: CreateExpensePayload, { rejectWithValue }) => {
    try {
      const response = await expensesApi.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, payload }: { id: string; payload: UpdateExpensePayload }, { rejectWithValue }) => {
    try {
      const response = await expensesApi.update(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await expensesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete expense');
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchSummary',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await expensesApi.getSummary(startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch summary');
    }
  }
);

// Async Thunks - Categories
export const fetchCategories = createAsyncThunk(
  'expenses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getCategories();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'expenses/fetchCategoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getCategoryById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'expenses/createCategory',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await expensesApi.createCategory(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'expenses/updateCategory',
  async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }, { rejectWithValue }) => {
    try {
      const response = await expensesApi.updateCategory(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'expenses/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await expensesApi.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete category');
    }
  }
);

export const fetchCategoryAverage = createAsyncThunk(
  'expenses/fetchCategoryAverage',
  async ({ categoryId, months }: { categoryId: string; months?: number }, { rejectWithValue }) => {
    try {
      const response = await expensesApi.getCategoryAverage(categoryId, months);
      return { categoryId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category average');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ExpenseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    },
    setSelectedCategory: (state, action: PayloadAction<ExpenseCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.selectedExpense = action.payload;
      })

      // Fetch recent
      .addCase(fetchRecentExpenses.fulfilled, (state, action) => {
        state.recentExpenses = action.payload;
      })

      // Fetch recurring
      .addCase(fetchRecurringExpenses.fulfilled, (state, action) => {
        state.recurringExpenses = action.payload;
      })

      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.expenses.unshift(action.payload);
        state.recentExpenses.unshift(action.payload);
        if (state.recentExpenses.length > 5) {
          state.recentExpenses.pop();
        }
        if (action.payload.is_recurring) {
          state.recurringExpenses.push(action.payload);
        }
        state.pagination.total += 1;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        const recentIndex = state.recentExpenses.findIndex((e) => e.id === action.payload.id);
        if (recentIndex !== -1) {
          state.recentExpenses[recentIndex] = action.payload;
        }
        const recurringIndex = state.recurringExpenses.findIndex((e) => e.id === action.payload.id);
        if (action.payload.is_recurring) {
          if (recurringIndex !== -1) {
            state.recurringExpenses[recurringIndex] = action.payload;
          } else {
            state.recurringExpenses.push(action.payload);
          }
        } else if (recurringIndex !== -1) {
          state.recurringExpenses.splice(recurringIndex, 1);
        }
        if (state.selectedExpense?.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })

      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
        state.recentExpenses = state.recentExpenses.filter((e) => e.id !== action.payload);
        state.recurringExpenses = state.recurringExpenses.filter((e) => e.id !== action.payload);
        if (state.selectedExpense?.id === action.payload) {
          state.selectedExpense = null;
        }
        state.pagination.total -= 1;
      })

      // Summary
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isCategoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.selectedCategory = action.payload;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload);
        if (index !== -1) {
          state.categories[index].is_active = false;
        }
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })

      // Category average
      .addCase(fetchCategoryAverage.fulfilled, (state, action) => {
        state.categoryAverages[action.payload.categoryId] = {
          average: action.payload.average,
          last_month: action.payload.last_month,
        };
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedExpense,
  clearSelectedExpense,
  setSelectedCategory,
  clearSelectedCategory,
  clearError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
