import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus =
  | 'Draft'
  | 'Submitted'
  | 'Paid'
  | 'Partially Paid'
  | 'Cancelled';

export interface InvoiceItem {
  id?: number;
  productId?: number;
  itemName: string;
  description?: string;
  quantity: number;
  uom?: string;
  rate: number;
  amount: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  netAmount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId?: number;
  customerName?: string;
  supplierId?: number;
  supplierName?: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  remarks?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GLEntry {
  accountName: string;
  accountCode?: string;
  debit: number;
  credit: number;
}
export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export type PaymentStatus = 'paid' | 'partial' | 'pending';
export type PaymentMethod = 'Cash' | 'Bank' | 'Credit';

export interface CreateSalesInvoicePayload {
  customerId: number;
  isWalkIn: boolean;

  items: Omit<InvoiceItem, 'id' | 'amount' | 'netAmount' | 'itemName'>[];

  remarks?: string;

  // Invoice-level discount
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount?: number;

  // Direct payment (walk-in / cash invoice)
  directAmount?: number | null;
  directAmountDescription?: string | null;

  // Payment info
  paymentMethod: PaymentMethod | null;
  bankAccountId?: number | null;
  mobileWalletProviderId?: number | null;
  amountReceived?: number | null;

  creditDays?: number | null;
}

export interface CreatePurchaseInvoicePayload {
  isWalkIn: boolean;
  items: Omit<InvoiceItem, 'id' | 'amount' | 'netAmount' | 'itemName'>[];
  remarks?: string;
  // Invoice-level discount
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount?: number;

  // Direct payment (walk-in / cash invoice)
  directAmount?: number | null;

  // Payment info
  paymentMethod: PaymentMethod | null;
  bankAccountId?: number | null;
  amountReceived?: number | null;
  creditDays?: number | null;
  supplierId: number;
  billNumber?: string;
  billDate?: string;
  dueDate?: string;
}

export interface InvoiceFilters {
  customerId?: number;
  supplierId?: number;
  status?: InvoiceStatus;
  fromDate?: string;
  toDate?: string;
  isPendingOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SalesSummary {
  period: { from: string; to: string };
  totalInvoices: number;
  totalSales: number;
  totalPaid: number;
  totalReceivable: number;
  cancelledInvoices: number;
  cancelledAmount: number;
  averageInvoiceValue: number;
  topCustomers: {
    customerId: number;
    customerName: string;
    totalSales: number;
    invoiceCount: number;
  }[];
  monthlyBreakdown: {
    month: string;
    invoices: number;
    amount: number;
  }[];
}

export interface PurchaseSummary {
  period: { from: string; to: string };
  totalInvoices: number;
  totalPurchases: number;
  totalPaid: number;
  totalPayable: number;
  topSuppliers: {
    supplierId: number;
    supplierName: string;
    totalPurchases: number;
    invoiceCount: number;
  }[];
}

// Mock data for development
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

let mockInvoiceId = 1000;
const MOCK_SALES_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-000001',
    customerId: 1,
    customerName: 'Ahmed Electronics',
    invoiceDate: '2025-01-05',
    dueDate: '2025-02-05',
    currency: 'PKR',
    subtotalAmount: 75000,
    discountAmount: 0,
    taxAmount: 12750,
    totalAmount: 87750,
    paidAmount: 0,
    outstandingAmount: 87750,
    status: 'Submitted',
    items: [
      {
        id: 1,
        productId: 1,
        itemName: 'LED TV 55"',
        quantity: 2,
        rate: 35000,
        amount: 70000,
        taxRate: 17,
        taxAmount: 11900,
        netAmount: 81900,
      },
    ],
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
  },
  {
    id: 2,
    invoiceNumber: 'INV-000002',
    customerId: 2,
    customerName: 'Karachi Traders',
    invoiceDate: '2025-01-03',
    dueDate: '2025-02-03',
    currency: 'PKR',
    subtotalAmount: 45000,
    discountAmount: 2250,
    taxAmount: 7267.5,
    totalAmount: 50017.5,
    paidAmount: 50017.5,
    outstandingAmount: 0,
    status: 'Paid',
    items: [],
    createdAt: '2025-01-03T09:00:00Z',
    updatedAt: '2025-01-03T14:00:00Z',
  },
];

