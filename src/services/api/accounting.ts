import apiClient from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type RootType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
export type AccountType =
  | 'Cash'
  | 'Bank'
  | 'Receivable'
  | 'Payable'
  | 'Fixed Asset'
  | 'Revenue'
  | 'Expense'
  | 'Equity';

export interface Account {
  id: number;
  accountCode: string;
  accountName: string;
  rootType: RootType;
  accountType?: AccountType;
  parentId?: number;
  isGroup: boolean;
  isActive: boolean;
  currentBalance?: number;
  children?: Account[];
}

export interface JournalEntry {
  id: number;
  voucherNumber: string;
  postingDate: string;
  entryType: string;
  totalDebit: number;
  totalCredit: number;
  remarks?: string;
  entries: JournalEntryLine[];
  createdAt: string;
}

export interface JournalEntryLine {
  id: number;
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  remarks?: string;
  partyType?: 'Customer' | 'Supplier';
  partyId?: number;
  partyName?: string;
}

export interface GLEntry {
  id: number;
  postingDate: string;
  voucherType: string;
  voucherNumber: string;
  debit: number;
  credit: number;
  runningBalance: number;
  remarks?: string;
  partyType?: string;
  partyName?: string;
}

export interface GLReport {
  accountId: number;
  accountName: string;
  accountCode: string;
  openingBalance: number;
  entries: GLEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface TrialBalance {
  asOfDate: string;
  accounts: {
    accountId: number;
    accountCode: string;
    accountName: string;
    rootType: RootType;
    debit: number;
    credit: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface ProfitLoss {
  fromDate: string;
  toDate: string;
  income: {
    accountId: number;
    accountCode: string;
    accountName: string;
    amount: number;
  }[];
  totalIncome: number;
  expenses: {
    accountId: number;
    accountCode: string;
    accountName: string;
    amount: number;
  }[];
  totalExpenses: number;
  netProfitLoss: number;
  isProfit: boolean;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: {
    accountId: number;
    accountCode: string;
    accountName: string;
    amount: number;
    children?: any[];
  }[];
  totalAssets: number;
  liabilities: {
    accountId: number;
    accountCode: string;
    accountName: string;
    amount: number;
  }[];
  totalLiabilities: number;
  equity: {
    accountId: number;
    accountCode: string;
    accountName: string;
    amount: number;
  }[];
  totalEquity: number;
  retainedEarnings: number;
}

export interface CashFlow {
  period: { from: string; to: string };
  openingCashBalance: number;
  operatingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  investingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  financingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  netCashChange: number;
  closingCashBalance: number;
}

export interface AgedReceivables {
  asOfDate: string;
  customers: {
    customerId: number;
    customerName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  }[];
  totals: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  };
}

export interface AgedPayables {
  asOfDate: string;
  suppliers: {
    supplierId: number;
    supplierName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  }[];
  totals: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  };
}

export interface CreateAccountPayload {
  accountCode: string;
  accountName: string;
  rootType: RootType;
  accountType?: AccountType;
  parentId?: number;
  isGroup?: boolean;
}

export interface RecurringOptions {
  entryName: string;
  description?: string;
  frequencyType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequencyInterval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  autoGenerate: boolean;
  autoPost: boolean;
  generateDaysBefore: number;
}

export interface CreateJournalEntryPayload {
  entryType?: string;
  postingDate: string;
  entries: {
    accountId: number;
    debit: number;
    credit: number;
    remarks?: string;
    partyType?: 'Customer' | 'Supplier';
    partyId?: number;
  }[];
  referenceNumber?: string;
  remarks?: string;
  makeRecurring?: boolean;
  recurringOptions?: RecurringOptions;
}

export interface AccountFilters {
  rootType?: RootType;
  accountType?: AccountType;
  includeInactive?: boolean;
  flat?: boolean;
  search?: string;
}

export interface GLReportFilters {
  accountId: number;
  fromDate?: string;
  toDate?: string;
  partyType?: string;
  partyId?: number;
  page?: number;
  limit?: number;
}

// Mock data
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 1,
    accountCode: '1000',
    accountName: 'Assets',
    rootType: 'Asset',
    isGroup: true,
    isActive: true,
    children: [
      {
        id: 2,
        accountCode: '1100',
        accountName: 'Current Assets',
        rootType: 'Asset',
        isGroup: true,
        isActive: true,
        children: [
          {
            id: 3,
            accountCode: '1110',
            accountName: 'Cash in Hand',
            rootType: 'Asset',
            accountType: 'Cash',
            isGroup: false,
            isActive: true,
            currentBalance: 100000,
          },
          {
            id: 4,
            accountCode: '1120',
            accountName: 'Bank Accounts',
            rootType: 'Asset',
            accountType: 'Bank',
            isGroup: false,
            isActive: true,
            currentBalance: 250000,
          },
          {
            id: 5,
            accountCode: '1130',
            accountName: 'Accounts Receivable',
            rootType: 'Asset',
            accountType: 'Receivable',
            isGroup: false,
            isActive: true,
            currentBalance: 430000,
          },
        ],
      },
    ],
  },
  {
    id: 10,
    accountCode: '2000',
    accountName: 'Liabilities',
    rootType: 'Liability',
    isGroup: true,
    isActive: true,
    children: [
      {
        id: 11,
        accountCode: '2100',
        accountName: 'Accounts Payable',
        rootType: 'Liability',
        accountType: 'Payable',
        isGroup: false,
        isActive: true,
        currentBalance: 120000,
      },
      {
        id: 12,
        accountCode: '2200',
        accountName: 'Sales Tax Payable',
        rootType: 'Liability',
        isGroup: false,
        isActive: true,
        currentBalance: 45000,
      },
    ],
  },
  {
    id: 20,
    accountCode: '4000',
    accountName: 'Income',
    rootType: 'Income',
    isGroup: true,
    isActive: true,
    children: [
      {
        id: 21,
        accountCode: '4100',
        accountName: 'Sales Revenue',
        rootType: 'Income',
        accountType: 'Revenue',
        isGroup: false,
        isActive: true,
        currentBalance: 500000,
      },
    ],
  },
  {
    id: 30,
    accountCode: '5000',
    accountName: 'Expenses',
    rootType: 'Expense',
    isGroup: true,
    isActive: true,
    children: [
      {
        id: 31,
        accountCode: '5100',
        accountName: 'Cost of Goods Sold',
        rootType: 'Expense',
        accountType: 'Expense',
        isGroup: false,
        isActive: true,
        currentBalance: 300000,
      },
      {
        id: 32,
        accountCode: '6100',
        accountName: 'Salary Expense',
        rootType: 'Expense',
        accountType: 'Expense',
        isGroup: false,
        isActive: true,
        currentBalance: 100000,
      },
    ],
  },
];

