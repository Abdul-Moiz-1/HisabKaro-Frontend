import apiClient from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching actual API response
export interface DashboardApiResponse {
  today: string;
  cashBalance: number;
  bankBalance: number;
  totalReceivables: number;
  totalPayables: number;
  todaySales: number;
  todayPurchases: number;
  todayPaymentsReceived: number;
  todayPaymentsMade: number;
  monthlySales: number;
  monthlyPurchases: number;
  monthlyProfit: number;
  overdueInvoices: {
    count: number;
    amount: number;
  };
  recentTransactions: Array<{
    type: string;
    number: string | number;
    party: string;
    amount: number;
    date: string;
  }>;
}

// Normalized dashboard summary for frontend use
export interface DashboardSummary {
  cash_in_hand: number;
  bank_balance: number;
  today_sales: number;
  today_receipts: number;
  total_receivables: number;
  total_payables: number;
  today_purchases: number;
  today_payments_made: number;
  monthly_sales: number;
  monthly_purchases: number;
  monthly_profit: number;
  overdue_invoices_count: number;
  overdue_invoices_amount: number;
  // UI compatibility fields
  pending_invoices_count?: number; // For notification badge
  low_stock_count?: number; // For stock alerts
}

export interface RecentActivity {
  id: string;
  type: 'income' | 'expense' | 'payment_in' | 'payment_out' | 'restock';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
}

export interface DailyTransaction {
  date: string;
  sales: number;
  purchases: number;
  payments_in: number;
  payments_out: number;
  net_flow: number;
}
export interface DashboardData {
  period: { from: string; to: string };
  sales: {
    total: number;
    invoiceCount: number;
    collected: number;
    outstanding: number;
  };
  purchases: {
    total: number;
    invoiceCount: number;
    paid: number;
    payable: number;
  };
  cashPosition: {
    cashInHand: number;
    bankBalance: number;
    totalCash: number;
  };
  receivables: {
    total: number;
    overdue: number;
  };
  payables: {
    total: number;
    overdue: number;
  };
  profitLoss: {
    income: number;
    expenses: number;
    netProfit: number;
  };
  recentTransactions: {
    date: string;
    type: string;
    description: string;
    amount: number;
  }[];
}

export interface SalesReport {
  period: { from: string; to: string };
  totalSales: number;
  invoiceCount: number;
  byCustomer: {
    customerId: number;
    customerName: string;
    totalSales: number;
    invoiceCount: number;
  }[];
  byProduct: {
    productId: number;
    productName: string;
    quantity: number;
    totalAmount: number;
  }[];
  dailyBreakdown: {
    date: string;
    amount: number;
    count: number;
  }[];
}

export interface PurchasesReport {
  period: { from: string; to: string };
  totalPurchases: number;
  invoiceCount: number;
  bySupplier: {
    supplierId: number;
    supplierName: string;
    totalPurchases: number;
    invoiceCount: number;
  }[];
  byProduct: {
    productId: number;
    productName: string;
    quantity: number;
    totalAmount: number;
  }[];
}

export interface PaymentsReport {
  period: { from: string; to: string };
  totalReceipts: number;
  totalPayments: number;
  netCashFlow: number;
  byMode: {
    mode: string;
    receipts: number;
    payments: number;
  }[];
}

export interface TaxReport {
  period: { from: string; to: string };
  salesTax: {
    collected: number;
    invoiceCount: number;
  };
  purchaseTax: {
    paid: number;
    invoiceCount: number;
  };
  netTaxLiability: number;
}

// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

const MOCK_DASHBOARD: DashboardData = {
  period: { from: '2025-01-01', to: '2025-01-31' },
  sales: {
    total: 500000,
    invoiceCount: 25,
    collected: 350000,
    outstanding: 150000,
  },
  purchases: {
    total: 300000,
    invoiceCount: 15,
    paid: 200000,
    payable: 100000,
  },
  cashPosition: {
    cashInHand: 100000,
    bankBalance: 250000,
    totalCash: 350000,
  },
  receivables: {
    total: 430000,
    overdue: 85000,
  },
  payables: {
    total: 120000,
    overdue: 15000,
  },
  profitLoss: {
    income: 550000,
    expenses: 400000,
    netProfit: 150000,
  },
  recentTransactions: [
    {
      date: '2025-01-06',
      type: 'Payment Received',
      description: 'From Ahmed Electronics',
      amount: 50000,
    },
    {
      date: '2025-01-05',
      type: 'Invoice Created',
      description: 'To ABC Trading',
      amount: 75000,
    },
    {
      date: '2025-01-05',
      type: 'Payment Made',
      description: 'To Al-Rehman Traders',
      amount: 50000,
    },
  ],
};

