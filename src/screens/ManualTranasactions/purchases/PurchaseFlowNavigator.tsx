// flows/purchase/PurchaseFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import purchase-specific screens
import PurchaseBillSummaryScreen from './screens/PurchaseBillSummaryScreen';
import FullPaymentScreen from './screens/FullPaymentScreen';
import CreditTermsScreen from './screens/CreditTermsScreen';
import PartialPaymentScreen from './screens/PartialPaymentScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

// Import shared reusable screens
import {
  DirectTotalScreen,
  PaymentTermScreen,
  ProductQuantityPriceScreen,
  ProductSelectionScreen,
  SupplierSelectionScreen,
  PaymentMethodScreen,
  BankSelectionScreen,
  ShoppingCartScreen,
} from '../shared';

const Stack = createStackNavigator();

// Wrapper components to pass flowType as initial params
const PurchaseSupplierSelection = (props: any) => (
  <SupplierSelectionScreen {...props} />
);

const PurchaseProductSelection = (props: any) => (
  <ProductSelectionScreen {...props} />
);

const PurchaseQuantityPrice = (props: any) => (
  <ProductQuantityPriceScreen {...props} />
);

const PurchaseDirectTotal = (props: any) => (
  <DirectTotalScreen {...props} />
);

const PurchasePaymentTerms = (props: any) => (
  <PaymentTermScreen {...props} />
);

const PurchasePaymentMethod = (props: any) => (
  <PaymentMethodScreen {...props} />
);

const PurchaseBankSelection = (props: any) => (
  <BankSelectionScreen {...props} />
);

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
        component={PurchaseSupplierSelection}
        options={{ title: 'Bought something' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="ProductSelection"
        component={PurchaseProductSelection}
        options={{ title: 'What did you buy?' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="PurchaseQuantityPrice"
        component={PurchaseQuantityPrice}
        options={{ title: 'Quantity & Cost' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{ title: 'Purchase Cart' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="PurchaseBillSummary"
        component={PurchaseBillSummaryScreen}
        options={{ title: 'Bill Summary' }}
      />

      <Stack.Screen
        name="DirectTotal"
        component={PurchaseDirectTotal}
        options={{ title: 'Enter Total' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="PaymentTerms"
        component={PurchasePaymentTerms}
        options={{ title: 'Payment Terms' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="PaymentMethod"
        component={PurchasePaymentMethod}
        options={{ title: 'Payment Method' }}
        initialParams={{ flowType: 'purchase' }}
      />

      <Stack.Screen
        name="BankSelection"
        component={PurchaseBankSelection}
        options={{ title: 'Select Bank Account' }}
        initialParams={{ flowType: 'purchase' }}
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
