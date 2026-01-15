import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  outstanding_balance: number;
  total_sales: number;
  total_payments: number;
  last_sale_date?: string;
  last_sale_amount?: number;
  is_walk_in?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatement {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  openingBalance?: number;
  creditPeriodDays?: number;
}

export interface UpdateCustomerPayload {
  name: string;
  phoneNumber: string;
  email?: string;
  creditPeriodDays?: number;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  min_balance?: number;
  max_balance?: number;
  page?: number;
  limit?: number;
}

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust_001',
    name: 'Ahmed Electronics',
    phone: '+923001234567',
    email: 'ahmed@electronics.pk',
    address: 'Shop 15, Saddar',
    city: 'Karachi',
    outstanding_balance: 125000,
    total_sales: 2850000,
    total_payments: 2725000,
    last_sale_date: '2025-01-05',
    last_sale_amount: 75000,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-01-05T14:30:00Z',
  },
  {
    id: 'cust_002',
    name: 'Karachi Traders',
    phone: '+923009876543',
    email: 'info@karachitraders.com',
    address: 'Gulshan-e-Iqbal, Block 5',
    city: 'Karachi',
    outstanding_balance: 85000,
    total_sales: 1580000,
    total_payments: 1495000,
    last_sale_date: '2025-01-03',
    last_sale_amount: 45000,
    created_at: '2024-03-20T09:00:00Z',
    updated_at: '2025-01-03T11:00:00Z',
  },
  {
    id: 'cust_003',
    name: 'Bismillah Store',
    phone: '+923007654321',
    address: 'Model Town',
    city: 'Lahore',
    outstanding_balance: 45000,
    total_sales: 980000,
    total_payments: 935000,
    last_sale_date: '2024-12-28',
    last_sale_amount: 32000,
    created_at: '2024-06-10T08:00:00Z',
    updated_at: '2024-12-28T16:00:00Z',
  },
  {
    id: 'cust_004',
    name: 'Imran Bhai',
    phone: '+923331234567',
    address: 'Defence, Phase 2',
    city: 'Karachi',
    outstanding_balance: 0,
    total_sales: 520000,
    total_payments: 520000,
    last_sale_date: '2025-01-02',
    last_sale_amount: 28000,
    created_at: '2024-04-05T12:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'cust_005',
    name: 'Shahid General Store',
    phone: '+923211234567',
    email: 'shahid.store@gmail.com',
    address: 'Peoples Colony',
    city: 'Faisalabad',
    outstanding_balance: 175000,
    total_sales: 1250000,
    total_payments: 1075000,
    last_sale_date: '2025-01-04',
    last_sale_amount: 95000,
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2025-01-04T15:00:00Z',
  },
  {
    id: 'cust_006',
    name: 'Faisal Electronics Hub',
    phone: '+923451234567',
    address: 'Blue Area',
    city: 'Islamabad',
    outstanding_balance: 225000,
    total_sales: 1850000,
    total_payments: 1625000,
    last_sale_date: '2025-01-06',
    last_sale_amount: 120000,
    created_at: '2024-05-10T09:00:00Z',
    updated_at: '2025-01-06T12:00:00Z',
  },
];

