import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type PaymentType = 'Receive' | 'Pay';
export type PaymentMode = 'Cash' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Submitted' | 'Cancelled';
export type ChequeStatus = 'pending' | 'cleared' | 'bounced';

export interface InvoiceAllocation {
  invoiceId: number;
  invoiceNumber?: string;
  allocatedAmount: number;
  previousOutstanding?: number;
  newOutstanding?: number;
}

export interface PayLoadInvoiceAllocation {
  invoiceId: number;
  allocatedAmount: number;
}

export interface ChequeDetails {
  chequeNumber: string;
  chequeDate: string;
  bankName: string;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  paymentType: PaymentType;
  partyId?: number;
  partyName: string;
  paidAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  paymentDate: string;
  bankAccountId?: number;
  bankAccountName?: string;
  chequeDetails?: ChequeDetails;
  chequeStatus?: ChequeStatus;
  mobileWalletProviderId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GLEntry {
  accountName: string;
  debit: number;
  credit: number;
}

export interface ReceivePaymentInvoiceAllocationPayload {
  invoiceId: number;
  allocatedAmount: number;
}

export interface ReceivePaymentPayload {
  customerId: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  bankAccountId?: number;
  chequeDetails?: ChequeDetails;
  mobileWalletProviderId?: number;
  paymentDate: string;
  invoiceAllocations?: ReceivePaymentInvoiceAllocationPayload[];
  notes?: string;
}

export interface PayPaymentPayload {
  supplierId: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  bankAccountId?: number;
  chequeDetails?: ChequeDetails;
  mobileWalletProviderId?: number;
  paymentDate: string;
  invoiceAllocations?: PayLoadInvoiceAllocation[];
  notes?: string;
}

export interface PaymentFilters {
  paymentType?: PaymentType;
  paymentMode?: PaymentMode;
  status?: PaymentStatus;
  customerId?: number;
  supplierId?: number;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface PaymentResponse {
  payment: Payment;
  glEntries: GLEntry[];
  updatedInvoices: {
    invoiceId: number;
    invoiceNumber: string;
    previousOutstanding: number;
    paidAmount: number;
    newOutstanding: number;
  }[];
  partyBalance: {
    totalOutstanding: number;
    advanceBalance: number;
  };
  message: string;
}

export interface BankAccount {
  id: number;
  bankId: number;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  accountType?: string;
  glAccountId?: number;
  currentBalance: number;
  isActive: boolean;
}

export interface MobileWallet {
  id: number;
  providerName: string;
  accountNumber: string;
  isActive: boolean;
}

export interface PaymentsSummary {
  period: { from: string; to: string };
  totalPayments: number;
  totalReceipts: number;
  totalDisbursements: number;
  netCashFlow: number;
  receiptCount: number;
  disbursementCount: number;
  byPaymentMode: {
    mode: string;
    receipts: number;
    disbursements: number;
  }[];
  dailyBreakdown: {
    date: string;
    receipts: number;
    disbursements: number;
    count: number;
  }[];
}

// Mock data
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA
let mockPaymentId = 100;

const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Payments API
export const paymentsApi = {
  // List all payments
  getAll: async (
    filters?: PaymentFilters,
  ): Promise<PaginatedResponse<Payment>> => {
    return apiClient.get<PaginatedResponse<Payment>>('/payments', filters);
  },

  // Get payment by ID
  getById: async (id: number): Promise<Payment> => {
    return apiClient.get<Payment>(`/payments/${id}`);
  },

  // Receive payment from customer
  receive: async (
    payload: ReceivePaymentPayload,
  ): Promise<{ data: PaymentResponse }> => {
    return apiClient.post<{ data: PaymentResponse }>(
      '/payments/receive',
      payload,
    );
  },

  // Make payment to supplier
  pay: async (
    payload: PayPaymentPayload,
  ): Promise<{ data: PaymentResponse }> => {
    return apiClient.post<{ data: PaymentResponse }>('/payments/pay', payload);
  },

  // Cancel payment
  cancel: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/payments/${id}`);
  },

  // Generate receipt
  getReceipt: async (id: number): Promise<{ url: string }> => {
    return apiClient.get<{ url: string }>(`/payments/${id}/receipt`);
  },

  // Allocate unallocated payment
  allocate: async (
    id: number,
    allocations: InvoiceAllocation[],
  ): Promise<Payment> => {
    return apiClient.post<Payment>(`/payments/${id}/allocate`, { allocations });
  },

  // List unallocated payments
  getUnallocated: async (): Promise<Payment[]> => {
    const response = await apiClient.get<{ data: Payment[] }>(
      '/payments/unallocated/list',
    );
    return response.data;
  },

  // List pending cheques
  getPendingCheques: async (): Promise<Payment[]> => {
    const response = await apiClient.get<{ data: Payment[] }>(
      '/payments/cheques/pending',
    );
    return response.data;
  },

  // Process cheque (clear or bounce)
  processCheque: async (
    paymentId: number,
    action: 'clear' | 'bounce',
    bankAccountId?: number,
    bounceReason?: string,
  ): Promise<Payment> => {
    return apiClient.post<Payment>(`/payments/cheques/${paymentId}/process`, {
      action,
      bankAccountId,
      bounceReason,
    });
  },

  // Get bank accounts
  getBankAccounts: async (): Promise<BankAccount[]> => {
    return apiClient.get<BankAccount[]>('/payments/bank-accounts');
  },

  // Add bank account
  addBankAccount: async (
    payload: Partial<BankAccount>,
  ): Promise<BankAccount> => {
    return apiClient.post<BankAccount>('/payments/bank-accounts', payload);
  },

  // Get mobile wallets
  getWallets: async (): Promise<MobileWallet[]> => {
    return apiClient.get<MobileWallet[]>('/payments/wallets');
  },

  // Get payment summary report
  getSummary: async (
    fromDate: string,
    toDate: string,
  ): Promise<PaymentsSummary> => {
    return apiClient.get<PaymentsSummary>('/payments/reports/summary', {
      fromDate,
      toDate,
    });
  },

  // Get collections report
  getCollections: async (fromDate: string, toDate: string): Promise<any> => {
    return apiClient.get<any>('/payments/reports/collections', {
      fromDate,
      toDate,
    });
  },

  // Get disbursements report
  getDisbursements: async (fromDate: string, toDate: string): Promise<any> => {
    return apiClient.get<any>('/payments/reports/disbursements', {
      fromDate,
      toDate,
    });
  },

  // Get today's payments
  getToday: async (): Promise<Payment[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await paymentsApi.getAll({
      fromDate: today,
      toDate: today,
    });
    return response.data;
  },

  // Legacy methods for backward compatibility
  getReceived: async (filters?: Omit<PaymentFilters, 'paymentType'>) => {
    return paymentsApi.getAll({ ...filters, paymentType: 'Receive' });
  },

  getPaid: async (filters?: Omit<PaymentFilters, 'paymentType'>) => {
    return paymentsApi.getAll({ ...filters, paymentType: 'Pay' });
  },

  receivePayment: async (
    payload: Omit<ReceivePaymentPayload, 'customerId'> & {
      customer_id: number;
    },
  ) => {
    return paymentsApi.receive({
      ...payload,
      customerId: payload.customer_id,
    });
  },

  makePayment: async (
    payload: Omit<PayPaymentPayload, 'supplierId'> & { supplier_id: number },
  ) => {
    return paymentsApi.pay({
      ...payload,
      supplierId: payload.supplier_id,
    });
  },
};

// Legacy type exports
export type { PaymentMode as PaymentMethod };
export type { InvoiceAllocation as PaymentAllocation };
export interface CreatePaymentPayload extends ReceivePaymentPayload {}

export default paymentsApi;
