import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { ROUTES } from '../constants/routes';
import { useTheme } from '../store/hooks';

// Auth & Onboarding Screens
import SplashScreen from '../screens/Splash/SplashScreen';
import Splash2Screen from '../screens/Splash/Splash2Screen';
import Splash3Screen from '../screens/Splash/Splash3Screen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import BiometricVerificationScreen from '../screens/Auth/BiometricVerificationScreen';

// Main Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// Feature Screens
import AddTransactionScreen from '../screens/AddTransaction/AddTransactionScreen';
import AIAssistantScreen from '../screens/AIAssistant/AIAssistantScreen';
import AIChatScreen from '../screens/AIAssistant/AIChatScreen';
import ProfileManagementScreen from '../screens/Profile/ProfileManagementScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import BalanceAccountsScreen from '../screens/Balance/BalanceAccountsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistory/TransactionHistoryScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import ScheduledPaymentsScreen from '../screens/ScheduledPayments/ScheduledPaymentsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import BankAccountDetailsScreen from '../screens/BankAccountDetails/BankAccountDetailsScreen';

// Transaction Flow Navigators
import ReceiptFlowNavigator from '../screens/ManualTranasactions/receipt/ReceiptFlowNavigator';
import SalesFlowNavigator from '../screens/ManualTranasactions/sales/screens/SalesFlowNavigator';
import PurchaseFlowNavigator from '../screens/ManualTranasactions/purchases/PurchaseFlowNavigator';
import ExpenseFlowNavigator from '../screens/ManualTranasactions/expense/ExpenseFlowNavigator';
import BankTransferFlowNavigator from '../screens/ManualTranasactions/bankTransfer/BankTransferFlowNavigator';
import SupplierPaymentFlowNavigator from '../screens/ManualTranasactions/supplierPayment/SupplierPaymentFlowNavigator';
import AccountTransferFlowNavigator from '../screens/ManualTranasactions/accountTransfer/AccountTransferFlowNavigator';

// Transaction Management Screens
import TransactionListScreen from '../screens/TransactionManagement/TransactionListScreen';
import TransactionDetailScreen from '../screens/TransactionManagement/TransactionDetailScreen';
import TransactionFilterScreen from '../screens/TransactionManagement/TransactionFilterScreen';
import TransactionSearchScreen from '../screens/TransactionManagement/TransactionSearchScreen';
import TransactionStatsScreen from '../screens/TransactionManagement/TransactionStatsScreen';
import EditTransactionFlowNavigator from '../screens/EditTransaction/EditTransactionFlowNavigator';

// Customer Screens
import {
  CustomersListScreen,
  CustomerDetailScreen,
  CustomerLedgerScreen,
  AddCustomerScreen,
  EditCustomerScreen,
} from '../screens/Customers';

// Supplier Screens
import {
  SuppliersListScreen,
  SupplierDetailScreen,
  SupplierLedgerScreen,
  AddSupplierScreen,
  EditSupplierScreen,
} from '../screens/Suppliers';

// Bank Account Screens
import {
  BankAccountsListScreen,
  BankAccountDetailScreen,
  AddBankAccountScreen,
  EditBankAccountScreen,
} from '../screens/BankAccounts';

// Inventory/Product Screens
import {
  ProductsListScreen,
  ProductDetailScreen,
  AddProductScreen,
  EditProductScreen,
} from '../screens/Inventory';

