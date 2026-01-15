import apiClient, { PaginatedResponse } from './client';

// Types
export type ExpensePaymentMethod = 'cash' | 'bank' | 'wallet' | 'card' | 'credit';
export type ExpenseStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'reimbursed';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  is_active: boolean;
  parent_id?: string;
  budget_limit?: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  reference_number: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  status: ExpenseStatus;
  date: string;
  vendor_name?: string;
  bill_number?: string;
  description?: string;
  notes?: string;
  bank_account_id?: string;
  bank_account_name?: string;
  wallet_id?: string;
  wallet_name?: string;
  bill_photo_url?: string;
  is_recurring: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateExpensePayload {
  category_id: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  date: string;
  vendor_name?: string;
  bill_number?: string;
  description?: string;
  notes?: string;
  bank_account_id?: string;
  wallet_id?: string;
  bill_photo_url?: string;
  is_recurring?: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

export interface UpdateExpensePayload {
  category_id?: string;
  amount?: number;
  payment_method?: ExpensePaymentMethod;
  date?: string;
  vendor_name?: string;
  bill_number?: string;
  description?: string;
  notes?: string;
  status?: ExpenseStatus;
  bill_photo_url?: string;
  tags?: string[];
}

export interface CreateCategoryPayload {
  name: string;
  icon: string;
  color: string;
  description?: string;
  parent_id?: string;
  budget_limit?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  is_active?: boolean;
  budget_limit?: number;
}

export interface ExpenseFilters {
  category_id?: string;
  payment_method?: ExpensePaymentMethod;
  status?: ExpenseStatus;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  vendor_name?: string;
  search?: string;
  is_recurring?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'date' | 'amount' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ExpenseSummary {
  total_expenses: number;
  expense_count: number;
  by_category: {
    category_id: string;
    category_name: string;
    category_icon: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  by_payment_method: {
    method: ExpensePaymentMethod;
    total: number;
    count: number;
  }[];
  average_expense: number;
  largest_expense: number;
}

// Mock Data (for development)
const mockCategories: ExpenseCategory[] = [
  {
    id: 'cat-rent',
    name: 'Rent',
    icon: '🏠',
    color: '#FF3B30',
    description: 'Office/Shop rent expenses',
    is_active: true,
    budget_limit: 50000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-electricity',
    name: 'Electricity',
    icon: '⚡',
    color: '#FF9500',
    description: 'Electricity bills',
    is_active: true,
    budget_limit: 15000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-water',
    name: 'Water',
    icon: '💧',
    color: '#007AFF',
    description: 'Water utility bills',
    is_active: true,
    budget_limit: 5000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-phone',
    name: 'Phone/Internet',
    icon: '📞',
    color: '#5856D6',
    description: 'Phone and internet bills',
    is_active: true,
    budget_limit: 10000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-salaries',
    name: 'Salaries',
    icon: '👥',
    color: '#34C759',
    description: 'Employee salaries',
    is_active: true,
    budget_limit: 200000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: '🚗',
    color: '#FF2D55',
    description: 'Transportation and fuel',
    is_active: true,
    budget_limit: 20000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-food',
    name: 'Food/Tea',
    icon: '🍽️',
    color: '#FF9500',
    description: 'Food and refreshments',
    is_active: true,
    budget_limit: 15000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-supplies',
    name: 'Office Supplies',
    icon: '📦',
    color: '#8E8E93',
    description: 'Office supplies and stationery',
    is_active: true,
    budget_limit: 10000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-repairs',
    name: 'Repairs & Maintenance',
    icon: '🔧',
    color: '#5856D6',
    description: 'Equipment and facility repairs',
    is_active: true,
    budget_limit: 25000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-marketing',
    name: 'Marketing',
    icon: '📢',
    color: '#FF2D55',
    description: 'Advertising and marketing',
    is_active: true,
    budget_limit: 30000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-professional',
    name: 'Professional Fees',
    icon: '💼',
    color: '#007AFF',
    description: 'Legal, accounting, and consulting',
    is_active: true,
    budget_limit: 20000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-bank',
    name: 'Bank Charges',
    icon: '🏦',
    color: '#34C759',
    description: 'Bank fees and charges',
    is_active: true,
    budget_limit: 5000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-other',
    name: 'Other',
    icon: '📚',
    color: '#8E8E93',
    description: 'Miscellaneous expenses',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    reference_number: 'EXP-2024-001',
    category_id: 'cat-electricity',
    category_name: 'Electricity',
    category_icon: '⚡',
    amount: 7800,
    payment_method: 'bank',
    status: 'paid',
    date: '2024-07-22',
    vendor_name: 'K-Electric',
    bill_number: 'KE-2024-7890',
    description: 'Electricity bill for July',
    bank_account_id: 'bank-1',
    bank_account_name: 'HBL Business Account',
    is_recurring: true,
    recurrence_interval: 'monthly',
    created_at: '2024-07-22T10:00:00Z',
    updated_at: '2024-07-22T10:00:00Z',
  },
  {
    id: 'exp-2',
    reference_number: 'EXP-2024-002',
    category_id: 'cat-rent',
    category_name: 'Rent',
    category_icon: '🏠',
    amount: 45000,
    payment_method: 'bank',
    status: 'paid',
    date: '2024-07-05',
    vendor_name: 'Property Owner',
    description: 'Shop rent for July',
    bank_account_id: 'bank-1',
    bank_account_name: 'HBL Business Account',
    is_recurring: true,
    recurrence_interval: 'monthly',
    created_at: '2024-07-05T09:00:00Z',
    updated_at: '2024-07-05T09:00:00Z',
  },
  {
    id: 'exp-3',
    reference_number: 'EXP-2024-003',
    category_id: 'cat-food',
    category_name: 'Food/Tea',
    category_icon: '🍽️',
    amount: 1500,
    payment_method: 'cash',
    status: 'paid',
    date: '2024-07-20',
    description: 'Staff lunch',
    is_recurring: false,
    created_at: '2024-07-20T13:00:00Z',
    updated_at: '2024-07-20T13:00:00Z',
  },
  {
    id: 'exp-4',
    reference_number: 'EXP-2024-004',
    category_id: 'cat-transport',
    category_name: 'Transport',
    category_icon: '🚗',
    amount: 3500,
    payment_method: 'cash',
    status: 'paid',
    date: '2024-07-19',
    vendor_name: 'Shell Petrol',
    description: 'Fuel for delivery vehicle',
    is_recurring: false,
    created_at: '2024-07-19T11:00:00Z',
    updated_at: '2024-07-19T11:00:00Z',
  },
  {
    id: 'exp-5',
    reference_number: 'EXP-2024-005',
    category_id: 'cat-phone',
    category_name: 'Phone/Internet',
    category_icon: '📞',
    amount: 5500,
    payment_method: 'wallet',
    status: 'paid',
    date: '2024-07-15',
    vendor_name: 'PTCL',
    bill_number: 'PTCL-2024-456',
    description: 'Internet bill for July',
    wallet_id: 'bank-3',
    wallet_name: 'JazzCash',
    is_recurring: true,
    recurrence_interval: 'monthly',
    created_at: '2024-07-15T10:00:00Z',
    updated_at: '2024-07-15T10:00:00Z',
  },
  {
    id: 'exp-6',
    reference_number: 'EXP-2024-006',
    category_id: 'cat-supplies',
    category_name: 'Office Supplies',
    category_icon: '📦',
    amount: 2200,
    payment_method: 'cash',
    status: 'paid',
    date: '2024-07-18',
    vendor_name: 'Office Mart',
    description: 'Printer paper and ink',
    is_recurring: false,
    created_at: '2024-07-18T14:00:00Z',
    updated_at: '2024-07-18T14:00:00Z',
  },
  {
    id: 'exp-7',
    reference_number: 'EXP-2024-007',
    category_id: 'cat-bank',
    category_name: 'Bank Charges',
    category_icon: '🏦',
    amount: 350,
    payment_method: 'bank',
    status: 'paid',
    date: '2024-07-01',
    description: 'Monthly bank fee',
    bank_account_id: 'bank-1',
    bank_account_name: 'HBL Business Account',
    is_recurring: true,
    recurrence_interval: 'monthly',
    created_at: '2024-07-01T08:00:00Z',
    updated_at: '2024-07-01T08:00:00Z',
  },
];

// Helper for cash balance
let mockCashBalance = 125000;

// API Service
export const expensesApi = {
  // ============ EXPENSE OPERATIONS ============

  // Get all expenses with filters
  getAll: async (filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> => {
    // Mock implementation
    let filteredExpenses = [...mockExpenses];

    if (filters?.category_id) {
      filteredExpenses = filteredExpenses.filter((e) => e.category_id === filters.category_id);
    }
    if (filters?.payment_method) {
      filteredExpenses = filteredExpenses.filter((e) => e.payment_method === filters.payment_method);
    }
    if (filters?.status) {
      filteredExpenses = filteredExpenses.filter((e) => e.status === filters.status);
    }
    if (filters?.start_date) {
      filteredExpenses = filteredExpenses.filter((e) => e.date >= filters.start_date!);
    }
    if (filters?.end_date) {
      filteredExpenses = filteredExpenses.filter((e) => e.date <= filters.end_date!);
    }
    if (filters?.min_amount !== undefined) {
      filteredExpenses = filteredExpenses.filter((e) => e.amount >= filters.min_amount!);
    }
    if (filters?.max_amount !== undefined) {
      filteredExpenses = filteredExpenses.filter((e) => e.amount <= filters.max_amount!);
    }
    if (filters?.vendor_name) {
      filteredExpenses = filteredExpenses.filter((e) =>
        e.vendor_name?.toLowerCase().includes(filters.vendor_name!.toLowerCase())
      );
    }
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredExpenses = filteredExpenses.filter(
        (e) =>
          e.category_name.toLowerCase().includes(searchTerm) ||
          e.vendor_name?.toLowerCase().includes(searchTerm) ||
          e.description?.toLowerCase().includes(searchTerm) ||
          e.reference_number.toLowerCase().includes(searchTerm)
      );
    }
    if (filters?.is_recurring !== undefined) {
      filteredExpenses = filteredExpenses.filter((e) => e.is_recurring === filters.is_recurring);
    }

    // Sorting
    if (filters?.sort_by === 'date') {
      filteredExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filters?.sort_by === 'amount') {
      filteredExpenses.sort((a, b) => a.amount - b.amount);
    } else if (filters?.sort_by === 'created_at') {
      filteredExpenses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    if (filters?.sort_order === 'desc') {
      filteredExpenses.reverse();
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      data: filteredExpenses.slice(startIndex, endIndex),
      total: filteredExpenses.length,
      page,
      limit,
      totalPages: Math.ceil(filteredExpenses.length / limit),
    };
    // return apiClient.get<PaginatedResponse<Expense>>('/expenses', filters);
  },

  // Get expense by ID
  getById: async (id: string): Promise<Expense> => {
    const expense = mockExpenses.find((e) => e.id === id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
    // return apiClient.get<Expense>(`/expenses/${id}`);
  },

  // Create expense
  create: async (payload: CreateExpensePayload): Promise<Expense> => {
    const category = mockCategories.find((c) => c.id === payload.category_id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check cash balance if paying with cash
    if (payload.payment_method === 'cash' && payload.amount > mockCashBalance) {
      throw new Error('Insufficient cash in hand');
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      reference_number: `EXP-${new Date().getFullYear()}-${(mockExpenses.length + 1).toString().padStart(3, '0')}`,
      category_id: payload.category_id,
      category_name: category.name,
      category_icon: category.icon,
      amount: payload.amount,
      payment_method: payload.payment_method,
      status: 'paid',
      date: payload.date,
      vendor_name: payload.vendor_name,
      bill_number: payload.bill_number,
      description: payload.description,
      notes: payload.notes,
      bank_account_id: payload.bank_account_id,
      wallet_id: payload.wallet_id,
      bill_photo_url: payload.bill_photo_url,
      is_recurring: payload.is_recurring || false,
      recurrence_interval: payload.recurrence_interval,
      tags: payload.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Deduct from cash if paying with cash
    if (payload.payment_method === 'cash') {
      mockCashBalance -= payload.amount;
    }

    mockExpenses.unshift(newExpense);

    return newExpense;
    // return apiClient.post<Expense>('/expenses', payload);
  },

  // Update expense
  update: async (id: string, payload: UpdateExpensePayload): Promise<Expense> => {
    const index = mockExpenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Expense not found');
    }

    // Update category info if category_id changed
    if (payload.category_id) {
      const category = mockCategories.find((c) => c.id === payload.category_id);
      if (category) {
        mockExpenses[index].category_name = category.name;
        mockExpenses[index].category_icon = category.icon;
      }
    }

    mockExpenses[index] = {
      ...mockExpenses[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };

    return mockExpenses[index];
    // return apiClient.patch<Expense>(`/expenses/${id}`, payload);
  },

  // Delete expense
  delete: async (id: string): Promise<void> => {
    const index = mockExpenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Expense not found');
    }

    // Refund cash if it was a cash payment
    const expense = mockExpenses[index];
    if (expense.payment_method === 'cash') {
      mockCashBalance += expense.amount;
    }

    mockExpenses.splice(index, 1);
    // return apiClient.delete<void>(`/expenses/${id}`);
  },

  // Get recent expenses
  getRecent: async (limit?: number): Promise<Expense[]> => {
    return mockExpenses
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit || 5);
    // const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', {
    //   limit: limit || 5,
    //   sort_by: 'created_at',
    //   sort_order: 'desc',
    // });
    // return response.data;
  },

  // Get expenses by category
  getByCategory: async (categoryId: string, limit?: number): Promise<Expense[]> => {
    return mockExpenses
      .filter((e) => e.category_id === categoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit || 10);
    // const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', {
    //   category_id: categoryId,
    //   limit: limit || 10,
    // });
    // return response.data;
  },

  // Get recurring expenses
  getRecurring: async (): Promise<Expense[]> => {
    return mockExpenses.filter((e) => e.is_recurring);
    // const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { is_recurring: true });
    // return response.data;
  },

  // Get expense summary
  getSummary: async (startDate?: string, endDate?: string): Promise<ExpenseSummary> => {
    let expenses = [...mockExpenses];

    if (startDate) {
      expenses = expenses.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter((e) => e.date <= endDate);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory = mockCategories
      .map((cat) => {
        const catExpenses = expenses.filter((e) => e.category_id === cat.id);
        const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
        return {
          category_id: cat.id,
          category_name: cat.name,
          category_icon: cat.icon,
          total,
          count: catExpenses.length,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        };
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.total - a.total);

    // Group by payment method
    const paymentMethods: ExpensePaymentMethod[] = ['cash', 'bank', 'wallet', 'card', 'credit'];
    const byPaymentMethod = paymentMethods
      .map((method) => {
        const methodExpenses = expenses.filter((e) => e.payment_method === method);
        return {
          method,
          total: methodExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: methodExpenses.length,
        };
      })
      .filter((m) => m.count > 0);

    return {
      total_expenses: totalExpenses,
      expense_count: expenses.length,
      by_category: byCategory,
      by_payment_method: byPaymentMethod,
      average_expense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      largest_expense: expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0,
    };
    // return apiClient.get<ExpenseSummary>('/expenses/summary', { start_date: startDate, end_date: endDate });
  },

  // ============ CATEGORY OPERATIONS ============

  // Get all categories
  getCategories: async (): Promise<ExpenseCategory[]> => {
    return mockCategories.filter((c) => c.is_active);
    // return apiClient.get<ExpenseCategory[]>('/expense-categories');
  },

  // Get all categories including inactive
  getAllCategories: async (): Promise<ExpenseCategory[]> => {
    return mockCategories;
    // return apiClient.get<ExpenseCategory[]>('/expense-categories', { include_inactive: true });
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<ExpenseCategory> => {
    const category = mockCategories.find((c) => c.id === id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
    // return apiClient.get<ExpenseCategory>(`/expense-categories/${id}`);
  },

  // Create category
  createCategory: async (payload: CreateCategoryPayload): Promise<ExpenseCategory> => {
    const newCategory: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      ...payload,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
    // return apiClient.post<ExpenseCategory>('/expense-categories', payload);
  },

  // Update category
  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<ExpenseCategory> => {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    mockCategories[index] = {
      ...mockCategories[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return mockCategories[index];
    // return apiClient.patch<ExpenseCategory>(`/expense-categories/${id}`, payload);
  },

  // Delete category (soft delete)
  deleteCategory: async (id: string): Promise<void> => {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    mockCategories[index].is_active = false;
    mockCategories[index].updated_at = new Date().toISOString();
    // return apiClient.delete<void>(`/expense-categories/${id}`);
  },

  // Get category with expense totals
  getCategoryTotals: async (
    startDate?: string,
    endDate?: string
  ): Promise<{ category: ExpenseCategory; total: number; count: number }[]> => {
    let expenses = [...mockExpenses];

    if (startDate) {
      expenses = expenses.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter((e) => e.date <= endDate);
    }

    return mockCategories
      .filter((c) => c.is_active)
      .map((category) => {
        const catExpenses = expenses.filter((e) => e.category_id === category.id);
        return {
          category,
          total: catExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: catExpenses.length,
        };
      })
      .sort((a, b) => b.total - a.total);
    // return apiClient.get<...>('/expense-categories/totals', { start_date: startDate, end_date: endDate });
  },

  // Get average expense for category (useful for variance)
  getCategoryAverage: async (categoryId: string, months?: number): Promise<{ average: number; last_month: number }> => {
    const now = new Date();
    const monthsBack = months || 6;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString().split('T')[0];

    const expenses = mockExpenses.filter(
      (e) => e.category_id === categoryId && e.date >= startDate
    );

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = expenses.length > 0 ? total / expenses.length : 0;

    // Get last month's total
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const lastMonthExpenses = mockExpenses.filter(
      (e) => e.category_id === categoryId && e.date >= lastMonthStart && e.date <= lastMonthEnd
    );
    const lastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return { average, last_month: lastMonth };
    // return apiClient.get<...>(`/expense-categories/${categoryId}/average`, { months });
  },
};

export default expensesApi;
