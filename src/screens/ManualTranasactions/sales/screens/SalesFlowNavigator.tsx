// flows/sales/SalesFlowNavigator.tsx
// Sales Flow using Redux for state management (NO Context Provider needed)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProductQuantityPriceScreen from './ProductQuantityPriceScreen';
import ShoppingCartScreen from './ShoppingCartScreen';
import DirectTotalScreen from './DirectTotalScreen';
import CreditTermsScreen from './CreditTermsScreen';
import ConfirmationScreen from './ConfirmationScreen';
import {
  AddCustomerScreen,
  AddProductScreen,
  CustomerSelectionScreen,
  ProductSelectionScreen,
} from '../../shared';

const Stack = createStackNavigator();

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
        component={CustomerSelectionScreen}
        options={{ title: 'Sold something' }}
      />
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{ title: 'Add Customer' }}
      />
      <Stack.Screen
        name="ProductSelection"
        component={ProductSelectionScreen}
        options={{ title: 'What did you sell?' }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
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
