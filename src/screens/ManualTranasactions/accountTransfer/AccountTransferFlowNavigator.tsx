// flows/accountTransfer/AccountTransferFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SourceAccountSelectionScreen from './screens/SourceAccountSelectionScreen';
import AmountEntryScreen from './screens/AmountEntryScreen';
import DestinationAccountSelectionScreen from './screens/DestinationAccountSelectionScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

const AccountTransferFlowNavigator: React.FC = () => {
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
        name="SourceAccountSelection"
        component={SourceAccountSelectionScreen}
        options={{ title: 'Transfer Between Accounts' }}
      />
      <Stack.Screen
        name="AmountEntry"
        component={AmountEntryScreen}
        options={{ title: 'Transfer Amount' }}
      />
      <Stack.Screen
        name="DestinationAccountSelection"
        component={DestinationAccountSelectionScreen}
        options={{ title: 'Transfer To' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Transfer Complete' }}
      />
    </Stack.Navigator>
  );
};

export default AccountTransferFlowNavigator;
