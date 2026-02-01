import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type PaymentType = 'Receive' | 'Pay';
export type PaymentMode = 'Cash' | 'Bank';
export type PaymentStatus = 'Pending' | 'Submitted' | 'Cancelled';
export type ChequeStatus = 'pending' | 'cleared' | 'bounced';

export interface InvoiceAllocation {
  invoiceId: number;
  invoiceNumber?: string;
  allocatedAmount: number;
  previousOutstanding?: number;
  newOutstanding?: number;
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
  invoiceAllocations?: InvoiceAllocation[];
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

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    paymentNumber: 'REC-000001',
    paymentType: 'Receive',
    partyId: 1,
    partyName: 'Ahmed Electronics',
    paidAmount: 50000,
    allocatedAmount: 50000,
    unallocatedAmount: 0,
    paymentMode: 'bank_transfer',
    status: 'Submitted',
    paymentDate: '2025-01-03',
    bankAccountId: 1,
    bankAccountName: 'HBL Business Account',
    createdAt: '2025-01-03T14:00:00Z',
    updatedAt: '2025-01-03T14:00:00Z',
  },
  {
    id: 2,
    paymentNumber: 'PAY-000001',
    paymentType: 'Pay',
    partyId: 1,
    partyName: 'Al-Rehman Traders',
    paidAmount: 50000,
    allocatedAmount: 50000,
    unallocatedAmount: 0,
    paymentMode: 'bank_transfer',
    status: 'Submitted',
    paymentDate: '2025-01-06',
    bankAccountId: 1,
    bankAccountName: 'HBL Business Account',
    createdAt: '2025-01-06T15:00:00Z',
    updatedAt: '2025-01-06T15:00:00Z',
  },
];

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 1,
    bankId: 1,
    bankName: 'HBL',
    accountTitle: 'Business Current Account',
    accountNumber: '****1234',
    accountType: 'Current',
    currentBalance: 250000,
    isActive: true,
  },
  {
    id: 2,
    bankId: 2,
    bankName: 'Meezan Bank',
    accountTitle: 'Savings Account',
    accountNumber: '****5678',
    accountType: 'Savings',
    currentBalance: 150000,
    isActive: true,
  },
];

const MOCK_WALLETS: MobileWallet[] = [
  {
    id: 1,
    providerName: 'JazzCash',
    accountNumber: '0300*****67',
    isActive: true,
  },
  {
    id: 2,
    providerName: 'Easypaisa',
    accountNumber: '0311*****43',
    isActive: true,
  },
];

