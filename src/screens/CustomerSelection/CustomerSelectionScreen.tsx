// screens/CustomerSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Theme, useThemedStyles } from '../../theme';
import { usePermission } from '../../hooks/usePermission';
import DynamicFormField from '../../components/DynamicForm/DynamicFormField';
import {
  customerSelectionConfig,
  mockCustomers,
} from '../../config/forms/customerSelection';

interface Customer {
  id: string;
  name: string;
  outstanding: number;
  dueDate: string;
  phone: string;
  email?: string;
}

const CustomerSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  const { can } = usePermission();

  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // TODO: Replace with API call
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    // TODO: API call
    setCustomers(mockCustomers);
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(sortCustomers(customers));
      return;
    }

    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCustomers(sortCustomers(filtered));
  };

  const sortCustomers = (customerList: Customer[]) => {
    return customerList.sort((a, b) => {
      // Overdue first
      const aOverdue = new Date(a.dueDate) < new Date();
      const bOverdue = new Date(b.dueDate) < new Date();

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return '#FF3B30'; // Red - Overdue
    if (diffDays <= 7) return '#FF9500'; // Yellow - Due soon
    return '#34C759'; // Green - Not due
  };

  const getDueDateIndicator = (dueDate: string) => {
    const color = getDueDateColor(dueDate);
    if (color === '#FF3B30') return '🔴';
    if (color === '#FF9500') return '🟡';
    return '🟢';
  };

  const handleCustomerSelect = (customer: Customer) => {
    // @ts-ignore
    navigation.navigate('AmountEntry', { customer });
  };

  const handleAddCustomer = () => {
    // @ts-ignore
    navigation.navigate('AddCustomer');
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <View style={styles.customerDetails}>
          <Text style={styles.outstanding}>
            PKR {item.outstanding.toLocaleString()}
          </Text>
          <View style={styles.dueDate}>
            <Text style={styles.dueDateIndicator}>
              {getDueDateIndicator(item.dueDate)}
            </Text>
            <Text style={styles.dueDateText}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer paid me</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Who paid you?</Text>

        <DynamicFormField
          field={customerSelectionConfig.sections[0].fields[0]}
          value={searchQuery}
          onChange={setSearchQuery}
          onBlur={() => {}}
        />

        <Text style={styles.sectionHeader}>
          Customers with pending payments:
        </Text>

        <FlatList
          data={filteredCustomers}
          keyExtractor={item => item.id}
          renderItem={renderCustomer}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddCustomer}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add new customer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as const,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  customerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
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
  customerDetails: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  outstanding: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  dueDate: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  dueDateIndicator: {
    fontSize: 12,
  },
  dueDateText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.text.disabled,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
  },
  addButton: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center' as const,
  },
  addButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});

export default CustomerSelectionScreen;
