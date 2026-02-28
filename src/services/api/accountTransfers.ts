import apiClient, { PaginatedResponse } from './client';

// Types
export type TransferType = 'cash_to_bank' | 'bank_to_cash' | 'bank_to_bank' | 'cash_to_wallet' | 'wallet_to_cash' | 'wallet_to_bank' | 'bank_to_wallet';
export type TransferStatus = 'pending' | 'completed' | 'cancelled' | 'failed';

export interface AccountTransfer {
  id: string;
  reference_number: string;
  transfer_type: TransferType;
  status: TransferStatus;
  amount: number;
  from_account_id?: string;
  from_account_name?: string;
  from_account_type: 'cash' | 'bank' | 'wallet';
  to_account_id?: string;
  to_account_name?: string;
  to_account_type: 'cash' | 'bank' | 'wallet';
  date: string;
  notes?: string;
  fee?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTransferPayload {
  transfer_type: TransferType;
  amount: number;
  from_account_id?: string;
  to_account_id?: string;
  date: string;
  notes?: string;
  fee?: number;
}

export interface TransferFilters {
  transfer_type?: TransferType;
  status?: TransferStatus;
  from_account_id?: string;
  to_account_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
  sort_by?: 'date' | 'amount' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Mock Data (for development)
const mockTransfers: AccountTransfer[] = [
  {
    id: 'transfer-1',
    reference_number: 'TRF-2024-001',
    transfer_type: 'cash_to_bank',
    status: 'completed',
    amount: 50000,
    from_account_type: 'cash',
    from_account_name: 'Cash in Hand',
    to_account_id: 'bank-1',
    to_account_name: 'HBL Business Account',
    to_account_type: 'bank',
    date: '2024-07-20',
    notes: 'Weekly cash deposit',
    created_at: '2024-07-20T10:00:00Z',
    updated_at: '2024-07-20T10:00:00Z',
  },
  {
    id: 'transfer-2',
    reference_number: 'TRF-2024-002',
    transfer_type: 'bank_to_cash',
    status: 'completed',
    amount: 30000,
    from_account_id: 'bank-1',
    from_account_name: 'HBL Business Account',
    from_account_type: 'bank',
    to_account_type: 'cash',
    to_account_name: 'Cash in Hand',
    date: '2024-07-19',
    notes: 'Cash for daily expenses',
    created_at: '2024-07-19T09:00:00Z',
    updated_at: '2024-07-19T09:00:00Z',
  },
  {
    id: 'transfer-3',
    reference_number: 'TRF-2024-003',
    transfer_type: 'bank_to_bank',
    status: 'completed',
    amount: 75000,
    from_account_id: 'bank-1',
    from_account_name: 'HBL Business Account',
    from_account_type: 'bank',
    to_account_id: 'bank-2',
    to_account_name: 'Meezan Bank Savings',
    to_account_type: 'bank',
    date: '2024-07-18',
    notes: 'Transfer to savings',
    fee: 250,
    created_at: '2024-07-18T14:00:00Z',
    updated_at: '2024-07-18T14:00:00Z',
  },
  {
    id: 'transfer-4',
    reference_number: 'TRF-2024-004',
    transfer_type: 'cash_to_wallet',
    status: 'completed',
    amount: 10000,
    from_account_type: 'cash',
    from_account_name: 'Cash in Hand',
    to_account_id: 'bank-3',
    to_account_name: 'JazzCash',
    to_account_type: 'wallet',
    date: '2024-07-17',
    notes: 'Top up mobile wallet',
    created_at: '2024-07-17T11:00:00Z',
    updated_at: '2024-07-17T11:00:00Z',
  },
  {
    id: 'transfer-5',
    reference_number: 'TRF-2024-005',
    transfer_type: 'bank_to_wallet',
    status: 'completed',
    amount: 15000,
    from_account_id: 'bank-1',
    from_account_name: 'HBL Business Account',
    from_account_type: 'bank',
    to_account_id: 'bank-4',
    to_account_name: 'Easypaisa',
    to_account_type: 'wallet',
    date: '2024-07-16',
    notes: 'Transfer to Easypaisa for payments',
    fee: 100,
    created_at: '2024-07-16T16:00:00Z',
    updated_at: '2024-07-16T16:00:00Z',
  },
];

// Helper for mock cash balance
let mockCashBalance = 125000;

// API Service
export const accountTransfersApi = {
  // Get all transfers with filters
  getAll: async (filters?: TransferFilters): Promise<PaginatedResponse<AccountTransfer>> => {
    // Mock implementation
    let filteredTransfers = [...mockTransfers];

    if (filters?.transfer_type) {
      filteredTransfers = filteredTransfers.filter((t) => t.transfer_type === filters.transfer_type);
    }
    if (filters?.status) {
      filteredTransfers = filteredTransfers.filter((t) => t.status === filters.status);
    }
    if (filters?.from_account_id) {
      filteredTransfers = filteredTransfers.filter((t) => t.from_account_id === filters.from_account_id);
    }
    if (filters?.to_account_id) {
      filteredTransfers = filteredTransfers.filter((t) => t.to_account_id === filters.to_account_id);
    }
    if (filters?.start_date) {
      filteredTransfers = filteredTransfers.filter((t) => t.date >= filters.start_date!);
    }
    if (filters?.end_date) {
      filteredTransfers = filteredTransfers.filter((t) => t.date <= filters.end_date!);
    }
    if (filters?.min_amount !== undefined) {
      filteredTransfers = filteredTransfers.filter((t) => t.amount >= filters.min_amount!);
    }
    if (filters?.max_amount !== undefined) {
      filteredTransfers = filteredTransfers.filter((t) => t.amount <= filters.max_amount!);
    }

    // Sorting
    if (filters?.sort_by === 'date') {
      filteredTransfers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filters?.sort_by === 'amount') {
      filteredTransfers.sort((a, b) => a.amount - b.amount);
    } else if (filters?.sort_by === 'created_at') {
      filteredTransfers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    if (filters?.sort_order === 'desc') {
      filteredTransfers.reverse();
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      data: filteredTransfers.slice(startIndex, endIndex),
      total: filteredTransfers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTransfers.length / limit),
    };
    // return apiClient.get<PaginatedResponse<AccountTransfer>>('/account-transfers', filters);
  },

  // Get transfer by ID
  getById: async (id: string): Promise<AccountTransfer> => {
    const transfer = mockTransfers.find((t) => t.id === id);
    if (!transfer) {
      throw new Error('Transfer not found');
    }
    return transfer;
    // return apiClient.get<AccountTransfer>(`/account-transfers/${id}`);
  },

  // Create new transfer (Cash to Bank deposit)
  depositCashToBank: async (payload: {
    bank_account_id: string;
    amount: number;
    date: string;
    notes?: string;
  }): Promise<AccountTransfer> => {
    if (payload.amount > mockCashBalance) {
      throw new Error('Insufficient cash in hand');
    }

    const newTransfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      reference_number: `TRF-${new Date().getFullYear()}-${(mockTransfers.length + 1).toString().padStart(3, '0')}`,
      transfer_type: 'cash_to_bank',
      status: 'completed',
      amount: payload.amount,
      from_account_type: 'cash',
      from_account_name: 'Cash in Hand',
      to_account_id: payload.bank_account_id,
      to_account_name: 'Bank Account', // Would be fetched from bank accounts in real implementation
      to_account_type: 'bank',
      date: payload.date,
      notes: payload.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockCashBalance -= payload.amount;
    mockTransfers.unshift(newTransfer);

    return newTransfer;
    // return apiClient.post<AccountTransfer>('/account-transfers/deposit', payload);
  },

  // Withdraw from Bank to Cash
  withdrawBankToCash: async (payload: {
    bank_account_id: string;
    amount: number;
    date: string;
    notes?: string;
  }): Promise<AccountTransfer> => {
    const newTransfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      reference_number: `TRF-${new Date().getFullYear()}-${(mockTransfers.length + 1).toString().padStart(3, '0')}`,
      transfer_type: 'bank_to_cash',
      status: 'completed',
      amount: payload.amount,
      from_account_id: payload.bank_account_id,
      from_account_name: 'Bank Account',
      from_account_type: 'bank',
      to_account_type: 'cash',
      to_account_name: 'Cash in Hand',
      date: payload.date,
      notes: payload.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockCashBalance += payload.amount;
    mockTransfers.unshift(newTransfer);

    return newTransfer;
    // return apiClient.post<AccountTransfer>('/account-transfers/withdraw', payload);
  },

  // Transfer between bank accounts
  transferBankToBank: async (payload: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    date: string;
    notes?: string;
    fee?: number;
  }): Promise<AccountTransfer> => {
    const newTransfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      reference_number: `TRF-${new Date().getFullYear()}-${(mockTransfers.length + 1).toString().padStart(3, '0')}`,
      transfer_type: 'bank_to_bank',
      status: 'completed',
      amount: payload.amount,
      from_account_id: payload.from_account_id,
      from_account_name: 'Source Bank Account',
      from_account_type: 'bank',
      to_account_id: payload.to_account_id,
      to_account_name: 'Destination Bank Account',
      to_account_type: 'bank',
      date: payload.date,
      notes: payload.notes,
      fee: payload.fee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockTransfers.unshift(newTransfer);

    return newTransfer;
    // return apiClient.post<AccountTransfer>('/account-transfers/bank-to-bank', payload);
  },