const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Payments API
export const paymentsApi = {
  // List all payments
  getAll: async (
    filters?: PaymentFilters,
  ): Promise<PaginatedResponse<Payment>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_PAYMENTS];

      if (filters?.paymentType) {
        filtered = filtered.filter(p => p.paymentType === filters.paymentType);
      }
      if (filters?.paymentMode) {
        filtered = filtered.filter(p => p.paymentMode === filters.paymentMode);
      }
      if (filters?.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters?.fromDate) {
        filtered = filtered.filter(p => p.paymentDate >= filters.fromDate!);
      }
      if (filters?.toDate) {
        filtered = filtered.filter(p => p.paymentDate <= filters.toDate!);
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
    return apiClient.get<PaginatedResponse<Payment>>('/payments', filters);
  },

  // Get payment by ID
  getById: async (id: number): Promise<Payment> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payment = MOCK_PAYMENTS.find(p => p.id === id);
      if (!payment) throw new Error('Payment not found');
      return payment;
    }
    return apiClient.get<Payment>(`/payments/${id}`);
  },

  // Receive payment from customer
  receive: async (
    payload: ReceivePaymentPayload,
  ): Promise<{ data: PaymentResponse }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);

      const newPayment: Payment = {
        id: ++mockPaymentId,
        paymentNumber: `REC-${String(mockPaymentId).padStart(6, '0')}`,
        paymentType: 'Receive',
        partyId: payload.customerId,
        partyName: 'Customer ' + payload.customerId,
        paidAmount: payload.paidAmount,
        allocatedAmount:
          payload.invoiceAllocations?.reduce(
            (sum, a) => sum + a.allocatedAmount,
            0,
          ) || 0,
        unallocatedAmount:
          payload.paidAmount -
          (payload.invoiceAllocations?.reduce(
            (sum, a) => sum + a.allocatedAmount,
            0,
          ) || 0),
        paymentMode: payload.paymentMode,
        status: payload.paymentMode === 'cheque' ? 'Pending' : 'Submitted',
        paymentDate: payload.paymentDate,
        bankAccountId: payload.bankAccountId,
        chequeDetails: payload.chequeDetails,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_PAYMENTS.unshift(newPayment);

      return {
        data: {
          payment: newPayment,
          glEntries: [
            {
              accountName:
                payload.paymentMode === 'cash' ? 'Cash' : 'Bank - HBL',
              debit: payload.paidAmount,
              credit: 0,
            },
            {
              accountName: 'Accounts Receivable',
              debit: 0,
              credit: payload.paidAmount,
            },
          ],
          updatedInvoices:
            payload.invoiceAllocations?.map(a => ({
              invoiceId: a.invoiceId,
              invoiceNumber: a.invoiceNumber || `INV-${a.invoiceId}`,
              previousOutstanding: a.previousOutstanding || a.allocatedAmount,
              paidAmount: a.allocatedAmount,
              newOutstanding:
                (a.previousOutstanding || a.allocatedAmount) -
                a.allocatedAmount,
            })) || [],
          partyBalance: {
            totalOutstanding: 75000, // Mock value
            advanceBalance: newPayment.unallocatedAmount,
          },
          message: 'Payment received and posted to GL successfully',
        },
      };
    }
    return apiClient.post<{ data: PaymentResponse }>(
      '/payments/receive',
      payload,
    );
  },

  // Make payment to supplier
  pay: async (
    payload: PayPaymentPayload,
  ): Promise<{ data: PaymentResponse }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);

      const newPayment: Payment = {
        id: ++mockPaymentId,
        paymentNumber: `PAY-${String(mockPaymentId).padStart(6, '0')}`,
        paymentType: 'Pay',
        partyId: payload.supplierId,
        partyName: 'Supplier ' + payload.supplierId,
        paidAmount: payload.paidAmount,
        allocatedAmount:
          payload.invoiceAllocations?.reduce(
            (sum, a) => sum + a.allocatedAmount,
            0,
          ) || 0,
        unallocatedAmount:
          payload.paidAmount -
          (payload.invoiceAllocations?.reduce(
            (sum, a) => sum + a.allocatedAmount,
            0,
          ) || 0),
        paymentMode: payload.paymentMode,
        status: payload.paymentMode === 'cheque' ? 'Pending' : 'Submitted',
        paymentDate: payload.paymentDate,
        bankAccountId: payload.bankAccountId,
        chequeDetails: payload.chequeDetails,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_PAYMENTS.unshift(newPayment);

      return {
        data: {
          payment: newPayment,
          glEntries: [
            {
              accountName: 'Accounts Payable',
              debit: payload.paidAmount,
              credit: 0,
            },
            {
              accountName:
                payload.paymentMode === 'cash' ? 'Cash' : 'Bank - HBL',
              debit: 0,
              credit: payload.paidAmount,
            },
          ],
          updatedInvoices:
            payload.invoiceAllocations?.map(a => ({
              invoiceId: a.invoiceId,
              invoiceNumber: a.invoiceNumber || `PI-${a.invoiceId}`,
              previousOutstanding: a.previousOutstanding || a.allocatedAmount,
              paidAmount: a.allocatedAmount,
              newOutstanding:
                (a.previousOutstanding || a.allocatedAmount) -
                a.allocatedAmount,
            })) || [],
          partyBalance: {
            totalOutstanding: 90400, // Mock value
            advanceBalance: 0,
          },
          message: 'Payment made and posted to GL successfully',
        },
      };
    }
    return apiClient.post<{ data: PaymentResponse }>('/payments/pay', payload);
  },

  // Cancel payment
  cancel: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payment = MOCK_PAYMENTS.find(p => p.id === id);
      if (payment) payment.status = 'Cancelled';
      return;
    }
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
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_PAYMENTS.filter(p => p.unallocatedAmount > 0);
    }
    const response = await apiClient.get<{ data: Payment[] }>(
      '/payments/unallocated/list',
    );
    return response.data;
  },

  // List pending cheques
  getPendingCheques: async (): Promise<Payment[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_PAYMENTS.filter(
        p => p.paymentMode === 'cheque' && p.chequeStatus === 'pending',
      );
    }
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
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_BANK_ACCOUNTS;
    }
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
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_WALLETS;
    }
    return apiClient.get<MobileWallet[]>('/payments/wallets');
  },

  // Get payment summary report
  getSummary: async (
    fromDate: string,
    toDate: string,
  ): Promise<PaymentsSummary> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const filtered = MOCK_PAYMENTS.filter(
        p => p.paymentDate >= fromDate && p.paymentDate <= toDate,
      );
      const receipts = filtered.filter(p => p.paymentType === 'Receive');
      const disbursements = filtered.filter(p => p.paymentType === 'Pay');

      return {
        period: { from: fromDate, to: toDate },
        totalPayments: filtered.length,
        totalReceipts: receipts.reduce((sum, p) => sum + p.paidAmount, 0),
        totalDisbursements: disbursements.reduce(
          (sum, p) => sum + p.paidAmount,
          0,
        ),
        netCashFlow:
          receipts.reduce((sum, p) => sum + p.paidAmount, 0) -
          disbursements.reduce((sum, p) => sum + p.paidAmount, 0),
        receiptCount: receipts.length,
        disbursementCount: disbursements.length,
        byPaymentMode: [
          { mode: 'Cash', receipts: 100000, disbursements: 50000 },
          { mode: 'Bank Transfer', receipts: 400000, disbursements: 300000 },
        ],
        dailyBreakdown: [],
      };
    }
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
