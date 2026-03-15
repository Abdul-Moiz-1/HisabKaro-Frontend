import { NavigatorScreenParams } from '@react-navigation/native';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
}

export type EditTransactionFlowParamList = {
  EditTransaction: { transaction: any };
  SelectParty: {
    currentParty?: any;
    partyType: 'Customer' | 'Supplier';
    flowData?: any;
  };
  SelectItems: {
    currentItems?: any[];
    transactionType: string;
    flowData?: any;
  };
  SelectCategory: { currentCategory?: string; flowData?: any };
  EditConfirmation: { transaction: any; changes: any };
  EditHistory: { transaction: any };
};

export type RootStackParamList = {
  Splash: undefined;
  Splash2: undefined;
  Splash3: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home?: { userId?: string };
  Analytics: undefined;
  Transactions: undefined;
  AddTransactionManual: undefined;
  AIAssistant: undefined;
  Receipt: undefined;
  Sales: undefined;
  Purchases: undefined;
  Expense: undefined;
  Bank: undefined;
  SupplierPayment: undefined;
  AccountTransfer: undefined;
  AIChat?: { chatId?: string };
  Menu: undefined;
  Profile: undefined;
  BiometricVerification: undefined;
  Statistics: undefined;
  BalanceAccounts: undefined;
  TransactionHistory: undefined;
  Budget: undefined;
  Expenses: undefined;
  ScheduledPayments: undefined;
  Notifications: undefined;
  TransactionList: undefined;
  TransactionDetail: { transaction: any };
  TransactionFilter: undefined;
  TransactionSearch: undefined;
  TransactionStats: undefined;
  BankAccountDetails: { accountId: string; accountName: string };
  // EditTransaction: { transaction: any };
  EditTransactionFlow: NavigatorScreenParams<EditTransactionFlowParamList>;
  // EditConfirmation: { transaction: any; changes: any };
  // EditHistory: { transaction: any };
  // Customer Screens
  CustomersList: undefined;
  CustomerDetail: { customerId: string };
  CustomerLedger: { customerId: string; customerName: string };
  AddCustomer: { fromFlow?: boolean } | undefined;
  EditCustomer: { customerId: string };
  // Supplier Screens
  SuppliersList: undefined;
  SupplierDetail: { supplierId: string };
  SupplierLedger: { supplierId: string; supplierName: string };
  AddSupplier: undefined;
  EditSupplier: { supplierId: string };
  // Bank Account Screens
  BankAccountsList: undefined;
  BankAccountDetail: { accountId: string };
  AddBankAccount: undefined;
  EditBankAccount: { accountId: string };
  // Inventory/Product Screens
  InventoryList: undefined;
  ProductsList: undefined;
  ProductDetail: { productId: string };
  AddProduct: { fromFlow?: boolean } | undefined;
  EditProduct: { productId: string };
  DirectoryTab: undefined;
  AddJournalEntry: undefined;
  SalesInvoiceList: undefined;
  SalesInvoiceDetail: { invoiceId: number };
  PurchaseInvoiceList: undefined;
  PurchaseInvoiceDetail: { invoiceId: number };
  PaymentsList: undefined;
  PaymentDetail: { paymentId: number };
  // Report Screens
  GeneralJournal: undefined;
  GeneralLedger: { accountId?: number } | undefined;
  ProfitLoss: undefined;
  TrialBalance: undefined;
  BalanceSheet: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: <R extends keyof RootStackParamList>(
      screen: R,
      params?: RootStackParamList[R],
    ) => void;
    goBack: () => void;
    replace: <R extends keyof RootStackParamList>(
      screen: R,
      params?: RootStackParamList[R],
    ) => void;
  };
  route: {
    params?: RootStackParamList[T];
  };
};