const MOCK_PURCHASE_INVOICES: Invoice[] = [
  {
    id: 101,
    invoiceNumber: 'PI-000001',
    supplierId: 1,
    supplierName: 'Al-Rehman Traders',
    invoiceDate: '2025-01-04',
    dueDate: '2025-02-18',
    currency: 'PKR',
    subtotalAmount: 120000,
    discountAmount: 0,
    taxAmount: 20400,
    totalAmount: 140400,
    paidAmount: 50000,
    outstandingAmount: 90400,
    status: 'Partially Paid',
    items: [],
    createdAt: '2025-01-04T11:00:00Z',
    updatedAt: '2025-01-06T15:00:00Z',
  },
];

const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Sales Invoices API
export const salesInvoicesApi = {
  // List sales invoices
  getAll: async (
    filters?: InvoiceFilters,
  ): Promise<PaginatedResponse<Invoice>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_SALES_INVOICES];

      if (filters?.customerId) {
        filtered = filtered.filter(i => i.customerId === filters.customerId);
      }
      if (filters?.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters?.isPendingOnly) {
        filtered = filtered.filter(i => i.outstandingAmount > 0);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          i =>
            i.invoiceNumber.toLowerCase().includes(search) ||
            i.customerName?.toLowerCase().includes(search),
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;

      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
    return apiClient.get<PaginatedResponse<Invoice>>(
      '/sales/invoices',
      filters,
    );
  },

  // Get invoice by ID
  getById: async (
    id: number,
  ): Promise<{ data: Invoice; glEntries?: GLEntry[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const invoice = MOCK_SALES_INVOICES.find(i => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return { data: invoice };
    }
    return apiClient.get<{ data: Invoice; glEntries?: GLEntry[] }>(
      `/sales/invoices/${id}`,
    );
  },

  // Create sales invoice
  create: async (
    payload: CreateSalesInvoicePayload,
  ): Promise<{ data: Invoice; glEntries: GLEntry[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);
      const subtotal = payload.items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0,
      );
      const discount = payload.discountAmount || 0;
      const afterDiscount = subtotal - discount;
      const tax = payload.items.reduce((sum, item) => {
        const lineAmount = item.quantity * item.rate;
        return sum + (lineAmount * (item.taxRate || 0)) / 100;
      }, 0);

      const newInvoice: Invoice = {
        id: ++mockInvoiceId,
        invoiceNumber: `INV-${String(mockInvoiceId).padStart(6, '0')}`,
        customerId: payload.customerId,
        customerName: 'Customer ' + payload.customerId,

        subtotalAmount: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        totalAmount: afterDiscount + tax,
        paidAmount: 0,
        outstandingAmount: afterDiscount + tax,
        status: 'Submitted',
        remarks: payload.remarks,
        items: payload.items.map((item, index) => ({
          // id: index + 1,
          ...item,
          amount: item.quantity * item.rate,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_SALES_INVOICES.unshift(newInvoice);

      return {
        data: newInvoice,
        glEntries: [
          {
            accountName: 'Accounts Receivable',
            debit: newInvoice.totalAmount,
            credit: 0,
          },
          {
            accountName: 'Sales Revenue',
            debit: 0,
            credit: subtotal - discount,
          },
          { accountName: 'Sales Tax Payable', debit: 0, credit: tax },
        ],
      };
    }

    return apiClient.post<{ data: Invoice; glEntries: GLEntry[] }>(
      '/sales/invoices',
      payload,
    );
  },

  // Update invoice
  update: async (
    id: number,
    payload: Partial<CreateSalesInvoicePayload>,
  ): Promise<{ data: Invoice }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_SALES_INVOICES.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Invoice not found');
      MOCK_SALES_INVOICES[index] = {
        ...MOCK_SALES_INVOICES[index],
        ...(payload as any),
      };
      return { data: MOCK_SALES_INVOICES[index] };
    }
    return apiClient.patch<{ data: Invoice }>(`/sales/invoices/${id}`, payload);
  },

  // Cancel invoice
  cancel: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const invoice = MOCK_SALES_INVOICES.find(i => i.id === id);
      if (invoice) invoice.status = 'Cancelled';
      return;
    }
    return apiClient.delete<void>(`/sales/invoices/${id}`);
  },

  // Get invoice payments
  getPayments: async (id: number): Promise<any[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return [];
    }
    return apiClient.get<any[]>(`/sales/invoices/${id}/payments`);
  },

  // Clone invoice
  clone: async (id: number): Promise<{ data: Invoice }> => {
    return apiClient.post<{ data: Invoice }>(`/sales/invoices/${id}/clone`);
  },

  // Generate PDF
  getPdf: async (id: number): Promise<{ url: string }> => {
    return apiClient.get<{ url: string }>(`/sales/invoices/${id}/pdf`);
  },

  // Send email
  sendEmail: async (id: number, email?: string): Promise<void> => {
    return apiClient.post<void>(`/sales/invoices/${id}/send-email`, { email });
  },

  // Record payment directly on invoice
  recordPayment: async (
    id: number,
    payload: {
      amount: number;
      paymentMode: string;
      bankAccountId?: number;
      paymentDate: string;
    },
  ): Promise<{ data: Invoice }> => {
    return apiClient.post<{ data: Invoice }>(
      `/sales/invoices/${id}/record-payment`,
      payload,
    );
  },

  // Get overdue invoices
  getOverdue: async (): Promise<Invoice[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const today = new Date().toISOString().split('T')[0];
      return MOCK_SALES_INVOICES.filter(
        i => i.outstandingAmount > 0 && i.dueDate && i.dueDate < today,
      );
    }
    const response = await apiClient.get<{ data: Invoice[] }>(
      '/sales/invoices/overdue',
    );
    return response.data;
  },

  // Get sales summary
  getSummary: async (
    fromDate: string,
    toDate: string,
  ): Promise<SalesSummary> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const filtered = MOCK_SALES_INVOICES.filter(
        i => i.invoiceDate >= fromDate && i.invoiceDate <= toDate,
      );
      const totalSales = filtered.reduce((sum, i) => sum + i.totalAmount, 0);
      const totalPaid = filtered.reduce((sum, i) => sum + i.paidAmount, 0);

      return {
        period: { from: fromDate, to: toDate },
        totalInvoices: filtered.length,
        totalSales,
        totalPaid,
        totalReceivable: totalSales - totalPaid,
        cancelledInvoices: filtered.filter(i => i.status === 'Cancelled')
          .length,
        cancelledAmount: 0,
        averageInvoiceValue:
          filtered.length > 0 ? totalSales / filtered.length : 0,
        topCustomers: [],
        monthlyBreakdown: [],
      };
    }
    return apiClient.get<SalesSummary>('/sales/summary', { fromDate, toDate });
  },
};

