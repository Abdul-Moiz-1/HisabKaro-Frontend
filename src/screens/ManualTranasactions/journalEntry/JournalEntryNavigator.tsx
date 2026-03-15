import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { useTheme } from '../../../store/hooks';
import JournalEntryScreen from './screens/JournalEntryScreen';
import ReviewScreen from './screens/ReviewScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const JournalEntryNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          color: theme.colors.text.primary,
          fontWeight: theme.typography.h1.fontWeight,
        },
      }}
    >
      {/* Step 1: Enter Journal Entry Details */}
      <Stack.Screen
        name="JournalEntry"
        component={JournalEntryScreen}
        options={{ title: 'New Journal Entry' }}
        initialParams={{ flowType: 'journalEntry' }}
      />

      {/* Step 2: Review Entry */}
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Entry' }}
      />

      {/* Step 3: Confirmation */}
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Entry Posted', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default JournalEntryNavigator;
