// flows/purchase/PurchaseFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import SupplierSelectionScreen from './screens/SupplierSelectionScreen';
import AddSupplierScreen from './screens/AddSupplierScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import AddProductScreen from '../sales/screens/AddProductScreen'; // Reuse from sales
import PurchaseQuantityPriceScreen from './screens/PurchaseQuantityPriceScreen';
import PurchaseBillSummaryScreen from './screens/PurchaseBillSummaryScreen';
import DirectTotalScreen from './screens/DirectTotalScreen';
import PaymentTermsScreen from './screens/PaymentTermsScreen';
import FullPaymentScreen from './screens/FullPaymentScreen';
import CreditTermsScreen from './screens/CreditTermsScreen';
import PartialPaymentScreen from './screens/PartialPaymentScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const PurchaseFlowNavigator: React.FC = () => {
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
        options={{ title: 'Bought something' }}
      />
      <Stack.Screen
        name="AddSupplier"
        component={AddSupplierScreen}
        options={{ title: 'Add Supplier' }}
      />
      <Stack.Screen
        name="ProductSelection"
        component={ProductSelectionScreen}
        options={{ title: 'What did you buy?' }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen
        name="PurchaseQuantityPrice"
        component={PurchaseQuantityPriceScreen}
        options={{ title: 'Quantity & Cost' }}
      />
      <Stack.Screen
        name="PurchaseBillSummary"
        component={PurchaseBillSummaryScreen}
        options={{ title: 'Bill Summary' }}
      />
      <Stack.Screen
        name="DirectTotal"
        component={DirectTotalScreen}
        options={{ title: 'Enter Total' }}
      />
      <Stack.Screen
        name="PaymentTerms"
        component={PaymentTermsScreen}
        options={{ title: 'Payment Terms' }}
      />
      <Stack.Screen
        name="FullPayment"
        component={FullPaymentScreen}
        options={{ title: 'Full Payment' }}
      />
      <Stack.Screen
        name="CreditTerms"
        component={CreditTermsScreen}
        options={{ title: 'Credit Terms' }}
      />
      <Stack.Screen
        name="PartialPayment"
        component={PartialPaymentScreen}
        options={{ title: 'Partial Payment' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Purchase Recorded' }}
      />
    </Stack.Navigator>
  );
};

export default PurchaseFlowNavigator;
