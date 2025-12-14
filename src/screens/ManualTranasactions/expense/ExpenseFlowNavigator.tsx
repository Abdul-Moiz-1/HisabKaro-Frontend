// flows/expense/ExpenseFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ExpenseCategorySelectionScreen from './screens/ExpenseCategorySelectionScreen';
import ExpenseDetailsScreen from './screens/ExpenseDetailsScreen';
import BankSelectionScreen from '../receipt/screens/BankSelectionScreen'; // Reuse
import WalletSelectionScreen from '../receipt/screens/WalletSelectionScreen'; // Reuse
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const ExpenseFlowNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ExpenseCategorySelection"
        component={ExpenseCategorySelectionScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={({ route }) => ({
          // @ts-ignore
          title: route.params?.flowData?.category?.name || 'Expense Details',
        })}
      />
      <Stack.Screen
        name="BankSelection"
        component={BankSelectionScreen}
        options={{ title: 'Select Bank Account' }}
      />
      <Stack.Screen
        name="WalletSelection"
        component={WalletSelectionScreen}
        options={{ title: 'Select Wallet' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Expense Recorded' }}
      />
    </Stack.Navigator>
  );
};

export default ExpenseFlowNavigator;
