import { ENV_CONFIG } from '../../constants/env';
import apiClient, { PaginatedResponse } from './client';

// Types
export type BankAccountType = 'savings' | 'current' | 'business' | 'other';

export interface BankAccount {
  id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  account_type: BankAccountType;
  current_balance: number;
  opening_balance: number;
  branch_name?: string;
  branch_code?: string;
  iban?: string;
  swift_code?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banks {
  id: number;
  name: string;
  swiftCode: string;
  logoUrl: string;
}

export interface BankAccountTransaction {
  id: string;
  bank_account_id: string;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'transfer_in'
    | 'transfer_out'
    | 'fee'
    | 'interest';
  amount: number;
  balance_after: number;
  reference?: string;
  description: string;
  date: string;
  created_at: string;
}

export interface CreateBankAccountPayload {
  bankId: number;
  accountTitle: string;
  accountNumber: string;
  openingBalance?: number;
}

export interface UpdateBankAccountPayload {
  accountTitle?: string;
}

export interface BankAccountFilters {
  includeInactive?: boolean;
  search?: string;
}

export interface DepositPayload {
  bank_account_id: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export interface WithdrawalPayload {
  bank_account_id: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

// Mock Data (for development)
const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    bank_name: 'HBL',
    account_title: 'Business Account',
    account_number: '1234567890123456',
    account_type: 'business',
    current_balance: 250000,
    opening_balance: 100000,
    branch_name: 'Model Town Branch',
    branch_code: '0123',
    iban: 'PK36HABB0001234567890123',
    is_default: true,
    created_at: '2023-01-01T08:00:00Z',
    updated_at: '2024-07-20T10:00:00Z',
  },
  {
    id: 'bank-2',
    bank_name: 'Meezan Bank',
    account_title: 'Savings Account',
    account_number: '9876543210987654',
    account_type: 'savings',
    current_balance: 150000,
    opening_balance: 50000,
    branch_name: 'Gulberg Branch',
    branch_code: '0456',
    iban: 'PK36MEZN0009876543210987',
    is_default: false,
    created_at: '2023-02-15T09:00:00Z',
    updated_at: '2024-07-19T11:00:00Z',
  },
  {
    id: 'bank-3',
    bank_name: 'JazzCash',
    account_title: 'Mobile Wallet',
    account_number: '03001234567',
    account_type: 'other',
    current_balance: 45000,
    opening_balance: 0,
    is_default: false,
    created_at: '2023-03-10T10:00:00Z',
    updated_at: '2024-07-18T12:00:00Z',
  },
  {
    id: 'bank-4',
    bank_name: 'Easypaisa',
    account_title: 'Mobile Wallet',
    account_number: '03119876543',
    account_type: 'other',
    current_balance: 25000,
    opening_balance: 0,
    is_default: false,
    created_at: '2023-03-15T11:00:00Z',
    updated_at: '2024-07-17T13:00:00Z',
  },
  {
    id: 'bank-5',
    bank_name: 'Allied Bank',
    account_title: 'Current Account',
    account_number: '5678901234567890',
    account_type: 'current',
    current_balance: 0,
    opening_balance: 25000,
    branch_name: 'DHA Branch',
    branch_code: '0789',
    is_default: false,
    created_at: '2022-06-01T08:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

const mockTransactions: BankAccountTransaction[] = [
  {
    id: 'txn-1',
    bank_account_id: 'bank-1',
    type: 'deposit',
    amount: 50000,
    balance_after: 250000,
    reference: 'DEP-001',
    description: 'Cash deposit',
    date: '2024-07-20',
    created_at: '2024-07-20T10:00:00Z',
  },
  {
    id: 'txn-2',
    bank_account_id: 'bank-1',
    type: 'withdrawal',
    amount: 20000,
    balance_after: 200000,
    reference: 'WDL-001',
    description: 'Cash withdrawal for expenses',
    date: '2024-07-19',
    created_at: '2024-07-19T14:00:00Z',
  },
  {
    id: 'txn-3',
    bank_account_id: 'bank-2',
    type: 'transfer_in',
    amount: 30000,
    balance_after: 150000,
    reference: 'TRF-001',
    description: 'Transfer from HBL',
    date: '2024-07-18',
    created_at: '2024-07-18T09:00:00Z',
  },
];

const mockBanks: Banks[] = [
  { id: 1, name: 'HBL', swiftCode: '#00A859', logoUrl: 'bank' },
  { id: 2, name: 'Meezan', swiftCode: '#008C45', logoUrl: 'bank' },
  { id: 3, name: 'UBL', swiftCode: '#E31937', logoUrl: 'bank' },
  { id: 4, name: 'Alfalah', swiftCode: '#C8102E', logoUrl: 'bank' },
  { id: 4, name: 'MCB', swiftCode: '#FFD700', logoUrl: 'bank' },
  { id: 5, name: 'Allied', swiftCode: '#0055A5', logoUrl: 'bank' },

  { id: 6, name: 'JazzCash', swiftCode: '#E60000', logoUrl: 'wallet' },
  { id: 7, name: 'Easypaisa', swiftCode: '#4CAF50', logoUrl: 'wallet' },
  { id: 8, name: 'SadaPay', swiftCode: '#FF6B35', logoUrl: 'wallet' },
  { id: 9, name: 'NayaPay', swiftCode: '#6C63FF', logoUrl: 'wallet' },
];

// Helper to calculate cash in hand (mock)
let mockCashInHand = 125000;

// API Service
export const bankAccountsApi = {
  // Get all banks
  getAllBanks: async (): Promise<{ data: Banks[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      let filteredAccounts = [...mockBanks];

      return {
        data: filteredAccounts,
      };
    }

    return apiClient.get<{ data: Banks[] }>('/banks');
  },

  // Get all bank accounts
  getAll: async (
    filters?: BankAccountFilters,
  ): Promise<{ data: BankAccount[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      let filteredAccounts = [...mockBankAccounts];

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAccounts = filteredAccounts.filter(
          a =>
            a.bank_name.toLowerCase().includes(searchTerm) ||
            a.account_title.toLowerCase().includes(searchTerm) ||
            a.account_number.includes(searchTerm),
        );
      }

      return {
        data: filteredAccounts,
      };
    }

    return apiClient.get<{ data: BankAccount[] }>('/bank-accounts', filters);
  },

  // Get active bank accounts
  getActive: async (): Promise<BankAccount[]> => {
    // return mockBankAccounts.filter(a => a. === 'active');
    const response = await apiClient.get<PaginatedResponse<BankAccount>>(
      '/bank-accounts',
      { status: 'active' },
    );
    return response.data;
  },

  // Get bank account by ID
  getById: async (id: string): Promise<{ data: BankAccount }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      const account = mockBankAccounts.find(a => a.id === id);
      if (!account) {
        throw new Error('Bank account not found');
      }
      return { data: account };
    }
    return apiClient.get<{ data: BankAccount }>(`/bank-accounts/${id}`);
  },