// Directory Screen
import DirectoryScreen from '../screens/Directory/DirectoryScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* Onboarding & Auth */}
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.SPLASH2} component={Splash2Screen} />
        <Stack.Screen name={ROUTES.SPLASH3} component={Splash3Screen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
        <Stack.Screen
          name={ROUTES.FORGOT_PASSWORD}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name={ROUTES.BIOMETRIC_VERIFICATION}
          component={BiometricVerificationScreen}
        />

        {/* Main App with Tab Navigation */}
        <Stack.Screen
          name={ROUTES.HOME}
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
        />

        {/* Directory */}
        <Stack.Screen
          name={ROUTES.DIRECTORY}
          component={DirectoryScreen}
          options={{ title: 'Directory' }}
        />

        {/* Transaction Entry */}
        <Stack.Screen
          name={ROUTES.TRANSCATIONS}
          component={AddTransactionScreen}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_RECEIPT}
          component={ReceiptFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_SALES}
          component={SalesFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_PURCHASE}
          component={PurchaseFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_EXPENSE}
          component={ExpenseFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_BANK}
          component={BankTransferFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_SUPPLIER_PAYMENT}
          component={SupplierPaymentFlowNavigator}
        />
        <Stack.Screen
          name={ROUTES.ADD_TRANSACTION_ACCOUNT_TRANSFER}
          component={AccountTransferFlowNavigator}
        />

        {/* AI Features */}
        <Stack.Screen
          name={ROUTES.AI_ASSISTANT}
          component={AIAssistantScreen}
        />
        <Stack.Screen name={ROUTES.AI_CHAT} component={AIChatScreen} />

        {/* Profile & Settings */}
        <Stack.Screen
          name={ROUTES.PROFILE}
          component={ProfileManagementScreen}
        />

        {/* Financial Features */}
        <Stack.Screen name={ROUTES.STATISTICS} component={StatisticsScreen} />
        <Stack.Screen
          name={ROUTES.BALANCE_ACCOUNTS}
          component={BalanceAccountsScreen}
        />
        <Stack.Screen
          name={ROUTES.TRANSACTION_HISTORY}
          component={TransactionHistoryScreen}
        />
        <Stack.Screen name={ROUTES.BUDGET} component={BudgetScreen} />
        <Stack.Screen name={ROUTES.EXPENSES} component={ExpensesScreen} />
        <Stack.Screen
          name={ROUTES.SCHEDULED_PAYMENTS}
          component={ScheduledPaymentsScreen}
        />
        <Stack.Screen
          name={ROUTES.NOTIFICATIONS}
          component={NotificationsScreen}
        />
        <Stack.Screen
          name={ROUTES.BANK_ACCOUNT_DETAILS}
          component={BankAccountDetailsScreen}
        />

        {/* Transaction Management */}
        <Stack.Screen
          name={ROUTES.TRANSACTION_LIST}
          component={TransactionListScreen}
        />
        <Stack.Screen
          name={ROUTES.TRANSCATION_DETAIL}
          component={TransactionDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.TRANSACTION_FILTER}
          component={TransactionFilterScreen}
        />
        <Stack.Screen
          name={ROUTES.TRANSACTION_SEARCH}
          component={TransactionSearchScreen}
        />
        <Stack.Screen
          name={ROUTES.TRANSACTION_STATS}
          component={TransactionStatsScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_TRANSACTION_FLOW}
          component={EditTransactionFlowNavigator}
          options={{ presentation: 'modal' }}
        />

        {/* Customer Screens */}
        <Stack.Screen
          name={ROUTES.CUSTOMERS_LIST}
          component={CustomersListScreen}
        />
        <Stack.Screen
          name={ROUTES.CUSTOMER_DETAIL}
          component={CustomerDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.CUSTOMER_LEDGER}
          component={CustomerLedgerScreen}
        />
        <Stack.Screen
          name={ROUTES.ADD_CUSTOMER}
          component={AddCustomerScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_CUSTOMER}
          component={EditCustomerScreen}
          options={{ title: 'Edit Customer' }}
        />

        {/* Supplier Screens */}
        <Stack.Screen
          name={ROUTES.SUPPLIERS_LIST}
          component={SuppliersListScreen}
        />
        <Stack.Screen
          name={ROUTES.SUPPLIER_DETAIL}
          component={SupplierDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.SUPPLIER_LEDGER}
          component={SupplierLedgerScreen}
        />
        <Stack.Screen
          name={ROUTES.ADD_SUPPLIER}
          component={AddSupplierScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_SUPPLIER}
          component={EditSupplierScreen}
        />

        {/* Bank Account Screens */}
        <Stack.Screen
          name={ROUTES.BANK_ACCOUNTS_LIST}
          component={BankAccountsListScreen}
        />
        <Stack.Screen
          name={ROUTES.BANK_ACCOUNT_DETAIL}
          component={BankAccountDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.ADD_BANK_ACCOUNT}
          component={AddBankAccountScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_BANK_ACCOUNT}
          component={EditBankAccountScreen}
        />

        {/* Inventory/Product Screens */}
        <Stack.Screen
          name={ROUTES.INVENTORY_LIST}
          component={ProductsListScreen}
        />
        <Stack.Screen
          name={ROUTES.PRODUCT_DETAIL}
          component={ProductDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.ADD_PRODUCT}
          component={AddProductScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_PRODUCT}
          component={EditProductScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