// Purchase Invoices API
export const purchaseInvoicesApi = {
  // List purchase invoices
  getAll: async (
    filters?: InvoiceFilters,
  ): Promise<PaginatedResponse<Invoice>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_PURCHASE_INVOICES];

      if (filters?.supplierId) {
        filtered = filtered.filter(i => i.supplierId === filters.supplierId);
      }
      if (filters?.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters?.isPendingOnly) {
        filtered = filtered.filter(i => i.outstandingAmount > 0);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;

      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
    return apiClient.get<PaginatedResponse<Invoice>>(
      '/purchases/invoices',
      filters,
    );
  },

  // Get invoice by ID
  getById: async (id: number): Promise<{ data: Invoice }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const invoice = MOCK_PURCHASE_INVOICES.find(i => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return { data: invoice };
    }
    return apiClient.get<{ data: Invoice }>(`/purchases/invoices/${id}`);
  },

  // Create purchase invoice
  create: async (
    payload: CreatePurchaseInvoicePayload,
  ): Promise<{ data: Invoice; glEntries: GLEntry[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);
      const subtotal = payload.items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0,
      );
      const tax = payload.items.reduce((sum, item) => {
        const lineAmount = item.quantity * item.rate;
        return sum + (lineAmount * (item.taxRate || 0)) / 100;
      }, 0);

      const newInvoice: Invoice = {
        id: ++mockInvoiceId,
        invoiceNumber: `PI-${String(mockInvoiceId).padStart(6, '0')}`,
        supplierId: payload.supplierId,
        supplierName: 'Supplier ' + payload.supplierId,
        invoiceDate: payload.invoiceDate,
        dueDate: payload.dueDate,
        currency: payload.currency || 'PKR',
        subtotalAmount: subtotal,
        discountAmount: 0,
        taxAmount: tax,
        totalAmount: subtotal + tax,
        paidAmount: 0,
        outstandingAmount: subtotal + tax,
        status: 'Submitted',
        remarks: payload.remarks,
        items: payload.items.map((item, index) => ({
          id: index + 1,
          ...item,
          amount: item.quantity * item.rate,
          netAmount:
            item.quantity * item.rate * (1 + (item.taxRate || 0) / 100),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_PURCHASE_INVOICES.unshift(newInvoice);

      return {
        data: newInvoice,
        glEntries: [
          { accountName: 'Inventory/COGS', debit: subtotal, credit: 0 },
          { accountName: 'Input Tax Credit', debit: tax, credit: 0 },
          { accountName: 'Accounts Payable', debit: 0, credit: subtotal + tax },
        ],
      };
    }
    return apiClient.post<{ data: Invoice; glEntries: GLEntry[] }>(
      '/purchases/invoices',
      payload,
    );
  },

  // Cancel invoice
  cancel: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const invoice = MOCK_PURCHASE_INVOICES.find(i => i.id === id);
      if (invoice) invoice.status = 'Cancelled';
      return;
    }
    return apiClient.delete<void>(`/purchases/invoices/${id}`);
  },

  // Get payables report
  getPayables: async (): Promise<Invoice[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_PURCHASE_INVOICES.filter(i => i.outstandingAmount > 0);
    }
    const response = await apiClient.get<{ data: Invoice[] }>(
      '/purchases/invoices/reports/payables',
    );
    return response.data;
  },

  // Get payables summary
  getPayablesSummary: async (): Promise<{
    totalPayable: number;
    count: number;
  }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payables = MOCK_PURCHASE_INVOICES.filter(
        i => i.outstandingAmount > 0,
      );
      return {
        totalPayable: payables.reduce((sum, i) => sum + i.outstandingAmount, 0),
        count: payables.length,
      };
    }
    return apiClient.get<{ totalPayable: number; count: number }>(
      '/purchases/invoices/reports/payables-summary',
    );
  },

  // Get purchase summary
  getSummary: async (
    fromDate: string,
    toDate: string,
  ): Promise<PurchaseSummary> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const filtered = MOCK_PURCHASE_INVOICES.filter(
        i => i.invoiceDate >= fromDate && i.invoiceDate <= toDate,
      );
      const totalPurchases = filtered.reduce(
        (sum, i) => sum + i.totalAmount,
        0,
      );
      const totalPaid = filtered.reduce((sum, i) => sum + i.paidAmount, 0);

      return {
        period: { from: fromDate, to: toDate },
        totalInvoices: filtered.length,
        totalPurchases,
        totalPaid,
        totalPayable: totalPurchases - totalPaid,
        topSuppliers: [],
      };
    }
    return apiClient.get<PurchaseSummary>('/purchases/invoices/summary', {
      fromDate,
      toDate,
    });
  },
};

