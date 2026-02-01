// flows/receipt/ReceiptFlowNavigator.tsx
// Receipt Flow using Redux for state management (NO Context Provider needed)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import receipt-specific screens
import ConfirmationScreen from './screens/ConfirmationScreen';
import ReviewScreen from './screens/ReviewScreen';

// Import shared reusable screens
import {
  CustomerSelectionScreen,
  PaymentMethodScreen,
  BankSelectionScreen,
  AmountEntryScreen,
  InvoiceAllocationScreen,
} from '../shared';

// Import hooks
import { useTheme } from '../../../store/hooks';

const Stack = createStackNavigator();

const ReceiptFlowNavigator: React.FC = () => {
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
      {/* Step 1: Select Customer */}
      <Stack.Screen
        name="CustomerSelection"
        component={CustomerSelectionScreen}
        options={{ title: 'Customer paid me' }}
        initialParams={{ flowType: 'receipt' }}
      />

      {/* Step 2: Enter Amount */}
      <Stack.Screen
        name="AmountEntry"
        component={AmountEntryScreen}
        options={{ title: 'Amount Received' }}
        initialParams={{ flowType: 'receipt' }}
      />

      {/* Step 3: Payment Method */}
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ title: 'Payment Method' }}
        initialParams={{ flowType: 'receipt' }}
      />

      {/* Step 4a: Bank Selection (if Bank selected) */}
      <Stack.Screen
        name="BankSelection"
        component={BankSelectionScreen}
        options={{ title: 'Select Bank Account' }}
        initialParams={{ flowType: 'receipt' }}
      />

      {/* Step 5: Invoice Allocation (Reconciliation) */}
      <Stack.Screen
        name="InvoiceAllocation"
        component={InvoiceAllocationScreen}
        options={{ title: 'Allocate Payment' }}
        initialParams={{ flowType: 'receipt' }}
      />

      {/* Step 6: Review Receipt */}
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Receipt' }}
      />

      {/* Step 7: Confirmation */}
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Payment Recorded', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ReceiptFlowNavigator;
