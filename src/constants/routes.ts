export const ROUTES = {
  SPLASH: 'Splash',
  SPLASH2: 'Splash2',
  SPLASH3: 'Splash3',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  HOME: 'Home',
  ANALYTICS: 'Analytics',
  ADD_TRANSACTION: 'AddTransaction',
  AI_ASSISTANT: 'AIAssistant',
  AI_CHAT: 'AIChat',
  MENU: 'Menu',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];


