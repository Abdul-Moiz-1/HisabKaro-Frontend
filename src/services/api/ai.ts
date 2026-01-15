import apiClient from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type AIIntent = 
  | 'get_cash_balance'
  | 'get_customer_balance'
  | 'get_supplier_balance'
  | 'get_sales_summary'
  | 'get_purchase_summary'
  | 'get_receivables'
  | 'get_payables'
  | 'get_overdue'
  | 'search_invoice'
  | 'get_top_customers'
  | 'get_profit'
  | 'unknown';

export interface AIQueryRequest {
  query: string;
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export interface AIQueryResponse {
  query: string;
  intent: AIIntent;
  confidence: number;
  response: string;
  data?: Record<string, any>;
  suggestions?: string[];
  timestamp: string;
}

export interface AIVoiceRequest {
  audioBase64: string;
  format?: 'wav' | 'mp3' | 'm4a';
}

export interface QuickCashBalance {
  cash: number;
  bank: number;
  total: number;
}

export interface QuickOverdue {
  receivables: {
    count: number;
    total: number;
    customers: { id: number; name: string; amount: number }[];
  };
  payables: {
    count: number;
    total: number;
    suppliers: { id: number; name: string; amount: number }[];
  };
}

// Mock data
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA

const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// AI intent detection
const detectIntent = (query: string): { intent: AIIntent; confidence: number } => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('cash') && lowerQuery.includes('balance')) {
    return { intent: 'get_cash_balance', confidence: 0.95 };
  }
  if (lowerQuery.includes('customer') && (lowerQuery.includes('owe') || lowerQuery.includes('balance'))) {
    return { intent: 'get_customer_balance', confidence: 0.9 };
  }
  if (lowerQuery.includes('supplier') && (lowerQuery.includes('owe') || lowerQuery.includes('payable'))) {
    return { intent: 'get_supplier_balance', confidence: 0.9 };
  }
  if (lowerQuery.includes('sales') && (lowerQuery.includes('summary') || lowerQuery.includes('today') || lowerQuery.includes('month'))) {
    return { intent: 'get_sales_summary', confidence: 0.88 };
  }
  if (lowerQuery.includes('purchase') && (lowerQuery.includes('summary') || lowerQuery.includes('total'))) {
    return { intent: 'get_purchase_summary', confidence: 0.88 };
  }
  if (lowerQuery.includes('receivable') || (lowerQuery.includes('who') && lowerQuery.includes('owe'))) {
    return { intent: 'get_receivables', confidence: 0.9 };
  }
  if (lowerQuery.includes('payable') || (lowerQuery.includes('what') && lowerQuery.includes('owe'))) {
    return { intent: 'get_payables', confidence: 0.9 };
  }
  if (lowerQuery.includes('overdue') || lowerQuery.includes('past due')) {
    return { intent: 'get_overdue', confidence: 0.92 };
  }
  if (lowerQuery.includes('invoice') && (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('show'))) {
    return { intent: 'search_invoice', confidence: 0.85 };
  }
  if (lowerQuery.includes('top') && lowerQuery.includes('customer')) {
    return { intent: 'get_top_customers', confidence: 0.9 };
  }
  if (lowerQuery.includes('profit') || lowerQuery.includes('income')) {
    return { intent: 'get_profit', confidence: 0.88 };
  }
  
  return { intent: 'unknown', confidence: 0.3 };
};