const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Accounting API
export const accountingApi = {
  // Get chart of accounts
  getAccounts: async (
    filters?: AccountFilters,
  ): Promise<{ data: Account[] }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let accounts = [...MOCK_ACCOUNTS];

      if (filters?.rootType) {
        accounts = accounts.filter(a => a.rootType === filters.rootType);
      }
      if (filters?.flat) {
        // Flatten the tree
        const flattenAccounts = (accs: Account[]): Account[] => {
          return accs.reduce((flat, acc) => {
            flat.push(acc);
            if (acc.children) {
              flat.push(...flattenAccounts(acc.children));
            }
            return flat;
          }, [] as Account[]);
        };
        return { data: flattenAccounts(accounts) };
      }

      return { data: accounts };
    }
    return apiClient.get<{ data: Account[] }>('/accounting/accounts', filters);
  },

  // Get account by ID
  getAccountById: async (id: number): Promise<Account> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const findAccount = (accounts: Account[]): Account | undefined => {
        for (const acc of accounts) {
          if (acc.id === id) return acc;
          if (acc.children) {
            const found = findAccount(acc.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      const account = findAccount(MOCK_ACCOUNTS);
      if (!account) throw new Error('Account not found');
      return account;
    }
    return apiClient.get<Account>(`/accounting/accounts/${id}`);
  },

  // Create account
  createAccount: async (
    payload: CreateAccountPayload,
  ): Promise<{ data: Account }> => {
    return apiClient.post<{ data: Account }>('/accounting/accounts', payload);
  },

  // Update account
  updateAccount: async (
    id: number,
    payload: Partial<CreateAccountPayload>,
  ): Promise<{ data: Account }> => {
    return apiClient.patch<{ data: Account }>(
      `/accounting/accounts/${id}`,
      payload,
    );
  },

  // Get journal entries
  getJournalEntries: async (filters?: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: JournalEntry[]; total: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { data: [], total: 0 };
    }
    return apiClient.get<{ data: JournalEntry[]; total: number }>(
      '/accounting/journal-entries',
      filters,
    );
  },

  // Create journal entry
  createJournalEntry: async (
    payload: CreateJournalEntryPayload,
  ): Promise<{ data: JournalEntry }> => {
    return apiClient.post<{ data: JournalEntry }>(
      '/accounting/journal-entries',
      payload,
    );
  },

  // Get GL report
  getGLReport: async (
    filters: GLReportFilters,
  ): Promise<{ data: GLReport }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          accountId: filters.accountId,
          accountName: 'Cash in Hand',
          accountCode: '1110',
          openingBalance: 100000,
          entries: [],
          totalDebit: 0,
          totalCredit: 0,
          closingBalance: 100000,
        },
      };
    }
    return apiClient.get<{ data: GLReport }>('/accounting/gl-report', filters);
  },

  // Get trial balance
  getTrialBalance: async (
    asOfDate?: string,
    includeZeroBalance?: boolean,
  ): Promise<{ data: TrialBalance }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          asOfDate: asOfDate || new Date().toISOString().split('T')[0],
          accounts: [
            {
              accountId: 3,
              accountCode: '1110',
              accountName: 'Cash in Hand',
              rootType: 'Asset',
              debit: 100000,
              credit: 0,
            },
            {
              accountId: 4,
              accountCode: '1120',
              accountName: 'Bank Accounts',
              rootType: 'Asset',
              debit: 250000,
              credit: 0,
            },
            {
              accountId: 5,
              accountCode: '1130',
              accountName: 'Accounts Receivable',
              rootType: 'Asset',
              debit: 430000,
              credit: 0,
            },
            {
              accountId: 11,
              accountCode: '2100',
              accountName: 'Accounts Payable',
              rootType: 'Liability',
              debit: 0,
              credit: 120000,
            },
            {
              accountId: 21,
              accountCode: '4100',
              accountName: 'Sales Revenue',
              rootType: 'Income',
              debit: 0,
              credit: 500000,
            },
            {
              accountId: 31,
              accountCode: '5100',
              accountName: 'Cost of Goods Sold',
              rootType: 'Expense',
              debit: 300000,
              credit: 0,
            },
          ],
          totalDebit: 1080000,
          totalCredit: 620000,
          isBalanced: false, // For demo
        },
      };
    }
    return apiClient.get<{ data: TrialBalance }>(
      '/accounting/reports/trial-balance',
      { asOfDate, includeZeroBalance },
    );
  },

  // Get profit & loss
  getProfitLoss: async (
    fromDate: string,
    toDate: string,
  ): Promise<{ data: ProfitLoss }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          fromDate,
          toDate,
          income: [
            {
              accountId: 21,
              accountCode: '4100',
              accountName: 'Sales Revenue',
              amount: 500000,
            },
          ],
          totalIncome: 500000,
          expenses: [
            {
              accountId: 31,
              accountCode: '5100',
              accountName: 'Cost of Goods Sold',
              amount: 300000,
            },
            {
              accountId: 32,
              accountCode: '6100',
              accountName: 'Salary Expense',
              amount: 100000,
            },
          ],
          totalExpenses: 400000,
          netProfitLoss: 100000,
          isProfit: true,
        },
      };
    }
    return apiClient.get<{ data: ProfitLoss }>(
      '/accounting/reports/profit-loss',
      { fromDate, toDate },
    );
  },

  // Get balance sheet
  getBalanceSheet: async (
    asOfDate?: string,
  ): Promise<{ data: BalanceSheet }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          asOfDate: asOfDate || new Date().toISOString().split('T')[0],
          assets: [
            {
              accountId: 3,
              accountCode: '1110',
              accountName: 'Cash in Hand',
              amount: 100000,
            },
            {
              accountId: 4,
              accountCode: '1120',
              accountName: 'Bank Accounts',
              amount: 250000,
            },
            {
              accountId: 5,
              accountCode: '1130',
              accountName: 'Accounts Receivable',
              amount: 430000,
            },
          ],
          totalAssets: 780000,
          liabilities: [
            {
              accountId: 11,
              accountCode: '2100',
              accountName: 'Accounts Payable',
              amount: 120000,
            },
            {
              accountId: 12,
              accountCode: '2200',
              accountName: 'Sales Tax Payable',
              amount: 45000,
            },
          ],
          totalLiabilities: 165000,
          equity: [],
          totalEquity: 515000,
          retainedEarnings: 100000,
        },
      };
    }
    return apiClient.get<{ data: BalanceSheet }>(
      '/accounting/reports/balance-sheet',
      { asOfDate },
    );
  },

  // Get cash flow
  getCashFlow: async (fromDate: string, toDate: string): Promise<CashFlow> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        period: { from: fromDate, to: toDate },
        openingCashBalance: 100000,
        operatingActivities: {
          items: [
            { description: 'Payment Entry', amount: 150000 },
            { description: 'Sales Invoice', amount: -50000 },
          ],
          total: 100000,
        },
        investingActivities: {
          items: [],
          total: 0,
        },
        financingActivities: {
          items: [],
          total: 0,
        },
        netCashChange: 100000,
        closingCashBalance: 200000,
      };
    }
    return apiClient.get<CashFlow>('/accounting/reports/cash-flow', {
      fromDate,
      toDate,
    });
  },

  // Get aged receivables
  getAgedReceivables: async (): Promise<{ data: AgedReceivables }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          asOfDate: new Date().toISOString().split('T')[0],
          customers: [
            {
              customerId: 1,
              customerName: 'Ahmed Electronics',
              current: 25000,
              days30: 50000,
              days60: 30000,
              days90: 20000,
              over90: 0,
              total: 125000,
            },
            {
              customerId: 2,
              customerName: 'Karachi Traders',
              current: 45000,
              days30: 30000,
              days60: 10000,
              days90: 0,
              over90: 0,
              total: 85000,
            },
          ],
          totals: {
            current: 70000,
            days30: 80000,
            days60: 40000,
            days90: 20000,
            over90: 0,
            total: 210000,
          },
        },
      };
    }
    return apiClient.get<{ data: AgedReceivables }>(
      '/accounting/reports/aged-receivables',
    );
  },

  // Get aged payables
  getAgedPayables: async (): Promise<{ data: AgedPayables }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          asOfDate: new Date().toISOString().split('T')[0],
          suppliers: [
            {
              supplierId: 1,
              supplierName: 'Al-Rehman Traders',
              current: 40000,
              days30: 30000,
              days60: 20000,
              days90: 0,
              over90: 0,
              total: 90000,
            },
          ],
          totals: {
            current: 40000,
            days30: 30000,
            days60: 20000,
            days90: 0,
            over90: 0,
            total: 90000,
          },
        },
      };
    }
    return apiClient.get<{ data: AgedPayables }>(
      '/accounting/reports/aged-payables',
    );
  },

  // Get account summary
  getAccountSummary: async (accountId: number): Promise<any> => {
    return apiClient.get<any>('/accounting/reports/summary', { accountId });
  },
};

export default accountingApi;
