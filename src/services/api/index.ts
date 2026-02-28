// API Client
export { default as apiClient } from './client';
export type { PaginatedResponse, ApiError } from './client';

// Auth API
export { authApi, tokenStorage } from './auth';
export type {
  LoginPayload,
  SignupPayload,
  TokenResponse,
  User,
  AuthResponse,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from './auth';

// Company API
export { companyApi } from './company';
export type {
  Company,
  CompanySettings,
  CompanyUser,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  UpdateSettingsPayload,
  InviteUserPayload,
} from './company';

// Customers API
export { customersApi, WALK_IN_CUSTOMER } from './customers';
export type {
  Customer,
  CustomerStatement,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFilters,
} from './customers';

// Suppliers API
export { suppliersApi } from './suppliers';
export type {
  Supplier,
  SupplierStatement,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierFilters,
} from './suppliers';

// Products API
export { productsApi } from './products';
export type {
  Product,
  ProductCategory,
  CreateProductPayload,
  UpdateProductPayload,
  StockAdjustment,
  ProductFilters,
} from './products';

// Invoices API
export { 
  invoicesApi, 
  salesInvoicesApi, 
  purchaseInvoicesApi 
} from './invoices';
export type {
  Invoice,
  InvoiceItem,
  InvoiceType,
  InvoiceStatus,
  CreateSalesInvoicePayload,
  CreatePurchaseInvoicePayload,
  InvoiceFilters,
  SalesSummary,
  PurchaseSummary,
  GLEntry,
} from './invoices';

// Payments API
export { paymentsApi } from './payments';
export type {
  Payment,
  PaymentType,
  PaymentMode,
  PaymentStatus,
  ChequeStatus,
  InvoiceAllocation,
  ChequeDetails,
  ReceivePaymentPayload,
  PayPaymentPayload,
  PaymentFilters,
  PaymentResponse,
  BankAccount,
  MobileWallet,
  PaymentsSummary,
  PaymentMethod,
  PaymentAllocation,
  CreatePaymentPayload,
} from './payments';

// Bank Accounts API
export { bankAccountsApi } from './bankAccounts';
export type {
  BankAccount as BankAccountFull,
  BankAccountTransaction,
  BankAccountType,
  AccountStatus,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
  BankAccountFilters,
} from './bankAccounts';

// Account Transfers API
export { accountTransfersApi } from './accountTransfers';
export type {
  AccountTransfer,
  CreateTransferPayload,
  TransferFilters,
} from './accountTransfers';

// Expenses API
export { expensesApi } from './expenses';
export type {
  Expense,
  ExpenseCategory,
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseFilters,
} from './expenses';

// Accounting API
export { accountingApi } from './accounting';
export type {
  Account,
  RootType,
  AccountType,
  JournalEntry,
  JournalEntryLine,
  GLReport,
  TrialBalance,
  ProfitLoss,
  BalanceSheet,
  CashFlow,
  AgedReceivables,
  AgedPayables,
  CreateAccountPayload,
  CreateJournalEntryPayload,
  AccountFilters,
  GLReportFilters,
} from './accounting';

// Reports API
export { reportsApi } from './reports';
export type {
  DashboardData,
  SalesReport,
  PurchasesReport,
  PaymentsReport,
  TaxReport,
} from './reports';

// Notifications API
export { notificationsApi } from './notifications';
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationFilters,
  NotificationPreferences,
} from './notifications';

// AI Agent API
export { aiApi } from './ai';
export type {
  AIIntent,
  AIQueryRequest,
  AIQueryResponse,
  AIVoiceRequest,
  QuickCashBalance,
  QuickOverdue,
} from './ai';

// Default exports for convenience
export default {
  auth: () => import('./auth').then(m => m.authApi),
  company: () => import('./company').then(m => m.companyApi),
  customers: () => import('./customers').then(m => m.customersApi),
  suppliers: () => import('./suppliers').then(m => m.suppliersApi),
  products: () => import('./products').then(m => m.productsApi),
  invoices: () => import('./invoices').then(m => m.invoicesApi),
  salesInvoices: () => import('./invoices').then(m => m.salesInvoicesApi),
  purchaseInvoices: () => import('./invoices').then(m => m.purchaseInvoicesApi),
  payments: () => import('./payments').then(m => m.paymentsApi),
  bankAccounts: () => import('./bankAccounts').then(m => m.bankAccountsApi),
  accountTransfers: () => import('./accountTransfers').then(m => m.accountTransfersApi),
  expenses: () => import('./expenses').then(m => m.expensesApi),
  accounting: () => import('./accounting').then(m => m.accountingApi),
  reports: () => import('./reports').then(m => m.reportsApi),
  notifications: () => import('./notifications').then(m => m.notificationsApi),
  ai: () => import('./ai').then(m => m.aiApi),
};