// Generate response based on intent
const generateResponse = (intent: AIIntent): { response: string; data: Record<string, any> } => {
  switch (intent) {
    case 'get_cash_balance':
      return {
        response: 'Cash Position:\n• Cash in Hand: Rs. 100,000\n• Bank Balance: Rs. 250,000\n• Total: Rs. 350,000',
        data: { cash: 100000, bank: 250000, total: 350000 },
      };
    case 'get_customer_balance':
      return {
        response: 'Top Outstanding Balances:\n• Ahmed Electronics: Rs. 125,000\n• Karachi Traders: Rs. 85,000\n• Total Receivables: Rs. 430,000',
        data: { totalReceivables: 430000 },
      };
    case 'get_supplier_balance':
      return {
        response: 'Amounts Payable:\n• Al-Rehman Traders: Rs. 90,400\n• Total Payables: Rs. 120,000',
        data: { totalPayables: 120000 },
      };
    case 'get_sales_summary':
      return {
        response: 'Sales This Month:\n• Total Sales: Rs. 500,000\n• Invoices: 25\n• Collected: Rs. 350,000\n• Outstanding: Rs. 150,000',
        data: { totalSales: 500000, invoiceCount: 25 },
      };
    case 'get_purchase_summary':
      return {
        response: 'Purchases This Month:\n• Total Purchases: Rs. 300,000\n• Invoices: 15\n• Paid: Rs. 200,000\n• Payable: Rs. 100,000',
        data: { totalPurchases: 300000, invoiceCount: 15 },
      };
    case 'get_receivables':
      return {
        response: 'Outstanding Receivables: Rs. 430,000\n\nTop Debtors:\n1. Ahmed Electronics - Rs. 125,000\n2. Shahid General Store - Rs. 175,000\n3. Karachi Traders - Rs. 85,000',
        data: { totalReceivables: 430000 },
      };
    case 'get_payables':
      return {
        response: 'Outstanding Payables: Rs. 120,000\n\nTop Creditors:\n1. Al-Rehman Traders - Rs. 90,400\n2. Other Suppliers - Rs. 29,600',
        data: { totalPayables: 120000 },
      };
    case 'get_overdue':
      return {
        response: 'Overdue Invoices:\n\nReceivables Overdue: Rs. 85,000 (3 invoices)\nPayables Overdue: Rs. 15,000 (1 invoice)',
        data: { overdueReceivables: 85000, overduePayables: 15000 },
      };
    case 'get_top_customers':
      return {
        response: 'Top Customers (This Month):\n1. Ahmed Electronics - Rs. 150,000\n2. Karachi Traders - Rs. 120,000\n3. Faisal Electronics Hub - Rs. 95,000',
        data: { topCustomers: [] },
      };
    case 'get_profit':
      return {
        response: 'Profit Summary (This Month):\n• Total Income: Rs. 550,000\n• Total Expenses: Rs. 400,000\n• Net Profit: Rs. 150,000 ✓',
        data: { income: 550000, expenses: 400000, netProfit: 150000 },
      };
    default:
      return {
        response: "I'm not sure I understand. You can ask me about:\n• Cash balance\n• Sales summary\n• Receivables/Payables\n• Overdue invoices\n• Top customers\n• Profit summary",
        data: {},
      };
  }
};

// AI API
export const aiApi = {
  // Process natural language query
  query: async (request: AIQueryRequest): Promise<AIQueryResponse> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);
      const { intent, confidence } = detectIntent(request.query);
      const { response, data } = generateResponse(intent);
      
      return {
        query: request.query,
        intent,
        confidence,
        response,
        data,
        suggestions: [
          "What's my cash balance?",
          "Show outstanding receivables",
          "Sales summary this month",
        ],
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<AIQueryResponse>('/ai/query', request);
  },

  // Process voice command
  voice: async (request: AIVoiceRequest): Promise<AIQueryResponse> => {
    return apiClient.post<AIQueryResponse>('/ai/voice', request);
  },

  // Get query suggestions
  getSuggestions: async (): Promise<string[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(100);
      return [
        "What's my cash balance?",
        "How much do customers owe?",
        "Show overdue invoices",
        "Sales summary this month",
        "Who are my top customers?",
        "What's my profit this month?",
      ];
    }
    return apiClient.get<string[]>('/ai/suggestions');
  },

  // Quick: Cash balance
  getQuickCashBalance: async (): Promise<QuickCashBalance> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return { cash: 100000, bank: 250000, total: 350000 };
    }
    return apiClient.get<QuickCashBalance>('/ai/quick/cash-balance');
  },

  // Quick: Overdue
  getQuickOverdue: async (): Promise<QuickOverdue> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return {
        receivables: {
          count: 3,
          total: 85000,
          customers: [
            { id: 1, name: 'Ahmed Electronics', amount: 45000 },
            { id: 3, name: 'Bismillah Store', amount: 25000 },
          ],
        },
        payables: {
          count: 1,
          total: 15000,
          suppliers: [
            { id: 1, name: 'Al-Rehman Traders', amount: 15000 },
          ],
        },
      };
    }
    return apiClient.get<QuickOverdue>('/ai/quick/overdue');
  },

  // Quick: Receivables
  getQuickReceivables: async (): Promise<{ total: number; count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return { total: 430000, count: 6 };
    }
    return apiClient.get<{ total: number; count: number }>('/ai/quick/receivables');
  },

  // Quick: Payables
  getQuickPayables: async (): Promise<{ total: number; count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return { total: 120000, count: 3 };
    }
    return apiClient.get<{ total: number; count: number }>('/ai/quick/payables');
  },

  // Quick: Sales this month
  getQuickSalesThisMonth: async (): Promise<{ total: number; count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      return { total: 500000, count: 25 };
    }
    return apiClient.get<{ total: number; count: number }>('/ai/quick/sales-this-month');
  },
};

export default aiApi;