  // Transfer to wallet
  transferToWallet: async (payload: {
    from_type: 'cash' | 'bank';
    from_account_id?: string;
    to_wallet_id: string;
    amount: number;
    date: string;
    notes?: string;
    fee?: number;
  }): Promise<AccountTransfer> => {
    const transferType: TransferType = payload.from_type === 'cash' ? 'cash_to_wallet' : 'bank_to_wallet';

    if (payload.from_type === 'cash' && payload.amount > mockCashBalance) {
      throw new Error('Insufficient cash in hand');
    }

    const newTransfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      reference_number: `TRF-${new Date().getFullYear()}-${(mockTransfers.length + 1).toString().padStart(3, '0')}`,
      transfer_type: transferType,
      status: 'completed',
      amount: payload.amount,
      from_account_id: payload.from_account_id,
      from_account_name: payload.from_type === 'cash' ? 'Cash in Hand' : 'Bank Account',
      from_account_type: payload.from_type,
      to_account_id: payload.to_wallet_id,
      to_account_name: 'Wallet',
      to_account_type: 'wallet',
      date: payload.date,
      notes: payload.notes,
      fee: payload.fee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (payload.from_type === 'cash') {
      mockCashBalance -= payload.amount;
    }

    mockTransfers.unshift(newTransfer);

    return newTransfer;
    // return apiClient.post<AccountTransfer>('/account-transfers/to-wallet', payload);
  },

