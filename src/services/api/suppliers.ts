import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  payable_balance: number;
  total_purchases: number;
  total_payments: number;
  last_purchase_date?: string;
  last_purchase_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierStatement {
  id: string;
  date: string;
  type: 'purchase' | 'payment' | 'credit_note' | 'debit_note';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CreateSupplierPayload {
  name: string;
  email?: string;
  phoneNumber?: string;
  openingBalance?: number;
  creditPeriodDays?: number;
}

export interface UpdateSupplierPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  creditPeriodDays?: string;
}

export interface SupplierFilters {
  search?: string;
  city?: string;
  min_balance?: number;
  max_balance?: number;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'payable_balance' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Mock Data
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_001',
    name: 'Al-Rehman Traders',
    phoneNumber: '+923001234567',
    email: 'alrehman@traders.pk',
    payable_balance: 250000,
    total_purchases: 1850000,
    total_payments: 1600000,
    last_purchase_date: '2025-01-05',
    last_purchase_amount: 120000,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-01-05T14:30:00Z',
  },
  {
    id: 'sup_002',
    name: 'Bismillah Wholesale',
    phoneNumber: '+923009876543',
    email: 'bismillah.wholesale@gmail.com',

    payable_balance: 180000,
    total_purchases: 980000,
    total_payments: 800000,
    last_purchase_date: '2025-01-03',
    last_purchase_amount: 85000,
    created_at: '2024-03-20T09:00:00Z',
    updated_at: '2025-01-03T11:00:00Z',
  },
  {
    id: 'sup_003',
    name: 'Metro Cash & Carry',
    phoneNumber: '+923007654321',
    payable_balance: 0,
    total_purchases: 450000,
    total_payments: 450000,
    last_purchase_date: '2024-12-28',
    last_purchase_amount: 95000,
    created_at: '2024-06-10T08:00:00Z',
    updated_at: '2024-12-28T16:00:00Z',
  },
  {
    id: 'sup_004',
    name: 'Pakistan Electronics',
    phoneNumber: '+923331234567',
    email: 'info@pakelectronics.com',
    payable_balance: 75000,
    total_purchases: 520000,
    total_payments: 445000,
    last_purchase_date: '2025-01-02',
    last_purchase_amount: 45000,
    created_at: '2024-04-05T12:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'sup_005',
    name: 'Habib Cables & Wires',
    phoneNumber: '+923211234567',
    payable_balance: 320000,
    total_purchases: 1200000,
    total_payments: 880000,
    last_purchase_date: '2025-01-04',
    last_purchase_amount: 180000,
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2025-01-04T15:00:00Z',
  },
];

// Check if we're in development/mock mode
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