// Legacy exports for backward compatibility
export const invoicesApi = {
  getAll: salesInvoicesApi.getAll,
  getSales: salesInvoicesApi.getAll,
  getPurchases: purchaseInvoicesApi.getAll,
  getById: async (id: string) => {
    const result = await salesInvoicesApi.getById(Number(id));
    return result.data;
  },
  create: async (payload: any) => {
    const result = await salesInvoicesApi.create(payload);
    return result.data;
  },
  createPurchaseInvoice: async (payload: any) => {
    const result = await purchaseInvoicesApi.create(payload);
    return result.data;
  },
  update: async (id: string, payload: any) => {
    const result = await salesInvoicesApi.update(Number(id), payload);
    return result.data;
  },
  delete: salesInvoicesApi.cancel,
  markAsPaid: async (id: string) =>
    salesInvoicesApi.recordPayment(Number(id), {
      amount: 0,
      paymentMode: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
    }),
  getPdf: (id: string) => salesInvoicesApi.getPdf(Number(id)),
  sendEmail: (id: string, email?: string) =>
    salesInvoicesApi.sendEmail(Number(id), email),
  getRecent: async (limit?: number) => {
    const response = await salesInvoicesApi.getAll({ limit: limit || 10 });
    return response.data;
  },
  getPending: async () => {
    const response = await salesInvoicesApi.getAll({ isPendingOnly: true });
    return response.data;
  },
};

export default invoicesApi;
