// flows/supplierPayment/screens/SupplierSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableList from '../../../../components/common/SearchableList';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  outstanding: number;
  dueDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Al-Rehman Traders',
    outstanding: 250000,
    dueDate: '2025-11-20',
    lastPaymentDate: '2025-10-15',
    lastPaymentAmount: 120000,
    phone: '+923001234567',
  },
  {
    id: '2',
    name: 'Bismillah Wholesale',
    outstanding: 180000,
    dueDate: '2025-11-15',
    lastPaymentDate: '2025-10-10',
    lastPaymentAmount: 85000,
    phone: '+923009876543',
  },
  {
    id: '3',
    name: 'Metro Cash & Carry',
    outstanding: 95000,
    dueDate: '2025-11-25',
    lastPaymentDate: '2025-10-20',
    lastPaymentAmount: 50000,
    phone: '+923007654321',
  },
];

const SupplierSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const handleSupplierSelect = (supplier: Supplier) => {
    navigateToScreen('AmountEntry', { supplier });
  };

  const handleAddSupplier = () => {
    navigateToScreen('AddSupplier');
  };

  const renderSupplierItem = (supplier: Supplier) => {
    const isOverdue = new Date(supplier.dueDate) < new Date();
    const indicator = isOverdue ? '🔴' : '🟡';

    return (
      <View style={styles.supplierCard}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.supplierAmount}>
            PKR {supplier.outstanding.toLocaleString()}
          </Text>
          <View style={styles.dueDateContainer}>
            <Text style={styles.indicator}>{indicator}</Text>
            <Text style={styles.dueDate}>
              Due: {new Date(supplier.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SearchableList
          data={suppliers}
          searchPlaceholder="🔍 Search supplier name..."
          searchKey="name"
          onItemPress={handleSupplierSelect}
          renderItem={renderSupplierItem}
          sectionHeader="Suppliers with pending payments:"
          emptyMessage="No suppliers with pending payments"
        />
      </View>

      <View style={styles.footer}>
        <ActionButton
          title="+ Add new supplier"
          onPress={handleAddSupplier}
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
  supplierCard: {
    flex: 1,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  supplierAmount: {
    ...theme.typography.caption,
    color: theme.colors.error,
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

export default SupplierSelectionScreen;
