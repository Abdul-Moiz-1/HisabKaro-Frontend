// flows/purchase/screens/PurchaseBillSummaryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountInputField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const PurchaseBillSummaryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { bill = [], supplier } = route.params?.flowData || {};

  const [freight, setFreight] = useState('0');
  const [loading, setLoading] = useState('0');
  const [tax, setTax] = useState('0');
  const [showExpenses, setShowExpenses] = useState(false);

  const subtotal = bill.reduce((sum: number, item: any) => sum + item.total, 0);
  const totalExpenses =
    parseFloat(freight || '0') +
    parseFloat(loading || '0') +
    parseFloat(tax || '0');
  const grandTotal = subtotal + totalExpenses;

  const handleAddMoreItems = () => {
    navigateToScreen('ProductSelection');
  };

  const handleContinue = () => {
    navigateToScreen('PaymentTerms', {
      supplier,
      bill,
      subtotal,
      expenses: {
        freight: parseFloat(freight),
        loading: parseFloat(loading),
        tax: parseFloat(tax),
      },
      grandTotal,
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedBill = bill.filter((item: any) => item.id !== itemId);
    navigateToScreen('PurchaseBillSummary', { bill: updatedBill });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Supplier Info */}
        {supplier && (
          <View style={styles.supplierCard}>
            <Ionicons name="business" size={20} color="#007AFF" />
            <Text style={styles.supplierName}>{supplier.name}</Text>
          </View>
        )}

        {/* Bill Items */}
        <Text style={styles.sectionTitle}>Bill Items ({bill.length})</Text>

        {bill.length === 0 ? (
          <View style={styles.emptyBill}>
            <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No items in bill</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMoreItems}
            >
              <Text style={styles.addButtonText}>+ Add products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {bill.map((item: any, index: number) => (
              <View key={index} style={styles.billItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>
                    Qty: {item.quantity} {item.unit}
                  </Text>
                  <Text style={styles.itemDetail}>
                    @ PKR {item.cost.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={styles.itemTotal}>
                    PKR {item.total.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddMoreItems}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addMoreText}>Add more items</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Expenses Section */}
        {bill.length > 0 && (
          <View style={styles.expensesSection}>
            <TouchableOpacity
              style={styles.expensesHeader}
              onPress={() => setShowExpenses(!showExpenses)}
            >
              <View style={styles.expensesHeaderLeft}>
                <Ionicons name="wallet-outline" size={20} color="#007AFF" />
                <Text style={styles.expensesHeaderText}>
                  Additional Expenses (Optional)
                </Text>
              </View>
              <Ionicons
                name={showExpenses ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>

            {showExpenses && (
              <View style={styles.expensesContent}>
                <AmountInputField
                  field={{
                    id: 'freight',
                    name: 'freight',
                    label: 'Freight / Transportation',
                    placeholder: '0',
                    suffix: 'PKR',
                    type: FieldType.AMOUNT,
                  }}
                  value={freight}
                  onChange={setFreight}
                  onBlur={() => {}}
                />

                <AmountInputField
                  field={{
                    id: 'loading',
                    name: 'loading',
                    label: 'Loading / Unloading Charges',
                    placeholder: '0',
                    suffix: 'PKR',
                    type: FieldType.AMOUNT,
                  }}
                  value={loading}
                  onChange={setLoading}
                  onBlur={() => {}}
                />

                <AmountInputField
                  field={{
                    id: 'tax',
                    name: 'tax',
                    label: 'Tax Paid',
                    placeholder: '0',
                    suffix: 'PKR',
                    type: FieldType.AMOUNT,
                  }}
                  value={tax}
                  onChange={setTax}
                  onBlur={() => {}}
                />

                <View style={styles.expensesInfo}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#007AFF"
                  />
                  <Text style={styles.expensesInfoText}>
                    These costs will be added to your purchase cost
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Summary Card */}
        {bill.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Subtotal</Text>
              <Text style={styles.summaryValue}>
                PKR {subtotal.toLocaleString()}
              </Text>
            </View>

            {totalExpenses > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Additional Expenses</Text>
                <Text style={styles.summaryValue}>
                  PKR {totalExpenses.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Grand Total</Text>
              <Text style={styles.summaryValueBold}>
                PKR {grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {bill.length > 0 && (
        <View style={styles.footer}>
          <ActionButton
            title="Continue to Payment →"
            onPress={handleContinue}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  supplierCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  supplierName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  emptyBill: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  billItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row' as const,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  itemDetail: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  itemFooter: {
    alignItems: 'flex-end' as const,
  },
  itemTotal: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  addMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addMoreText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  expensesSection: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden' as const,
  },
  expensesHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
  },
  expensesHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  expensesHeaderText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  expensesContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  expensesInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  expensesInfoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  summaryLabelBold: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  summaryValueBold: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default PurchaseBillSummaryScreen;
