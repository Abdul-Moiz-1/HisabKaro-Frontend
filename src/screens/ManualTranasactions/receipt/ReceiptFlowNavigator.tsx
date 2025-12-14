// flows/receipt/ReceiptFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import CustomerSelectionScreen from './screens/CustomerSelection';
import AddCustomerScreen from './screens/AddCustomerScreen';
import AmountEntryScreen from './screens/AmountEntryScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import BankSelectionScreen from './screens/BankSelectionScreen';
import WalletSelectionScreen from './screens/WalletSelectionScreen';
import ChequeDetailsScreen from './screens/ChequeDetailsScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import { useTheme } from '../../../store/hooks';
import AddBankAccountScreen from './screens/AddBankAccountScreen';
import { ReceiptFlowProvider } from './context/ReceiptFlowContext';

const Stack = createStackNavigator();

const ReceiptFlowStack: React.FC = () => {
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
      <Stack.Screen
        name="CustomerSelection"
        component={CustomerSelectionScreen}
        options={{ title: 'Customer paid me' }}
      />
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{ title: 'Add Customer' }}
      />

      <Stack.Screen
        name="AmountEntry"
        component={AmountEntryScreen}
        options={{ title: 'Amount Entry' }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ title: 'Payment Method' }}
      />
      <Stack.Screen
        name="BankSelection"
        component={BankSelectionScreen}
        options={{ title: 'Bank Transfer' }}
      />
      <Stack.Screen
        name="AddBankAccount"
        component={AddBankAccountScreen}
        options={{ title: 'Add Bank Account' }}
      />
      <Stack.Screen
        name="WalletSelection"
        component={WalletSelectionScreen}
        options={{ title: 'Mobile Wallet' }}
      />
      <Stack.Screen
        name="ChequeDetails"
        component={ChequeDetailsScreen}
        options={{ title: 'Cheque Payment' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Payment Recorded' }}
      />
    </Stack.Navigator>
  );
};

// Wrap the navigator with the ReceiptFlowProvider
const ReceiptFlowNavigator: React.FC = () => {
  return (
    <ReceiptFlowProvider>
      <ReceiptFlowStack />
    </ReceiptFlowProvider>
  );
};

export default ReceiptFlowNavigator;
