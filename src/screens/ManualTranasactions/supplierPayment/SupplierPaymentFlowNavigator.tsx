// flows/supplierPayment/SupplierPaymentFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import supplier payment-specific screens
import ConfirmationScreen from './screens/ConfirmationScreen';
import ReviewScreen from './screens/ReviewScreen';

// Import shared reusable screens
import {
  AmountEntryScreen,
  BankSelectionScreen,
  PaymentMethodScreen,
  SupplierSelectionScreen,
  ChequeDetailsScreen,
} from '../shared';

// Import hooks
import { useTheme } from '../../../store/hooks';
import InvoiceAllocationScreen from './screens/InvoiceAllocationScreen';

const Stack = createStackNavigator();

const SupplierPaymentFlowNavigator: React.FC = () => {
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
        name="SupplierSelection"
        component={SupplierSelectionScreen}
        options={{ title: 'Pay Supplier' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 2: Enter Amount */}
      <Stack.Screen
        name="AmountEntry"
        component={AmountEntryScreen}
        options={{ title: 'Payment Amount' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 3: Payment Method */}
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ title: 'Payment Method' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 4a: Bank Selection (if Bank selected) */}
      <Stack.Screen
        name="BankSelection"
        component={BankSelectionScreen}
        options={{ title: 'Select Bank Account' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 4b: Cheque Details (if Cheque selected) */}
      <Stack.Screen
        name="ChequeDetails"
        component={ChequeDetailsScreen}
        options={{ title: 'Cheque Details' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 5: Invoice Allocation (Reconciliation) */}
      <Stack.Screen
        name="InvoiceAllocation"
        component={InvoiceAllocationScreen}
        options={{ title: 'Allocate Payment' }}
        initialParams={{ flowType: 'payment' }}
      />

      {/* Step 6: Review Payment */}
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Payment' }}
      />

      {/* Step 7: Confirmation */}
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Payment Complete', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SupplierPaymentFlowNavigator;
