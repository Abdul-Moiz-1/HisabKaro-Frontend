// flows/supplierPayment/SupplierPaymentFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import hooks
import { useTheme } from '../../../store/hooks';
import JournalEntryScreen from './screens/JournalEntryScreen';

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
      {/* Step 1: Select Supplier */}
      <Stack.Screen
        name="JournalEntry"
        component={JournalEntryScreen}
        options={{ title: 'New Journal Entry' }}
        initialParams={{ flowType: 'journalEntry' }}
      />
    </Stack.Navigator>
  );
};

export default JournalEntryNavigator;
