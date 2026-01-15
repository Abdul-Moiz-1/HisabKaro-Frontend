import apiClient, { PaginatedResponse } from './client';

// Types
export type BankAccountType = 'savings' | 'current' | 'business' | 'other';
export type AccountStatus = 'active' | 'inactive' | 'closed';

export interface BankAccount {
  id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  account_type: BankAccountType;
  status: AccountStatus;
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

export interface BankAccountTransaction {
  id: string;
  bank_account_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee' | 'interest';
  amount: number;
  balance_after: number;
  reference?: string;
  description: string;
  date: string;
  created_at: string;
}

export interface CreateBankAccountPayload {
  bank_name: string;
  account_title: string;
  account_number: string;
  account_type: BankAccountType;
  opening_balance?: number;
  branch_name?: string;
  branch_code?: string;
  iban?: string;
  swift_code?: string;
  notes?: string;
  is_default?: boolean;
}

export interface UpdateBankAccountPayload {
  bank_name?: string;
  account_title?: string;
  branch_name?: string;
  branch_code?: string;
  iban?: string;
  swift_code?: string;
  notes?: string;
  status?: AccountStatus;
  is_default?: boolean;
}

export interface BankAccountFilters {
  status?: AccountStatus;
  account_type?: BankAccountType;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'bank_name' | 'current_balance' | 'created_at';
  sort_order?: 'asc' | 'desc';
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
    status: 'active',
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
    status: 'active',
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
    status: 'active',
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
    status: 'active',
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
    status: 'inactive',
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

// Helper to calculate cash in hand (mock)
let mockCashInHand = 125000;

// API Service
export const bankAccountsApi = {
  // Get all bank accounts
  getAll: async (filters?: BankAccountFilters): Promise<PaginatedResponse<BankAccount>> => {
    // Mock implementation
    let filteredAccounts = [...mockBankAccounts];

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAccounts = filteredAccounts.filter(
        (a) =>
          a.bank_name.toLowerCase().includes(searchTerm) ||
          a.account_title.toLowerCase().includes(searchTerm) ||
          a.account_number.includes(searchTerm)
      );
    }
    if (filters?.status) {
      filteredAccounts = filteredAccounts.filter((a) => a.status === filters.status);
    }
    if (filters?.account_type) {
      filteredAccounts = filteredAccounts.filter((a) => a.account_type === filters.account_type);
    }

    // Sorting
    if (filters?.sort_by === 'bank_name') {
      filteredAccounts.sort((a, b) => a.bank_name.localeCompare(b.bank_name));
    } else if (filters?.sort_by === 'current_balance') {
      filteredAccounts.sort((a, b) => a.current_balance - b.current_balance);
    } else if (filters?.sort_by === 'created_at') {
      filteredAccounts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    if (filters?.sort_order === 'desc') {
      filteredAccounts.reverse();
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      data: filteredAccounts.slice(startIndex, endIndex),
      total: filteredAccounts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAccounts.length / limit),
    };
    // return apiClient.get<PaginatedResponse<BankAccount>>('/bank-accounts', filters);
  },

  // Get active bank accounts
  getActive: async (): Promise<BankAccount[]> => {
    return mockBankAccounts.filter((a) => a.status === 'active');
    // const response = await apiClient.get<PaginatedResponse<BankAccount>>('/bank-accounts', { status: 'active' });
    // return response.data;
  },

  // Get bank account by ID
  getById: async (id: string): Promise<BankAccount> => {
    const account = mockBankAccounts.find((a) => a.id === id);
    if (!account) {
      throw new Error('Bank account not found');
    }
    return account;
    // return apiClient.get<BankAccount>(`/bank-accounts/${id}`);
  },

  // Create bank account
  create: async (payload: CreateBankAccountPayload): Promise<BankAccount> => {
    const newAccount: BankAccount = {
      id: `bank-${mockBankAccounts.length + 1}`,
      ...payload,
      status: 'active',
      current_balance: payload.opening_balance || 0,
      opening_balance: payload.opening_balance || 0,
      is_default: payload.is_default || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockBankAccounts.push(newAccount);
    return newAccount;
    // return apiClient.post<BankAccount>('/bank-accounts', payload);
  },

  // Update bank account
  update: async (id: string, payload: UpdateBankAccountPayload): Promise<BankAccount> => {
    const index = mockBankAccounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Bank account not found');
    }
    mockBankAccounts[index] = {
      ...mockBankAccounts[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return mockBankAccounts[index];
    // return apiClient.patch<BankAccount>(`/bank-accounts/${id}`, payload);
  },

  // Delete bank account (soft delete by setting status to closed)
  delete: async (id: string): Promise<void> => {
    const index = mockBankAccounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Bank account not found');
    }
    mockBankAccounts[index].status = 'closed';
    mockBankAccounts[index].updated_at = new Date().toISOString();
    // return apiClient.delete<void>(`/bank-accounts/${id}`);
  },

  // Deposit cash to bank
  deposit: async (payload: DepositPayload): Promise<BankAccountTransaction> => {
    const account = mockBankAccounts.find((a) => a.id === payload.bank_account_id);
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
  withdraw: async (payload: WithdrawalPayload): Promise<BankAccountTransaction> => {
    const account = mockBankAccounts.find((a) => a.id === payload.bank_account_id);
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
    endDate?: string
  ): Promise<BankAccountTransaction[]> => {
    let transactions = mockTransactions.filter((t) => t.bank_account_id === accountId);

    if (startDate) {
      transactions = transactions.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter((t) => t.date <= endDate);
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      .filter((a) => a.status === 'active')
      .reduce((sum, a) => sum + a.current_balance, 0);
    return { total_balance: total };
    // return apiClient.get<{ total_balance: number }>('/bank-accounts/total-balance');
  },

  // Set default account
  setDefault: async (id: string): Promise<BankAccount> => {
    // Remove default from all accounts
    mockBankAccounts.forEach((a) => {
      a.is_default = false;
    });

    const account = mockBankAccounts.find((a) => a.id === id);
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
