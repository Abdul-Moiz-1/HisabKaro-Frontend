// flows/bankTransfer/BankTransferFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import TransferTypeSelectionScreen from './screens/TransferTypeSelectionScreen';
import DepositScreen from './screens/DepositScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const BankTransferFlowNavigator: React.FC = () => {
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
        name="TransferTypeSelection"
        component={TransferTypeSelectionScreen}
        options={{ title: 'Bank Transfer' }}
      />
      <Stack.Screen
        name="Deposit"
        component={DepositScreen}
        options={{ title: 'Deposit to Bank' }}
      />
      <Stack.Screen
        name="Withdrawal"
        component={WithdrawalScreen}
        options={{ title: 'Withdraw from Bank' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Transfer Complete' }}
      />
    </Stack.Navigator>
  );
};

export default BankTransferFlowNavigator;
