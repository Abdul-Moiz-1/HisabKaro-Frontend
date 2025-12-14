import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { ROUTES } from '../constants/routes';
import { useTheme } from '../store/hooks';
import SplashScreen from '../screens/Splash/SplashScreen';
import Splash2Screen from '../screens/Splash/Splash2Screen';
import Splash3Screen from '../screens/Splash/Splash3Screen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import BiometricVerificationScreen from '../screens/Auth/BiometricVerificationScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import AddTransactionScreen from '../screens/AddTransaction/AddTransactionScreen';
import AIAssistantScreen from '../screens/AIAssistant/AIAssistantScreen';
import AIChatScreen from '../screens/AIAssistant/AIChatScreen';
import MenuScreen from '../screens/Menu/MenuScreen';
import ProfileManagementScreen from '../screens/Profile/ProfileManagementScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import BalanceAccountsScreen from '../screens/Balance/BalanceAccountsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistory/TransactionHistoryScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import ScheduledPaymentsScreen from '../screens/ScheduledPayments/ScheduledPaymentsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import BankAccountDetailsScreen from '../screens/BankAccountDetails/BankAccountDetailsScreen';
import TransactionManualEntryScreen from '../screens/TransactionManualEntry/TransactionManualEntry';
import ReceiptFlowNavigator from '../screens/ManualTranasactions/receipt/ReceiptFlowNavigator';
import SalesFlowNavigator from '../screens/ManualTranasactions/sales/screens/SalesFlowNavigator';
import PurchaseFlowNavigator from '../screens/ManualTranasactions/purchases/PurchaseFlowNavigator';
import ExpenseFlowNavigator from '../screens/ManualTranasactions/expense/ExpenseFlowNavigator';
import BankTransferFlowNavigator from '../screens/ManualTranasactions/bankTransfer/BankTransferFlowNavigator';
import SupplierPaymentFlowNavigator from '../screens/ManualTranasactions/supplierPayment/SupplierPaymentFlowNavigator';
import AccountTransferFlowNavigator from '../screens/ManualTranasactions/accountTransfer/AccountTransferFlowNavigator';
import TransactionListScreen from '../screens/TransactionManagement/TransactionListScreen';
import TransactionDetailScreen from '../screens/TransactionManagement/TransactionDetailScreen';
import TransactionFilterScreen from '../screens/TransactionManagement/TransactionFilterScreen';
import TransactionSearchScreen from '../screens/TransactionManagement/TransactionSearchScreen';
import TransactionStatsScreen from '../screens/TransactionManagement/TransactionStatsScreen';
import EditTransactionScreen from '../screens/EditTransaction/screens/EditTransactionScreen';
import EditConfirmationScreen from '../screens/EditTransaction/screens/EditConfirmationScreen';
import EditHistoryScreen from '../screens/EditTransaction/screens/EditHistoryScreen';
import EditTransactionFlowNavigator from '../screens/EditTransaction/EditTransactionFlowNavigator';

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
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.SPLASH2} component={Splash2Screen} />
        <Stack.Screen name={ROUTES.SPLASH3} component={Splash3Screen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
        <Stack.Screen
          name={ROUTES.FORGOT_PASSWORD}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
        <Stack.Screen name={ROUTES.ANALYTICS} component={AnalyticsScreen} />

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
        <Stack.Screen
          name={ROUTES.AI_ASSISTANT}
          component={AIAssistantScreen}
        />
        <Stack.Screen name={ROUTES.AI_CHAT} component={AIChatScreen} />
        <Stack.Screen name={ROUTES.MENU} component={MenuScreen} />
        <Stack.Screen
          name={ROUTES.PROFILE}
          component={ProfileManagementScreen}
        />
        <Stack.Screen
          name={ROUTES.BIOMETRIC_VERIFICATION}
          component={BiometricVerificationScreen}
        />
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
          name={ROUTES.TRANSACTION_LIST}
          component={TransactionListScreen}
        />
        <Stack.Screen
          name={ROUTES.BANK_ACCOUNT_DETAILS}
          component={BankAccountDetailsScreen}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
