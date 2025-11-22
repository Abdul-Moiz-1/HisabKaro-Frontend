// flows/sales/screens/CustomerSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Customer } from '../../../../types/flow';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import SearchableList from '../../../../components/common/SearchableList';

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
  const { navigateToScreen } = useFlowNavigation();
  const [customers] = useState<Customer[]>(mockCustomers);

  const handleCustomerSelect = (customer: Customer) => {
    navigateToScreen('ProductSelection', { customer });
  };

  const handleAddCustomer = () => {
    navigateToScreen('AddCustomer');
  };

  const handleWalkIn = () => {
    navigateToScreen('ProductSelection', {
      customer: {
        id: 'walk-in',
        name: 'Walk-in Customer',
        isWalkIn: true,
        outstanding: 0,
        dueDate: '',
      },
    });
  };

  const renderCustomerItem = (customer: Customer) => {
    return (
      <View style={styles.customerCard}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>

          <Text style={styles.customerMeta}>
            Last sale:{' '}
            {customer.dueDate
              ? new Date(customer.dueDate).toLocaleDateString()
              : ''}
          </Text>
          <Text style={styles.customerAmount}>PKR 50,000</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SearchableList
          data={customers}
          searchPlaceholder="🔍 Search customer name..."
          searchKey="name"
          onItemPress={handleCustomerSelect}
          renderItem={renderCustomerItem}
          sectionHeader="Recent customers:"
          emptyMessage="No customers found"
        />
      </View>

      {/* Walk-in Customer Button */}
      <View style={styles.walkInSection}>
        <Text style={styles.walkInInfo}>
          Don't have customer details? Use walk-in sale
        </Text>
        <TouchableOpacity style={styles.walkInButton} onPress={handleWalkIn}>
          <Text style={styles.walkInButtonText}>Skip - Walk-in customer →</Text>
        </TouchableOpacity>
      </View>

      {/* Add Customer Button */}
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
  content: {
    flex: 1,
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
  customerMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  customerAmount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  walkInSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  walkInInfo: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  walkInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
  },
  walkInButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default CustomerSelectionScreen;
