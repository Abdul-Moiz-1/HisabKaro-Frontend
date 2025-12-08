// flows/editTransaction/screens/EditTransactionScreen.tsx (Enhanced Version)
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../../theme';
import { useFlowNavigation } from '../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountInputField,
  DateField,
  TextAreaField,
} from '../../../components/DynamicForm';
import { FieldType } from '../../../types/forms';
import ActionButton from '../../../components/common/ActionButton';
import { Theme } from '../../../constants/theme';

const EditTransactionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { transaction } = route.params || {};

  // State for ALL editable fields
  const [amount, setAmount] = useState(transaction?.amount || 0);
  const [date, setDate] = useState(new Date(transaction?.date) || new Date());
  const [description, setDescription] = useState(
    transaction?.description || '',
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.paymentMethod || '',
  );

  // Customer/Supplier/Party
  const [party, setParty] = useState(transaction?.party || null);

  // Items (for sale/purchase transactions)
  const [items, setItems] = useState(transaction?.items || []);

  // Additional fields
  const [category, setCategory] = useState(transaction?.category || '');
  const [notes, setNotes] = useState(transaction?.notes || '');

  const [editReason, setEditReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
    { value: 'wallet', label: 'Mobile Wallet', icon: '📱' },
    { value: 'cheque', label: 'Cheque', icon: '📝' },
    { value: 'card', label: 'Card/POS', icon: '💳' },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return { name: 'arrow-down-circle', color: '#34C759' };
      case 'sale':
        return { name: 'cart', color: '#007AFF' };
      case 'purchase':
        return { name: 'basket', color: '#FF9500' };
      case 'expense':
        return { name: 'receipt', color: '#FF3B30' };
      case 'transfer':
        return { name: 'swap-horizontal', color: '#5856D6' };
      case 'payment':
        return { name: 'cash', color: '#FF2D55' };
      default:
        return { name: 'document', color: '#8E8E93' };
    }
  };

  const checkForChanges = () => {
    const changed =
      amount !== transaction?.amount ||
      date.toISOString() !== new Date(transaction?.date).toISOString() ||
      description !== transaction?.description ||
      paymentMethod !== transaction?.paymentMethod ||
      party?.id !== transaction?.party?.id ||
      JSON.stringify(items) !== JSON.stringify(transaction?.items) ||
      category !== transaction?.category ||
      notes !== transaction?.notes;
    setHasChanges(changed);
  };

  // Handler for changing customer/supplier
  const handleChangeParty = () => {
    const partyType =
      transaction?.type === 'receipt' || transaction?.type === 'sale'
        ? 'Customer'
        : 'Supplier';

    Alert.alert(
      `Change ${partyType}`,
      `Changing the ${partyType.toLowerCase()} will update all related records including accounts ${
        transaction?.type === 'sale' || transaction?.type === 'receipt'
          ? 'receivable'
          : 'payable'
      }. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () =>
            navigateToScreen('SelectParty', {
              currentParty: party,
              partyType,
            }),
        },
      ],
    );
  };

  // Handler for changing items (for sale/purchase)
  const handleChangeItems = () => {
    Alert.alert(
      'Change Items',
      'Changing items will recalculate totals and update inventory. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () =>
            navigateToScreen('SelectItems', {
              currentItems: items,
              transactionType: transaction?.type,
            }),
        },
      ],
    );
  };

  // Handler for changing category (for expenses)
  const handleChangeCategory = () => {
    navigateToScreen('SelectCategory', {
      currentCategory: category,
    });
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSaveChanges = () => {
    if (!hasChanges) {
      Alert.alert(
        'No Changes',
        'You have not made any changes to this transaction.',
      );
      return;
    }

    if (amount === 0) {
      Alert.alert('Invalid Amount', 'Amount cannot be zero.');
      return;
    }

    if (!editReason.trim()) {
      Alert.alert(
        'Edit Reason Required',
        'Please provide a reason for editing this transaction.',
      );
      return;
    }

    // Validate party for transactions that require it
    if (
      (transaction?.type === 'receipt' ||
        transaction?.type === 'sale' ||
        transaction?.type === 'purchase' ||
        transaction?.type === 'payment') &&
      !party
    ) {
      Alert.alert('Party Required', 'Please select a customer or supplier.');
      return;
    }

    // Calculate changes
    const changes = {
      original: {
        amount: transaction?.amount,
        date: transaction?.date,
        description: transaction?.description,
        paymentMethod: transaction?.paymentMethod,
        party: transaction?.party,
        items: transaction?.items,
        category: transaction?.category,
        notes: transaction?.notes,
      },
      updated: {
        amount,
        date: date.toISOString(),
        description,
        paymentMethod,
        party,
        items,
        category,
        notes,
      },
      editReason,
      editedAt: new Date().toISOString(),
      editedBy: 'Current User',
    };

    navigateToScreen('EditConfirmation', { transaction, changes });
  };

  const handleViewHistory = () => {
    navigateToScreen('EditHistory', { transaction });
  };

  const icon = getTransactionIcon(transaction?.type);

  // Determine which fields are editable based on transaction type
  const canEditParty = ['receipt', 'sale', 'purchase', 'payment'].includes(
    transaction?.type,
  );
  const canEditItems = ['sale', 'purchase'].includes(transaction?.type);
  const canEditCategory = transaction?.type === 'expense';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View
            style={[styles.headerIcon, { backgroundColor: icon.color + '20' }]}
          >
            <Ionicons name={icon.name as any} size={32} color={icon.color} />
          </View>
          <Text style={styles.headerType}>
            Edit{' '}
            {transaction?.type?.charAt(0).toUpperCase() +
              transaction?.type?.slice(1)}
          </Text>
          <Text style={styles.headerReference}>{transaction?.reference}</Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={styles.warningText}>
            Editing this transaction will update your accounts and reports. An
            audit trail will be maintained.
          </Text>
        </View>

        {/* Changes Summary */}
        {hasChanges && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>
              📝 Changes Summary (
              {
                Object.keys({
                  ...(amount !== transaction?.amount && { amount: true }),
                  ...(date.toISOString() !==
                    new Date(transaction?.date).toISOString() && {
                    date: true,
                  }),
                  ...(party?.id !== transaction?.party?.id && { party: true }),
                  ...(JSON.stringify(items) !==
                    JSON.stringify(transaction?.items) && { items: true }),
                  ...(paymentMethod !== transaction?.paymentMethod && {
                    paymentMethod: true,
                  }),
                  ...(category !== transaction?.category && { category: true }),
                }).length
              }{' '}
              fields)
            </Text>

            {/* Show all changes */}
            {amount !== transaction?.amount && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Amount</Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    PKR {transaction?.amount.toLocaleString()}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>
                    PKR {amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {party?.id !== transaction?.party?.id && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>
                  {canEditParty &&
                  (transaction?.type === 'receipt' ||
                    transaction?.type === 'sale')
                    ? 'Customer'
                    : 'Supplier'}
                </Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    {transaction?.party?.name || 'None'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>
                    {party?.name || 'None'}
                  </Text>
                </View>
              </View>
            )}

            {JSON.stringify(items) !== JSON.stringify(transaction?.items) && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Items</Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    {transaction?.items?.length || 0} item(s)
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>
                    {items?.length || 0} item(s)
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Party Section (Customer/Supplier) */}
        {canEditParty && (
          <View style={styles.editSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {transaction?.type === 'receipt' || transaction?.type === 'sale'
                  ? '👤 Customer'
                  : '🏢 Supplier'}
              </Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeParty}
              >
                <Text style={styles.changeButtonText}>Change</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {party ? (
              <View style={styles.partyCard}>
                <View style={styles.partyIcon}>
                  <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{party.name}</Text>
                  {party.phone && (
                    <Text style={styles.partyDetail}>📞 {party.phone}</Text>
                  )}
                  {party.outstanding && (
                    <Text style={styles.partyOutstanding}>
                      Outstanding: PKR {party.outstanding.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyParty}>
                <Text style={styles.emptyPartyText}>No party selected</Text>
              </View>
            )}

            <Text style={styles.warningNote}>
              ⚠️ Changing the{' '}
              {transaction?.type === 'receipt' || transaction?.type === 'sale'
                ? 'customer'
                : 'supplier'}{' '}
              will update accounts{' '}
              {transaction?.type === 'receipt' || transaction?.type === 'sale'
                ? 'receivable'
                : 'payable'}
            </Text>
          </View>
        )}

        {/* Items Section (for Sale/Purchase) */}
        {canEditItems && (
          <View style={styles.editSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🛒 Items</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeItems}
              >
                <Text style={styles.changeButtonText}>
                  {items?.length > 0 ? 'Edit Items' : 'Add Items'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {items && items.length > 0 ? (
              <View style={styles.itemsList}>
                {items.map((item: any, index: number) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        Qty: {item.quantity} × PKR{' '}
                        {item.price?.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      PKR {(item.quantity * item.price)?.toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.itemsTotalRow}>
                  <Text style={styles.itemsTotalLabel}>Total:</Text>
                  <Text style={styles.itemsTotalValue}>
                    PKR{' '}
                    {items
                      .reduce(
                        (sum: number, item: any) =>
                          sum + item.quantity * item.price,
                        0,
                      )
                      .toLocaleString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyItems}>
                <Ionicons name="cart-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyItemsText}>No items added</Text>
              </View>
            )}

            <Text style={styles.warningNote}>
              ⚠️ Changing items will recalculate totals and update inventory
            </Text>
          </View>
        )}

        {/* Category Section (for Expenses) */}
        {canEditCategory && (
          <View style={styles.editSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📂 Category</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeCategory}
              >
                <Text style={styles.changeButtonText}>Change</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryText}>
                {category || 'No category'}
              </Text>
            </View>
          </View>
        )}

        {/* Basic Fields Section */}
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>💰 Transaction Details</Text>

          {/* Amount */}
          <Text style={styles.fieldLabel}>Amount *</Text>
          <AmountInputField
            field={{
              id: 'amount',
              name: 'amount',
              label: 'amount',
              type: FieldType.AMOUNT,
            }}
            value={amount}
            onChange={val => {
              setAmount(val);
              checkForChanges();
            }}
            quickAmounts={[]}
            onBlur={() => {}}
          />

          {/* Date */}
          <Text style={styles.fieldLabel}>Date *</Text>
          <DateField
            field={{
              id: 'date',
              name: 'date',
              label: 'date',
              type: FieldType.DATE,
            }}
            value={date.toISOString()}
            onChange={val => {
              setDate(new Date(val));
              checkForChanges();
            }}
            onBlur={() => {}}
          />

          {/* Description */}
          <Text style={styles.fieldLabel}>Description</Text>
          <TextAreaField
            field={{
              id: 'description',
              name: 'description',
              label: 'description',
              type: FieldType.TEXTAREA,
              placeholder: 'Transaction description...',
              numberOfLines: 3,
            }}
            value={description}
            onChange={val => {
              setDescription(val);
              checkForChanges();
            }}
            onBlur={() => {}}
          />

          {/* Payment Method */}
          {transaction?.paymentMethod && (
            <>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.paymentMethodChip,
                      paymentMethod === method.value &&
                        styles.paymentMethodChipSelected,
                    ]}
                    onPress={() => {
                      setPaymentMethod(method.value);
                      checkForChanges();
                    }}
                  >
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === method.value &&
                          styles.paymentMethodTextSelected,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Text style={styles.fieldLabel}>Additional Notes</Text>
          <TextAreaField
            field={{
              id: 'notes',
              name: 'notes',
              label: '',
              type: FieldType.TEXTAREA,
              placeholder:
                'e.g., Incorrect amount entered, Wrong date, Payment method changed...',
              numberOfLines: 4,
              maxLength: 500,
            }}
            onChange={val => {
              setNotes(val);
              checkForChanges();
            }}
            onBlur={() => {}}
            value={notes}
          />
        </View>

        {/* Edit Reason */}
        <View style={styles.reasonSection}>
          <Text style={styles.sectionTitle}>📝 Reason for Edit *</Text>
          <Text style={styles.reasonHint}>
            Please explain why you are editing this transaction
          </Text>
          <TextAreaField
            field={{
              id: 'editReason',
              name: 'editReason',
              label: '',
              type: FieldType.TEXTAREA,
              placeholder:
                'e.g., Incorrect amount entered, Wrong date, Payment method changed...',
              numberOfLines: 4,
              maxLength: 500,
            }}
            onChange={setEditReason}
            onBlur={() => {}}
            value={editReason}
          />
          <Text style={styles.characterCount}>
            {editReason.length}/500 characters
          </Text>
        </View>

        {/* View Edit History */}
        {transaction?.editHistory && transaction.editHistory.length > 0 && (
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleViewHistory}
          >
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={styles.historyButtonText}>
              View Edit History ({transaction.editHistory.length})
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            All changes are tracked and can be audited. The original transaction
            details will be preserved in the edit history.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.footerSpacer} />
        <ActionButton
          title="Save Changes"
          onPress={handleSaveChanges}
          disabled={!hasChanges || !editReason.trim()}
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
    padding: theme.spacing.md,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  headerType: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  headerReference: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  warningBanner: {
    flexDirection: 'row' as const,
    backgroundColor: '#FF9500' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF9500',
    flex: 1,
    lineHeight: 18,
  },
  comparisonCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  comparisonTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  comparisonLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  comparisonValues: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  comparisonOld: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  comparisonNew: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  editSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  changeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  changeButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  partyCard: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  partyIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  partyDetail: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  partyOutstanding: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '600' as const,
  },
  emptyParty: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  emptyPartyText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  itemsList: {
    marginBottom: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  itemDetails: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  itemTotal: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  itemsTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.divider,
  },
  itemsTotalLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  itemsTotalValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  emptyItems: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xxl,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  emptyItemsText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  categoryCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  categoryText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  warningNote: {
    ...theme.typography.caption,
    color: '#FF9500',
    fontSize: 11,
    fontStyle: 'italic' as const,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  paymentMethods: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  paymentMethodChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  paymentMethodChipSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  paymentMethodIcon: {
    fontSize: 16,
  },
  paymentMethodText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  paymentMethodTextSelected: {
    color: theme.colors.primary,
  },
  reasonSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  reasonHint: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  characterCount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'right' as const,
    marginTop: theme.spacing.xs,
  },
  historyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  historyButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    flex: 1,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default EditTransactionScreen;
