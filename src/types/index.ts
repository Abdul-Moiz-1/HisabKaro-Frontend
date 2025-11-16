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

export type RootStackParamList = {
  Splash: undefined;
  Splash2: undefined;
  Splash3: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home?: { userId?: string };
  Analytics: undefined;
  AddTransaction: undefined;
  AddTransactionManual: undefined;
  AIAssistant: undefined;
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
  BankAccountDetails: { accountId: string; accountName: string };
};

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
