import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useTheme } from '../store/hooks';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import HomeScreen from '../screens/Home/HomeScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import MenuScreen from '../screens/Menu/MenuScreen';
import AIChatScreen from '../screens/AIAssistant/AIChatScreen';
import DirectoryScreen from '../screens/Directory/DirectoryScreen';
import { ROUTES } from '../constants/routes';

export type MainTabParamList = {
  HomeTab: undefined;
  Reports: undefined;
  DirectoryTab: undefined;
  Menu: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    switch (tabId) {
      case 'home':
        navigation.navigate('HomeTab' as never);
        break;
      case 'reports':
        navigation.navigate('Reports' as never);
        break;
      case 'add':
        // Navigate to AI Chat Screen (AI Assistant)
        navigation.navigate(ROUTES.AI_CHAT as never);
        break;
      case 'directory':
        navigation.navigate('DirectoryTab' as never);
        break;
      case 'settings':
        navigation.navigate('Menu' as never);
        break;
      default:
        break;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => (
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          navigation={navigation}
          state={state}
        />
      )}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="Reports" component={AnalyticsScreen} />
      <Tab.Screen name="DirectoryTab" component={DirectoryScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
