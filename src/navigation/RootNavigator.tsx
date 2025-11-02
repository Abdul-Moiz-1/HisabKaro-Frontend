import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { ROUTES } from '../constants/routes';
import SplashScreen from '../screens/Splash/SplashScreen';
import Splash2Screen from '../screens/Splash/Splash2Screen';
import Splash3Screen from '../screens/Splash/Splash3Screen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1A1A1A' },
        }}
      >
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.SPLASH2} component={Splash2Screen} />
        <Stack.Screen name={ROUTES.SPLASH3} component={Splash3Screen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