// Walk-in customer constant
export const WALK_IN_CUSTOMER: Customer = {
  id: 'walk-in',
  name: 'Walk-in Customer',
  outstanding_balance: 0,
  total_sales: 0,
  total_payments: 0,
  is_walk_in: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Check if we're in development/mock mode
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

// Helper function to simulate API delay
const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// API Service
export const customersApi = {
  // Get all customers with filters
  getAll: async (
    filters?: CustomerFilters,
  ): Promise<PaginatedResponse<Customer>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_CUSTOMERS];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.phone?.includes(searchLower) ||
            c.city?.toLowerCase().includes(searchLower),
        );
      }

      // Apply city filter
      if (filters?.city) {
        filtered = filtered.filter(
          c => c.city?.toLowerCase() === filters.city?.toLowerCase(),
        );
      }

      // Apply balance filters
      if (filters?.min_balance !== undefined) {
        filtered = filtered.filter(
          c => c.outstanding_balance >= (filters.min_balance || 0),
        );
      }
      if (filters?.max_balance !== undefined) {
        filtered = filtered.filter(
          c => c.outstanding_balance <= (filters.max_balance || Infinity),
        );
      }

      // Sort
      // const sortBy = filters?.sort_by || 'name';
      // const sortOrder = filters?.sort_order || 'asc';
      // filtered.sort((a, b) => {
      //   const aVal = a[sortBy as keyof Customer] || '';
      //   const bVal = b[sortBy as keyof Customer] || '';
      //   if (typeof aVal === 'number' && typeof bVal === 'number') {
      //     return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      //   }
      //   if (sortOrder === 'asc') {
      //     return String(aVal) > String(bVal) ? 1 : -1;
      //   }
      //   return String(aVal) < String(bVal) ? 1 : -1;
      // });

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
    return apiClient.get<PaginatedResponse<Customer>>('/customers', filters);
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      if (id === 'walk-in') {
        return WALK_IN_CUSTOMER;
      }
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return customer;
    }
    const response = await apiClient.get<{ data: Customer }>(
      `/customers/${id}`,
    );
    return response.data;
  },

  // Create new customer
  create: async (
    payload: CreateCustomerPayload,
  ): Promise<{ data: Customer }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(400);
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phoneNumber,
        address: payload.address,
        city: payload.city,
        outstanding_balance: payload.openingBalance || 0,
        total_sales: 0,
        total_payments: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_CUSTOMERS.unshift(newCustomer);
      return { data: newCustomer };
    }
    return apiClient.post<{ data: Customer }>('/customers', payload);
  },

  // Update customer
  update: async (
    id: string,
    payload: UpdateCustomerPayload,
  ): Promise<Customer> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Customer not found');
      }
      MOCK_CUSTOMERS[index] = {
        ...MOCK_CUSTOMERS[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return MOCK_CUSTOMERS[index];
    }
    return apiClient.patch<Customer>(`/customers/${id}`, payload);
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_CUSTOMERS.splice(index, 1);
      }
      return;
    }
    return apiClient.delete<void>(`/customers/${id}`);
  },

  // Get customer balance
  getBalance: async (id: string): Promise<{ balance: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      return { balance: customer?.outstanding_balance || 0 };
    }
    return apiClient.get<{ balance: number }>(`/customers/${id}/balance`);
  },

  // Get customer statement
  getStatement: async (
    id: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CustomerStatement[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      // Generate mock statement
      const statements: CustomerStatement[] = [
        {
          id: '1',
          date: '2025-01-05',
          type: 'invoice',
          reference: 'INV-2025-001',
          description: 'Sale of electronics items',
          debit: 75000,
          credit: 0,
          balance: 125000,
        },
        {
          id: '2',
          date: '2025-01-03',
          type: 'payment',
          reference: 'RCV-2025-012',
          description: 'Payment received via bank',
          debit: 0,
          credit: 50000,
          balance: 50000,
        },
        {
          id: '3',
          date: '2024-12-28',
          type: 'invoice',
          reference: 'INV-2024-156',
          description: 'Sale of cables',
          debit: 45000,
          credit: 0,
          balance: 100000,
        },
      ];
      return statements;
    }
    const response = await apiClient.get<{ data: CustomerStatement[] }>(
      `/customers/${id}/statement`,
      {
        fromDate: startDate,
        toDate: endDate,
      },
    );
    return response.data;
  },

  // Search customers
  search: async (query: string, limit?: number): Promise<Customer[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const searchLower = query.toLowerCase();
      return MOCK_CUSTOMERS.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone?.includes(query) ||
          c.city?.toLowerCase().includes(searchLower),
      ).slice(0, limit || 10);
    }
    const response = await apiClient.get<PaginatedResponse<Customer>>(
      '/customers',
      {
        search: query,
        limit: limit || 10,
      },
    );
    return response.data;
  },

  // Get frequent customers (most transactions)
  getFrequent: async (limit?: number): Promise<Customer[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return [...MOCK_CUSTOMERS]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, limit || 5);
    }
    return apiClient.get<Customer[]>('/customers/frequent', {
      limit: limit || 5,
    });
  },

  // Get recent customers (with recent sales)
  getRecent: async (limit?: number): Promise<Customer[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return [...MOCK_CUSTOMERS]
        .filter(c => c.last_sale_date)
        .sort(
          (a, b) =>
            new Date(b.last_sale_date!).getTime() -
            new Date(a.last_sale_date!).getTime(),
        )
        .slice(0, limit || 10);
    }
    const response = await apiClient.get<PaginatedResponse<Customer>>(
      '/customers',
      {
        // sort_by: 'created_at',
        // sort_order: 'desc',
        limit: limit || 10,
      },
    );
    return response.data;
  },

  // Get customers with outstanding balance
  getWithReceivables: async (): Promise<Customer[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return MOCK_CUSTOMERS.filter(c => c.outstanding_balance > 0).sort(
        (a, b) => b.outstanding_balance - a.outstanding_balance,
      );
    }
    const response = await apiClient.get<PaginatedResponse<Customer>>(
      '/customers',
      {
        min_balance: 1,
        sort_by: 'outstanding_balance',
        sort_order: 'desc',
      },
    );
    return response.data;
  },

  // Get total receivables summary
  getTotalReceivables: async (): Promise<{ total: number; count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const customersWithReceivables = MOCK_CUSTOMERS.filter(
        c => c.outstanding_balance > 0,
      );
      const total = customersWithReceivables.reduce(
        (sum, c) => sum + c.outstanding_balance,
        0,
      );
      return { total, count: customersWithReceivables.length };
    }
    return apiClient.get<{ total: number; count: number }>(
      '/customers/receivables-summary',
    );
  },
};

export default customersApi;
