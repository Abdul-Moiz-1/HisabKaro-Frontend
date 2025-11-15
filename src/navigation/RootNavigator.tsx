import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
        <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
        <Stack.Screen name={ROUTES.ANALYTICS} component={AnalyticsScreen} />
        <Stack.Screen name={ROUTES.ADD_TRANSACTION} component={AddTransactionScreen} />
        <Stack.Screen name={ROUTES.AI_ASSISTANT} component={AIAssistantScreen} />
        <Stack.Screen name={ROUTES.AI_CHAT} component={AIChatScreen} />
        <Stack.Screen name={ROUTES.MENU} component={MenuScreen} />
        <Stack.Screen name={ROUTES.PROFILE} component={ProfileManagementScreen} />
        <Stack.Screen name={ROUTES.BIOMETRIC_VERIFICATION} component={BiometricVerificationScreen} />
        <Stack.Screen name={ROUTES.STATISTICS} component={StatisticsScreen} />
        <Stack.Screen name={ROUTES.BALANCE_ACCOUNTS} component={BalanceAccountsScreen} />
        <Stack.Screen name={ROUTES.TRANSACTION_HISTORY} component={TransactionHistoryScreen} />
        <Stack.Screen name={ROUTES.BUDGET} component={BudgetScreen} />
        <Stack.Screen name={ROUTES.EXPENSES} component={ExpensesScreen} />
        <Stack.Screen name={ROUTES.SCHEDULED_PAYMENTS} component={ScheduledPaymentsScreen} />
        <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
        <Stack.Screen name={ROUTES.BANK_ACCOUNT_DETAILS} component={BankAccountDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


