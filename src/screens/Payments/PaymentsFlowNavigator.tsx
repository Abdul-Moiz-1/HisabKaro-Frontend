import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';

// Screens
import SelectCustomerScreen from './screens/SelectCustomerScreen';
import SelectSupplierScreen from './screens/SelectSupplierScreen';
import MakePaymentScreen from './screens/MakePaymentScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';

export type PaymentsFlowParamList = {
  [ROUTES.SELECT_CUSTOMER]: { returnScreen?: string } | undefined;
  [ROUTES.SELECT_SUPPLIER]: { returnScreen?: string } | undefined;
  [ROUTES.MAKE_PAYMENT]: {
    partyId: string;
    partyName: string;
    partyType: 'customer' | 'supplier';
    balance: number;
  };
  [ROUTES.PAYMENT_SUCCESS]: {
    paymentId: string;
    amount: number;
    partyName: string;
    partyType: 'customer' | 'supplier';
    method: string;
    receiptNumber: string;
    allocations?: Array<{
      invoiceNumber: string;
      amount: number;
      status: 'settled' | 'partial';
    }>;
    newBalance: number;
  };
};

const Stack = createStackNavigator<PaymentsFlowParamList>();

interface PaymentsFlowNavigatorProps {
  initialRoute?: keyof PaymentsFlowParamList;
  partyType?: 'customer' | 'supplier';
}

const PaymentsFlowNavigator: React.FC<PaymentsFlowNavigatorProps> = ({
  initialRoute,
  partyType = 'customer',
}) => {
  const theme = useTheme();

  const getInitialRoute = () => {
    if (initialRoute) return initialRoute;
    return partyType === 'customer' ? ROUTES.SELECT_CUSTOMER : ROUTES.SELECT_SUPPLIER;
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={ROUTES.SELECT_CUSTOMER}
        component={SelectCustomerScreen}
      />
      <Stack.Screen
        name={ROUTES.SELECT_SUPPLIER}
        component={SelectSupplierScreen}
      />
      <Stack.Screen
        name={ROUTES.MAKE_PAYMENT}
        component={MakePaymentScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_SUCCESS}
        component={PaymentSuccessScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

export default PaymentsFlowNavigator;
