
export interface User {
  id: string;
  email: string;
  name?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Splash2: undefined;
  Splash3: undefined;
  Login: undefined;
  Signup: undefined;
  Home?: { userId?: string };
  Analytics: undefined;
  AddTransaction: undefined;
  AIAssistant: undefined;
  AIChat?: { chatId?: string };
  Menu: undefined;
};

export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: (screen: T, params?: RootStackParamList[T]) => void;
    goBack: () => void;
    replace: <R extends keyof RootStackParamList>(screen: R, params?: RootStackParamList[R]) => void;
  };
  route: {
    params?: RootStackParamList[T];
  };
};