// Helper function to simulate API delay
const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// API Service
export const suppliersApi = {
  // Get all suppliers with filters
  getAll: async (
    filters?: SupplierFilters,
  ): Promise<PaginatedResponse<Supplier>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_SUPPLIERS];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.phoneNumber?.includes(searchLower),
        );
      }

      // Apply city filter

      // Apply balance filters
      if (filters?.min_balance !== undefined) {
        filtered = filtered.filter(
          s => s.payable_balance >= (filters.min_balance || 0),
        );
      }
      if (filters?.max_balance !== undefined) {
        filtered = filtered.filter(
          s => s.payable_balance <= (filters.max_balance || Infinity),
        );
      }

      // Sort
      const sortBy = filters?.sort_by || 'name';
      const sortOrder = filters?.sort_order || 'asc';
      filtered.sort((a, b) => {
        const aVal = a[sortBy as keyof Supplier] || '';
        const bVal = b[sortBy as keyof Supplier] || '';
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

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
    return apiClient.get<PaginatedResponse<Supplier>>('/suppliers', filters);
  },

  // Get supplier by ID
  getById: async (id: string): Promise<{ data: Supplier }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      return { data: supplier };
    }
    return apiClient.get<{ data: Supplier }>(`/suppliers/${id}`);
  },

  // Create new supplier
  create: async (
    payload: CreateSupplierPayload,
  ): Promise<{ data: Supplier }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(400);
      const newSupplier: Supplier = {
        id: `sup_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        payable_balance: payload.openingBalance || 0,
        total_purchases: 0,
        total_payments: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_SUPPLIERS.unshift(newSupplier);
      return { data: newSupplier };
    }
    return apiClient.post<{ data: Supplier }>('/suppliers', payload);
  },

  // Update supplier
  update: async (
    id: string,
    payload: UpdateSupplierPayload,
  ): Promise<Supplier> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Supplier not found');
      }
      MOCK_SUPPLIERS[index] = {
        ...MOCK_SUPPLIERS[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return MOCK_SUPPLIERS[index];
    }
    return apiClient.patch<Supplier>(`/suppliers/${id}`, payload);
  },

  // Delete supplier
  delete: async (id: string): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index !== -1) {
        MOCK_SUPPLIERS.splice(index, 1);
      }
      return;
    }
    return apiClient.delete<void>(`/suppliers/${id}`);
  },

  // Get supplier payables
  getPayables: async (id: string): Promise<{ balance: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      return { balance: supplier?.payable_balance || 0 };
    }
    return apiClient.get<{ balance: number }>(`/suppliers/${id}/payables`);
  },

  // Get supplier statement
  getStatement: async (
    id: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: SupplierStatement[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      // Generate mock statement
      const statements: SupplierStatement[] = [
        {
          id: '1',
          date: '2025-01-05',
          type: 'purchase',
          reference: 'PUR-2025-001',
          description: 'Purchase of electronics items',
          debit: 120000,
          credit: 0,
          balance: 250000,
        },
        {
          id: '2',
          date: '2025-01-03',
          type: 'payment',
          reference: 'PAY-2025-012',
          description: 'Payment via bank transfer',
          debit: 0,
          credit: 50000,
          balance: 130000,
        },
        {
          id: '3',
          date: '2024-12-28',
          type: 'purchase',
          reference: 'PUR-2024-156',
          description: 'Purchase of cables',
          debit: 85000,
          credit: 0,
          balance: 180000,
        },
      ];
      return { data: statements };
    }
    return apiClient.get<{ data: SupplierStatement[] }>(
      `/suppliers/${id}/statement`,
      {
        fromDate: startDate,
        toDate: endDate,
      },
    );
  },

  // Search suppliers
  search: async (query: string, limit?: number): Promise<Supplier[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const searchLower = query.toLowerCase();
      return MOCK_SUPPLIERS.filter(
        s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.phoneNumber?.includes(query),
      ).slice(0, limit || 10);
    }
    const response = await apiClient.get<PaginatedResponse<Supplier>>(
      '/suppliers',
      {
        search: query,
        limit: limit || 10,
      },
    );
    return response.data;
  },

  // Get recent suppliers (with recent purchases)
  getRecent: async (limit?: number): Promise<Supplier[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return [...MOCK_SUPPLIERS]
        .filter(s => s.last_purchase_date)
        .sort(
          (a, b) =>
            new Date(b.last_purchase_date!).getTime() -
            new Date(a.last_purchase_date!).getTime(),
        )
        .slice(0, limit || 5);
    }
    const response = await apiClient.get<PaginatedResponse<Supplier>>(
      '/suppliers',
      {
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: limit || 5,
      },
    );
    return response.data;
  },

  // Get suppliers with outstanding balance
  getWithPayables: async (): Promise<Supplier[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return MOCK_SUPPLIERS.filter(s => s.payable_balance > 0).sort(
        (a, b) => b.payable_balance - a.payable_balance,
      );
    }
    const response = await apiClient.get<PaginatedResponse<Supplier>>(
      '/suppliers',
      {
        min_balance: 1,
        sort_by: 'payable_balance',
        sort_order: 'desc',
      },
    );
    return response.data;
  },

  // Get total payables summary
  getTotalPayables: async (): Promise<{ total: number; count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const suppliersWithPayables = MOCK_SUPPLIERS.filter(
        s => s.payable_balance > 0,
      );
      const total = suppliersWithPayables.reduce(
        (sum, s) => sum + s.payable_balance,
        0,
      );
      return { total, count: suppliersWithPayables.length };
    }
    return apiClient.get<{ total: number; count: number }>(
      '/suppliers/payables-summary',
    );
  },
};

export default suppliersApi;
