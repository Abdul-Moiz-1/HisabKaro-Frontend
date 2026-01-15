// flows/receipt/screens/CustomerSelectionScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { Theme } from '../../../../constants/theme';
import SearchableList from '../../../../components/common/SearchableList';
import ActionButton from '../../../../components/common/ActionButton';
import { Customer } from '../../../../types/flow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReceiptFlow } from '../context/ReceiptFlowContext';

// Mock data - replace with API call
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Electronics',
    outstanding: 125000,
    dueDate: '2025-11-10',
    phone: '+923001234567',
  },
  {
    id: '2',
    name: 'Karachi Traders',
    outstanding: 85000,
    dueDate: '2025-11-20',
    phone: '+923009876543',
  },
  {
    id: '3',
    name: 'Bismillah Store',
    outstanding: 45000,
    dueDate: '2025-11-05',
    phone: '+923007654321',
  },
];

const CustomerSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { setCustomer } = useReceiptFlow();
  const [customers] = useState<Customer[]>(mockCustomers);

  const handleCustomerSelect = (customer: Customer) => {
    setCustomer(customer);
    // @ts-ignore
    navigation.navigate('AmountEntry');
  };

  const handleAddCustomer = () => {
    // @ts-ignore
    navigation.navigate('AddCustomer');
  };

  const renderCustomerItem = (customer: Customer) => {
    const isOverdue = new Date(customer.dueDate) < new Date();
    const indicator = isOverdue ? '🔴' : '🟡';

    return (
      <View style={styles.customerCard}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerAmount}>
            PKR {customer.outstanding.toLocaleString()}
          </Text>
          <View style={styles.dueDateContainer}>
            <Text style={styles.indicator}>{indicator}</Text>
            <Text style={styles.dueDate}>
              Due: {new Date(customer.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchableList
        data={customers}
        searchPlaceholder="Search customer name..."
        searchKey="name"
        onItemPress={handleCustomerSelect}
        renderItem={renderCustomerItem}
        sectionHeader="Customers with pending payments:"
        emptyMessage="No customers with pending payments"
      />

      <View style={styles.footer}>
        <ActionButton
          title="+ Add new customer"
          onPress={handleAddCustomer}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  customerCard: {
    flex: 1,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  customerAmount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.xs,
  },
  dueDateContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  indicator: {
    fontSize: 12,
  },
  dueDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default CustomerSelectionScreen;
