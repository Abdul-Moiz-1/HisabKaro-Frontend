// flows/sales/SalesFlowNavigator.tsx
// Sales Flow using Redux for state management (NO Context Provider needed)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import sales-specific screens
import ProductQuantityPriceScreen from './ProductQuantityPriceScreen';
import DirectTotalScreen from './DirectTotalScreen';
import CreditTermsScreen from './CreditTermsScreen';
import ConfirmationScreen from './ConfirmationScreen';

// Import shared reusable screens
import {
  CustomerSelectionScreen,
  ProductSelectionScreen,
  BankSelectionScreen,
  PaymentMethodScreen,
  ShoppingCartScreen,
} from '../../shared';

const Stack = createStackNavigator();

// Wrapper components to use shared screens with sales flowType
const SalesCustomerSelection = () => <CustomerSelectionScreen />;
const SalesPaymentMethod = () => <PaymentMethodScreen />;
const SalesBankSelection = () => <BankSelectionScreen />;

const SalesFlowNavigator: React.FC = () => {
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
        name="CustomerSelection"
        component={SalesCustomerSelection}
        options={{ title: 'Sold something' }}
        initialParams={{ flowType: 'sales' }}
      />
      <Stack.Screen
        name="ProductSelection"
        component={ProductSelectionScreen}
        options={{ title: 'What did you sell?' }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={SalesPaymentMethod}
        options={{ title: 'Payment Method' }}
        initialParams={{ flowType: 'sales' }}
      />
      <Stack.Screen
        name="BankSelection"
        component={SalesBankSelection}
        options={{ title: 'Select Bank Account' }}
        initialParams={{ flowType: 'sales' }}
      />
      <Stack.Screen
        name="ProductQuantityPrice"
        component={ProductQuantityPriceScreen}
        options={{ title: 'Quantity & Price' }}
      />
      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{ title: 'Shopping Cart' }}
        initialParams={{ flowType: 'sales' }}
      />
      <Stack.Screen
        name="DirectTotal"
        component={DirectTotalScreen}
        options={{ title: 'Enter Total' }}
      />
      <Stack.Screen
        name="CreditTerms"
        component={CreditTermsScreen}
        options={{ title: 'Payment Terms' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Sale Recorded' }}
      />
    </Stack.Navigator>
  );
};

export default SalesFlowNavigator;
