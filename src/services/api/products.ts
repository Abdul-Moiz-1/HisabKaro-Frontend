import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types
export interface Product {
  id: string;
  productCode?: string;
  name: string;
  purchase_price: number;
  sale_price: number;
  defaultPurchasePrice?: number;
  defaultSellingPrice?: number;
  isActive: boolean;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  product_count: number;
}

export interface CreateProductPayload {
  sku?: string;
  name: string;
  defaultPurchasePrice: number;
  defaultSellingPrice: number;
}

export interface UpdateProductPayload {
  productCode?: string;
  name?: string;
  defaultPurchasePrice?: number;
  defaultSellingPrice?: number;
  isActive?: boolean;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reference?: string;
  created_at: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  includeInactive?: boolean;
  low_stock?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'sale_price' | 'current_stock' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Mock Data
const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'cat_001', name: 'Electronics', product_count: 15 },
  { id: 'cat_002', name: 'Cables & Wires', product_count: 8 },
  { id: 'cat_003', name: 'Lighting', product_count: 12 },
  { id: 'cat_004', name: 'Switches & Sockets', product_count: 10 },
  { id: 'cat_005', name: 'Tools', product_count: 6 },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    sku: 'LED-BLB-001',
    name: 'LED Bulb 9W',

    purchase_price: 85,
    sale_price: 120,

    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-01-05T14:30:00Z',
  },
  {
    id: 'prod_002',
    sku: 'CBL-2.5-001',
    name: 'Electric Cable 2.5mm (100m)',
    purchase_price: 2800,
    sale_price: 3500,
    is_active: true,
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2025-01-04T11:00:00Z',
  },
  {
    id: 'prod_003',
    sku: 'SWT-MOD-001',
    name: 'Modular Switch 6A',

    purchase_price: 45,
    sale_price: 75,

    is_active: true,
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2025-01-03T16:00:00Z',
  },
  {
    id: 'prod_004',
    sku: 'FAN-CEL-001',
    name: 'Ceiling Fan 56"',

    purchase_price: 2200,
    sale_price: 2800,
    is_active: true,
    created_at: '2024-04-05T12:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'prod_005',
    sku: 'MCB-SP-001',
    name: 'MCB Single Pole 32A',
    purchase_price: 180,
    sale_price: 280,
    is_active: true,
    created_at: '2024-05-01T11:00:00Z',
    updated_at: '2025-01-04T15:00:00Z',
  },
  {
    id: 'prod_006',
    sku: 'TUB-LED-001',
    name: 'LED Tube Light 4ft',
    purchase_price: 220,
    sale_price: 350,
    is_active: true,
    created_at: '2024-06-10T14:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
  },
  {
    id: 'prod_007',
    sku: 'CBL-1.5-001',
    name: 'Electric Cable 1.5mm (100m)',
    purchase_price: 1800,
    sale_price: 2400,
    is_active: true,
    created_at: '2024-07-15T10:00:00Z',
    updated_at: '2025-01-04T11:00:00Z',
  },
  {
    id: 'prod_008',
    sku: 'SOC-16A-001',
    name: 'Socket 16A 3 Pin',

    purchase_price: 65,
    sale_price: 110,

    is_active: true,
    created_at: '2024-08-20T09:00:00Z',
    updated_at: '2025-01-03T14:00:00Z',
  },
  {
    id: 'prod_009',
    sku: 'TAPE-001',
    name: 'Insulation Tape (Roll)',

    purchase_price: 25,
    sale_price: 45,

    is_active: true,
    created_at: '2024-09-10T11:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'prod_010',
    sku: 'EXT-5M-001',
    name: 'Extension Board 5m',

    purchase_price: 450,
    sale_price: 650,

    is_active: true,
    created_at: '2024-10-05T13:00:00Z',
    updated_at: '2025-01-05T16:00:00Z',
  },
];

// Check if we're in development/mock mode
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