const MOCK_DASHBOARD_API_RESPONSE: DashboardApiResponse = {
  today: new Date().toISOString().split('T')[0],
  cashBalance: 45000,
  bankBalance: 210000,
  totalReceivables: 125000,
  totalPayables: 85000,
  todaySales: 5000,
  todayPurchases: 2500,
  todayPaymentsReceived: 8450,
  todayPaymentsMade: 3000,
  monthlySales: 125000,
  monthlyPurchases: 75000,
  monthlyProfit: 50000,
  overdueInvoices: {
    count: 2,
    amount: 15000,
  },
  recentTransactions: [
    {
      type: 'Sale',
      number: 'INV-001',
      party: 'Imran Bhai',
      amount: 5000,
      date: new Date().toISOString(),
    },
    {
      type: 'Expense',
      number: 'EXP-012',
      party: 'K-Electric',
      amount: 1200,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'Sale',
      number: 'INV-002',
      party: 'Rashid General',
      amount: 8450,
      date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'Purchase',
      number: 'PUR-045',
      party: 'Cable Supplier',
      amount: 12000,
      date: '2024-10-24T09:00:00Z',
    },
  ],
};

const mockDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Reports API
export const reportsApi = {
  // Get dashboard summary (for HomeScreen)
  getDashboard: async (): Promise<DashboardSummary> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const mockData = MOCK_DASHBOARD_API_RESPONSE;
      return {
        cash_in_hand: mockData.cashBalance,
        bank_balance: mockData.bankBalance,
        today_sales: mockData.todaySales,
        today_receipts: mockData.todayPaymentsReceived,
        total_receivables: mockData.totalReceivables,
        total_payables: mockData.totalPayables,
        today_purchases: mockData.todayPurchases,
        today_payments_made: mockData.todayPaymentsMade,
        monthly_sales: mockData.monthlySales,
        monthly_purchases: mockData.monthlyPurchases,
        monthly_profit: mockData.monthlyProfit,
        overdue_invoices_count: mockData.overdueInvoices.count,
        overdue_invoices_amount: mockData.overdueInvoices.amount,
        // UI compatibility fields
        pending_invoices_count: mockData.overdueInvoices.count,
        low_stock_count: 120, // Mock value for low stock items
      };
    }
    const response = await apiClient.get<{ data: DashboardApiResponse }>(
      '/reports/dashboard',
    );
    const data = response.data;

    // Map API response to DashboardSummary format
    return {
      cash_in_hand: data.cashBalance,
      bank_balance: data.bankBalance,
      today_sales: data.todaySales,
      today_receipts: data.todayPaymentsReceived,
      total_receivables: data.totalReceivables,
      total_payables: data.totalPayables,
      today_purchases: data.todayPurchases,
      today_payments_made: data.todayPaymentsMade,
      monthly_sales: data.monthlySales,
      monthly_purchases: data.monthlyPurchases,
      monthly_profit: data.monthlyProfit,
      overdue_invoices_count: data.overdueInvoices.count,
      overdue_invoices_amount: data.overdueInvoices.amount,
      // UI compatibility fields
      pending_invoices_count: data.overdueInvoices.count,
      low_stock_count: 0, // Not available in API, would need separate endpoint
    };
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_DASHBOARD_API_RESPONSE.recentTransactions
        .slice(0, limit)
        .map((t, index) => ({
          id: String(index),
          type:
            t.type.toLowerCase() === 'sale'
              ? 'income'
              : t.type.toLowerCase() === 'purchase'
              ? 'expense'
              : t.type.toLowerCase() === 'payment'
              ? 'payment_in'
              : t.type.toLowerCase() === 'expense'
              ? 'expense'
              : 'restock',
          title: `${t.type} to ${t.party}`,
          subtitle: `${t.type} #${t.number}`,
          amount: t.amount,
          date: t.date,
        }));
    }
    const response = await apiClient.get<{ data: DashboardApiResponse }>(
      '/reports/dashboard',
    );
    return response.data.recentTransactions.slice(0, limit).map((t, index) => ({
      id: String(index),
      type:
        t.type.toLowerCase() === 'sale'
          ? 'income'
          : t.type.toLowerCase() === 'purchase'
          ? 'expense'
          : t.type.toLowerCase() === 'payment'
          ? 'payment_in'
          : 'restock',
      title: `${t.type} - ${t.party}`,
      subtitle: `${t.type} #${t.number}`,
      amount: t.amount,
      date: t.date,
    }));
  },

  // Get daily transactions
  getDailyTransactions: async (
    startDate: string,
    endDate: string,
  ): Promise<DailyTransaction[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Generate mock daily transactions for the date range
      const transactions: DailyTransaction[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        transactions.push({
          date: dateStr,
          sales: Math.floor(Math.random() * 100000) + 20000,
          purchases: Math.floor(Math.random() * 50000) + 10000,
          payments_in: Math.floor(Math.random() * 80000) + 15000,
          payments_out: Math.floor(Math.random() * 40000) + 5000,
          net_flow: Math.floor(Math.random() * 60000) - 10000,
        });
      }
      return transactions;
    }
    return apiClient.get<DailyTransaction[]>('/reports/payments', {
      fromDate: startDate,
      toDate: endDate,
    });
  },

  // Get trends for charts
  getTrends: async (
    type: 'sales' | 'purchases' | 'profit',
    period: 'week' | 'month' | 'year',
  ): Promise<Array<{ label: string; value: number }>> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const labels =
        period === 'week'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : period === 'month'
          ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
          : [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];

      return labels.map(label => ({
        label,
        value: Math.floor(Math.random() * 100000) + 50000,
      }));
    }
    return apiClient.get<Array<{ label: string; value: number }>>(
      `/reports/trends/${type}`,
      { period },
    );
  },
  // Get full dashboard data (alternative with date range)
  getDashboardFull: async (
    fromDate?: string,
    toDate?: string,
  ): Promise<{ data: DashboardData }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { data: MOCK_DASHBOARD };
    }
    return apiClient.get<{ data: DashboardData }>('/reports/dashboard', {
      fromDate,
      toDate,
    });
  },

  // Get sales report
  getSalesReport: async (
    fromDate: string,
    toDate: string,
  ): Promise<{ data: SalesReport }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          period: { from: fromDate, to: toDate },
          totalSales: 500000,
          invoiceCount: 25,
          byCustomer: [
            {
              customerId: 1,
              customerName: 'Ahmed Electronics',
              totalSales: 150000,
              invoiceCount: 8,
            },
            {
              customerId: 2,
              customerName: 'Karachi Traders',
              totalSales: 120000,
              invoiceCount: 6,
            },
          ],
          byProduct: [],
          dailyBreakdown: [],
        },
      };
    }
    return apiClient.get<{ data: SalesReport }>('/reports/sales', {
      fromDate,
      toDate,
    });
  },

  // Get purchases report
  getPurchasesReport: async (
    fromDate: string,
    toDate: string,
  ): Promise<{ data: PurchasesReport }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          period: { from: fromDate, to: toDate },
          totalPurchases: 300000,
          invoiceCount: 15,
          bySupplier: [
            {
              supplierId: 1,
              supplierName: 'Al-Rehman Traders',
              totalPurchases: 180000,
              invoiceCount: 9,
            },
          ],
          byProduct: [],
        },
      };
    }
    return apiClient.get<{ data: PurchasesReport }>('/reports/purchases', {
      fromDate,
      toDate,
    });
  },

  // Get payments report
  getPaymentsReport: async (
    fromDate: string,
    toDate: string,
  ): Promise<{ data: PaymentsReport }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          period: { from: fromDate, to: toDate },
          totalReceipts: 350000,
          totalPayments: 200000,
          netCashFlow: 150000,
          byMode: [
            { mode: 'Cash', receipts: 100000, payments: 50000 },
            { mode: 'Bank Transfer', receipts: 250000, payments: 150000 },
          ],
        },
      };
    }
    return apiClient.get<{ data: PaymentsReport }>('/reports/payments', {
      fromDate,
      toDate,
    });
  },

  // Get aged receivables
  getAgedReceivables: async (): Promise<any> => {
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
    return apiClient.get<any>('/reports/aged-receivables');
  },

  // Get aged payables
  getAgedPayables: async (): Promise<any> => {
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
    return apiClient.get<any>('/reports/aged-payables');
  },

  // Get tax report
  getTaxReport: async (
    fromDate: string,
    toDate: string,
  ): Promise<{ data: TaxReport }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        data: {
          period: { from: fromDate, to: toDate },
          salesTax: {
            collected: 85000,
            invoiceCount: 25,
          },
          purchaseTax: {
            paid: 51000,
            invoiceCount: 15,
          },
          netTaxLiability: 34000,
        },
      };
    }
    return apiClient.get<{ data: TaxReport }>('/reports/tax', {
      fromDate,
      toDate,
    });
  },

  // Quick stats for dashboard cards
  getQuickStats: async (): Promise<{
    todaySales: number;
    todayReceipts: number;
    totalReceivables: number;
    totalPayables: number;
  }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return {
        todaySales: 75000,
        todayReceipts: 50000,
        totalReceivables: 430000,
        totalPayables: 120000,
      };
    }
    const dashboard = await reportsApi.getDashboard();
    return {
      todaySales: dashboard.today_sales,
      todayReceipts: dashboard.today_receipts,
      totalReceivables: dashboard.total_receivables,
      totalPayables: dashboard.total_payables,
    };
  },
};

export default reportsApi;