  // Transfer from wallet
  transferFromWallet: async (payload: {
    from_wallet_id: string;
    to_type: 'cash' | 'bank';
    to_account_id?: string;
    amount: number;
    date: string;
    notes?: string;
    fee?: number;
  }): Promise<AccountTransfer> => {
    const transferType: TransferType = payload.to_type === 'cash' ? 'wallet_to_cash' : 'wallet_to_bank';

    const newTransfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      reference_number: `TRF-${new Date().getFullYear()}-${(mockTransfers.length + 1).toString().padStart(3, '0')}`,
      transfer_type: transferType,
      status: 'completed',
      amount: payload.amount,
      from_account_id: payload.from_wallet_id,
      from_account_name: 'Wallet',
      from_account_type: 'wallet',
      to_account_id: payload.to_account_id,
      to_account_name: payload.to_type === 'cash' ? 'Cash in Hand' : 'Bank Account',
      to_account_type: payload.to_type,
      date: payload.date,
      notes: payload.notes,
      fee: payload.fee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (payload.to_type === 'cash') {
      mockCashBalance += payload.amount;
    }

    mockTransfers.unshift(newTransfer);

    return newTransfer;
    // return apiClient.post<AccountTransfer>('/account-transfers/from-wallet', payload);
  },

  // Cancel a pending transfer
  cancel: async (id: string): Promise<AccountTransfer> => {
    const transfer = mockTransfers.find((t) => t.id === id);
    if (!transfer) {
      throw new Error('Transfer not found');
    }
    if (transfer.status !== 'pending') {
      throw new Error('Only pending transfers can be cancelled');
    }

    transfer.status = 'cancelled';
    transfer.updated_at = new Date().toISOString();

    return transfer;
    // return apiClient.post<AccountTransfer>(`/account-transfers/${id}/cancel`);
  },

  // Get recent transfers
  getRecent: async (limit?: number): Promise<AccountTransfer[]> => {
    return mockTransfers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit || 5);
    // const response = await apiClient.get<PaginatedResponse<AccountTransfer>>('/account-transfers', {
    //   limit: limit || 5,
    //   sort_by: 'created_at',
    //   sort_order: 'desc',
    // });
    // return response.data;
  },

  // Get today's transfers
  getToday: async (): Promise<AccountTransfer[]> => {
    const today = new Date().toISOString().split('T')[0];
    return mockTransfers.filter((t) => t.date === today);
    // const response = await apiClient.get<PaginatedResponse<AccountTransfer>>('/account-transfers', {
    //   start_date: today,
    //   end_date: today,
    // });
    // return response.data;
  },

  // Get transfer summary for a period
  getSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_deposits: number;
    total_withdrawals: number;
    total_bank_transfers: number;
    total_wallet_transfers: number;
    transfer_count: number;
  }> => {
    let transfers = [...mockTransfers];

    if (startDate) {
      transfers = transfers.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      transfers = transfers.filter((t) => t.date <= endDate);
    }

    const summary = {
      total_deposits: transfers
        .filter((t) => t.transfer_type === 'cash_to_bank')
        .reduce((sum, t) => sum + t.amount, 0),
      total_withdrawals: transfers
        .filter((t) => t.transfer_type === 'bank_to_cash')
        .reduce((sum, t) => sum + t.amount, 0),
      total_bank_transfers: transfers
        .filter((t) => t.transfer_type === 'bank_to_bank')
        .reduce((sum, t) => sum + t.amount, 0),
      total_wallet_transfers: transfers
        .filter((t) => ['cash_to_wallet', 'wallet_to_cash', 'bank_to_wallet', 'wallet_to_bank'].includes(t.transfer_type))
        .reduce((sum, t) => sum + t.amount, 0),
      transfer_count: transfers.length,
    };

    return summary;
    // return apiClient.get<{...}>('/account-transfers/summary', { start_date: startDate, end_date: endDate });
  },
};

export default accountTransfersApi;
