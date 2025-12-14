// flows/purchase/screens/SupplierSelectionScreen.tsx
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
  email?: string;
  outstanding: number;
  lastPurchaseDate: string;
  lastPurchaseAmount: number;
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Al-Rehman Traders',
    outstanding: 250000,
    lastPurchaseDate: '2025-11-15',
    lastPurchaseAmount: 120000,
    phone: '+923001234567',
  },
  {
    id: '2',
    name: 'Bismillah Wholesale',
    outstanding: 180000,
    lastPurchaseDate: '2025-11-12',
    lastPurchaseAmount: 85000,
    phone: '+923009876543',
  },
  {
    id: '3',
    name: 'Metro Cash & Carry',
    outstanding: 0,
    lastPurchaseDate: '2025-11-10',
    lastPurchaseAmount: 95000,
    phone: '+923007654321',
  },
];

const SupplierSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const handleSupplierSelect = (supplier: Supplier) => {
    navigateToScreen('ProductSelection', { supplier });
  };

  const handleAddSupplier = () => {
    navigateToScreen('AddSupplier');
  };

  const renderSupplierItem = (supplier: Supplier) => {
    return (
      <View style={styles.supplierCard}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.supplierMeta}>
            Last purchase:{' '}
            {new Date(supplier.lastPurchaseDate).toLocaleDateString()}
          </Text>
          <Text style={styles.supplierAmount}>
            PKR {supplier.lastPurchaseAmount.toLocaleString()}
          </Text>
          {supplier.outstanding > 0 && (
            <Text style={styles.supplierOutstanding}>
              Outstanding: PKR {supplier.outstanding.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SearchableList
          data={suppliers}
          searchPlaceholder="🔍 Search or add supplier..."
          searchKey="name"
          onItemPress={handleSupplierSelect}
          renderItem={renderSupplierItem}
          sectionHeader="Recent suppliers:"
          emptyMessage="No suppliers found"
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
  supplierMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  supplierAmount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  supplierOutstanding: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default SupplierSelectionScreen;
