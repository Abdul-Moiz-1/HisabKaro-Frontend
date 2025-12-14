// flows/editTransaction/EditTransactionFlowNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import EditTransactionScreen from './screens/EditTransactionScreen';
import EditConfirmationScreen from './screens/EditConfirmationScreen';
import EditHistoryScreen from './screens/EditHistoryScreen';
import { ROUTES } from '../../constants/routes';
import SelectPartyScreen from './screens/SelectPartyScreen';
import SelectItemsScreen from './screens/SelectItemsScreen';
import SelectCategoryScreen from './screens/SelectCategoryScreen';

const Stack = createStackNavigator();

const EditTransactionFlowNavigator: React.FC = () => {
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
        name={ROUTES.EDIT_TRANSACTION_SELECT_PARTY}
        component={SelectPartyScreen}
        options={{ title: 'Select Customer/Supplier' }}
      />
      <Stack.Screen
        name={ROUTES.EDIT_TRANSACTION_SELECT_ITEM}
        component={SelectItemsScreen}
        options={{ title: 'Select Items' }}
      />
      <Stack.Screen
        name={ROUTES.EDIT_TRANSACTION_SELECT_CATEGORY}
        component={SelectCategoryScreen}
        options={{ title: 'Select Category' }}
      />
      <Stack.Screen
        name={ROUTES.EDIT_TRANSACTION}
        component={EditTransactionScreen}
      />
      <Stack.Screen
        name={ROUTES.EDIT_TRANSACTION_CONFIRM}
        component={EditConfirmationScreen}
      />
      <Stack.Screen
        name={ROUTES.EDIT_TRANSACTION_HISTORY}
        component={EditHistoryScreen}
      />
    </Stack.Navigator>
  );
};

export default EditTransactionFlowNavigator;
