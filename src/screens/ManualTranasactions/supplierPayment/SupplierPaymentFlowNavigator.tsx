// flows/supplierPayment/SupplierPaymentFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SupplierSelectionScreen from './screens/SupplierSelectionScreen';
import AddSupplierScreen from '../purchases/screens/AddSupplierScreen'; // Reuse
import AmountEntryScreen from './screens/AmountEntryScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import BankSelectionScreen from '../receipt/screens/BankSelectionScreen'; // Reuse
import WalletSelectionScreen from '../receipt/screens/WalletSelectionScreen'; // Reuse
import ChequeDetailsScreen from '../receipt/screens/ChequeDetailsScreen'; // Reuse
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const SupplierPaymentFlowNavigator: React.FC = () => {
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
        name="SupplierSelection"
        component={SupplierSelectionScreen}
        options={{ title: 'Pay Supplier' }}
      />
      <Stack.Screen
        name="AddSupplier"
        component={AddSupplierScreen}
        options={{ title: 'Add Supplier' }}
      />
      <Stack.Screen
        name="AmountEntry"
        component={AmountEntryScreen}
        options={{ title: 'Payment Amount' }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ title: 'Payment Method' }}
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
        name="ChequeDetails"
        component={ChequeDetailsScreen}
        options={{ title: 'Cheque Details' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Payment Complete' }}
      />
    </Stack.Navigator>
  );
};

export default SupplierPaymentFlowNavigator;
