// navigation/ProtectedStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Permission, Role } from '../types/rbac.types';
import AddTransactionScreen from '../screens/AddTransaction/AddTransactionScreen';
import { ROUTES } from '../constants/routes';
import SplashScreen from '../screens/Splash/SplashScreen';
import Splash2Screen from '../screens/Splash/Splash2Screen';
import Splash3Screen from '../screens/Splash/Splash3Screen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import BiometricVerificationScreen from '../screens/Auth/BiometricVerificationScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
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
import { NavigationProps } from '../types';

const Stack = createStackNavigator();

export const ProtectedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={HomeScreen} />

      <Stack.Screen name="Transaction">
        {props => (
          <ProtectedRoute requiredPermission={Permission.TRANSACTION_CREATE}>
            <HomeScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Reports">
        {props => (
          <ProtectedRoute requiredPermission={Permission.REPORT_VIEW_BASIC}>
            <AddTransactionScreen
              {...(props as NavigationProps<'AddTransaction'>)}
            />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Settings">
        {props => (
          <ProtectedRoute
            requiredRole={[Role.ADMIN, Role.SUPER_ADMIN]}
            requiredPermission={Permission.SETTINGS_VIEW}
          >
            <BankAccountDetailsScreen
              {...(props as NavigationProps<'BankAccountDetails'>)}
            />
          </ProtectedRoute>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