// Helper function to simulate API delay
const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// API Service
export const productsApi = {
  // Get all products with filters
  getAll: async (
    filters?: ProductFilters,
  ): Promise<{ data: PaginatedResponse<Product> }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_PRODUCTS];

      // Apply filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.sku?.toLowerCase().includes(searchLower),
        );
      }

      // Sort

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
    return apiClient.get<{ data: PaginatedResponse<Product> }>(
      '/products',
      filters,
    );
  },

  // Get product by ID
  getById: async (id: string): Promise<{ data: Product }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return { data: product };
    }
    return apiClient.get<{ data: Product }>(`/products/${id}`);
  },

  // Get product by barcode
  getByBarcode: async (barcode: string): Promise<Product> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const product = MOCK_PRODUCTS.find(p => p.sku === barcode);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    }
    return apiClient.get<Product>(`/products/barcode/${barcode}`);
  },

  // Create new product
  create: async (payload: CreateProductPayload): Promise<{ data: Product }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(400);
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        sku: payload.sku,
        name: payload.name,
        purchase_price: payload.defaultPurchasePrice,
        sale_price: payload.defaultSellingPrice,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_PRODUCTS.unshift(newProduct);
      return { data: newProduct };
    }
    return apiClient.post<{ data: Product }>('/products', payload);
  },

  // Update product
  update: async (
    id: string,
    payload: UpdateProductPayload,
  ): Promise<{ data: Product }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Product not found');
      }
      const category = payload.category_id
        ? MOCK_CATEGORIES.find(c => c.id === payload.category_id)
        : undefined;
      MOCK_PRODUCTS[index] = {
        ...MOCK_PRODUCTS[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return { data: MOCK_PRODUCTS[index] };
    }
    return apiClient.patch<{ data: Product }>(`/products/${id}`, payload);
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS.splice(index, 1);
      }
      return;
    }
    return apiClient.delete<void>(`/products/${id}`);
  },

  // Adjust stock
  adjustStock: async (
    id: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    reason?: string,
  ): Promise<StockAdjustment> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Product not found');
      }

      return {
        id: `adj_${Date.now()}`,
        product_id: id,
        type,
        quantity,
        reason,
        created_at: new Date().toISOString(),
      };
    }
    return apiClient.post<StockAdjustment>(`/products/${id}/stock`, {
      type,
      quantity,
      reason,
    });
  },

  // Get stock history
  getStockHistory: async (id: string): Promise<StockAdjustment[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return [
        {
          id: '1',
          product_id: id,
          type: 'in',
          quantity: 50,
          reason: 'Purchase from supplier',
          reference: 'PUR-2025-001',
          created_at: '2025-01-05T10:00:00Z',
        },
        {
          id: '2',
          product_id: id,
          type: 'out',
          quantity: 10,
          reason: 'Sale to customer',
          reference: 'INV-2025-015',
          created_at: '2025-01-04T14:00:00Z',
        },
      ];
    }
    return apiClient.get<StockAdjustment[]>(`/products/${id}/stock/history`);
  },

  // Get low stock products
  getLowStock: async (): Promise<Product[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return MOCK_PRODUCTS;
    }
    const response = await apiClient.get<PaginatedResponse<Product>>(
      '/products',
      {
        low_stock: true,
      },
    );
    return response.data;
  },

  // Search products
  search: async (query: string, limit?: number): Promise<Product[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const searchLower = query.toLowerCase();
      return MOCK_PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower),
      ).slice(0, limit || 10);
    }
    const response = await apiClient.get<PaginatedResponse<Product>>(
      '/products',
      {
        search: query,
        limit: limit || 10,
      },
    );
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<ProductCategory[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return MOCK_CATEGORIES;
    }
    return apiClient.get<ProductCategory[]>('/products/categories');
  },

  createCategory: async (
    name: string,
    parentId?: string,
  ): Promise<ProductCategory> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(300);
      const newCategory: ProductCategory = {
        id: `cat_${Date.now()}`,
        name,
        parent_id: parentId,
        product_count: 0,
      };
      MOCK_CATEGORIES.push(newCategory);
      return newCategory;
    }
    return apiClient.post<ProductCategory>('/products/categories', {
      name,
      parent_id: parentId,
    });
  },

  // Get frequently purchased products
  getFrequentlyPurchased: async (limit?: number): Promise<Product[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      // Return products sorted by some criteria (mocked as first few products)
      return MOCK_PRODUCTS.slice(0, limit || 5);
    }
    const response = await apiClient.get<PaginatedResponse<Product>>(
      '/products/frequently-purchased',
      {
        limit: limit || 5,
      },
    );
    return response.data;
  },
};

export default productsApi;