  // Create bank account
  create: async (payload: CreateBankAccountPayload): Promise<BankAccount> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      const newAccount: BankAccount = {
        id: `bank-${mockBankAccounts.length + 1}`,
        ...payload,
        current_balance: payload.openingBalance || 0,
        opening_balance: payload.openingBalance || 0,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockBankAccounts.push(newAccount);
      return newAccount;
    }
    return apiClient.post<BankAccount>('/bank-accounts', payload);
  },

  // Update bank account
  update: async (
    id: string,
    payload: UpdateBankAccountPayload,
  ): Promise<{ data: BankAccount }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      const index = mockBankAccounts.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Bank account not found');
      }
      mockBankAccounts[index] = {
        ...mockBankAccounts[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return { data: mockBankAccounts[index] };
    }
    return apiClient.patch<{ data: BankAccount }>(
      `/bank-accounts/${id}`,
      payload,
    );
  },

  // Delete bank account (soft delete by setting status to closed)
  delete: async (id: string): Promise<void> => {
    const index = mockBankAccounts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Bank account not found');
    }
    mockBankAccounts[index].status = 'closed';
    mockBankAccounts[index].updated_at = new Date().toISOString();
    // return apiClient.delete<void>(`/bank-accounts/${id}`);
  },

  // Deposit cash to bank
  deposit: async (payload: DepositPayload): Promise<BankAccountTransaction> => {
    const account = mockBankAccounts.find(
      a => a.id === payload.bank_account_id,
    );
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (payload.amount > mockCashInHand) {
      throw new Error('Insufficient cash in hand');
    }

    // Update balances
    account.current_balance += payload.amount;
    mockCashInHand -= payload.amount;

    const transaction: BankAccountTransaction = {
      id: `txn-${Date.now()}`,
      bank_account_id: payload.bank_account_id,
      type: 'deposit',
      amount: payload.amount,
      balance_after: account.current_balance,
      reference: payload.reference || `DEP-${Date.now().toString().slice(-6)}`,
      description: payload.notes || 'Cash deposit',
      date: payload.date,
      created_at: new Date().toISOString(),
    };
    mockTransactions.push(transaction);

    return transaction;
    // return apiClient.post<BankAccountTransaction>('/bank-accounts/deposit', payload);
  },

  // Withdraw cash from bank
  withdraw: async (
    payload: WithdrawalPayload,
  ): Promise<BankAccountTransaction> => {
    const account = mockBankAccounts.find(
      a => a.id === payload.bank_account_id,
    );
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (payload.amount > account.current_balance) {
      throw new Error('Insufficient bank balance');
    }

    // Update balances
    account.current_balance -= payload.amount;
    mockCashInHand += payload.amount;

    const transaction: BankAccountTransaction = {
      id: `txn-${Date.now()}`,
      bank_account_id: payload.bank_account_id,
      type: 'withdrawal',
      amount: payload.amount,
      balance_after: account.current_balance,
      reference: payload.reference || `WDL-${Date.now().toString().slice(-6)}`,
      description: payload.notes || 'Cash withdrawal',
      date: payload.date,
      created_at: new Date().toISOString(),
    };
    mockTransactions.push(transaction);

    return transaction;
    // return apiClient.post<BankAccountTransaction>('/bank-accounts/withdraw', payload);
  },

  // Get transactions for a bank account
  getTransactions: async (
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<BankAccountTransaction[]> => {
    let transactions = mockTransactions.filter(
      t => t.bank_account_id === accountId,
    );

    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }

    return transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    // return apiClient.get<BankAccountTransaction[]>(`/bank-accounts/${accountId}/transactions`, {
    //   start_date: startDate,
    //   end_date: endDate,
    // });
  },

  // Get cash in hand balance
  getCashInHand: async (): Promise<{ balance: number }> => {
    return { balance: mockCashInHand };
    // return apiClient.get<{ balance: number }>('/cash-in-hand');
  },

  // Get total bank balance (sum of all active accounts)
  getTotalBankBalance: async (): Promise<{ total_balance: number }> => {
    const total = mockBankAccounts
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + a.current_balance, 0);
    return { total_balance: total };
    // return apiClient.get<{ total_balance: number }>('/bank-accounts/total-balance');
  },

  // Set default account
  setDefault: async (id: string): Promise<BankAccount> => {
    // Remove default from all accounts
    mockBankAccounts.forEach(a => {
      a.is_default = false;
    });

    const account = mockBankAccounts.find(a => a.id === id);
    if (!account) {
      throw new Error('Bank account not found');
    }

    account.is_default = true;
    account.updated_at = new Date().toISOString();

    return account;
    // return apiClient.post<BankAccount>(`/bank-accounts/${id}/set-default`);
  },
};

export default bankAccountsApi;
