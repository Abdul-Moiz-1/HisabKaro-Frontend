// flows/editTransaction/screens/EditTransactionScreen.tsx
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

import Icon from '../../../components/Icon';
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

  // State for editable fields
  const [amount, setAmount] = useState(transaction?.amount || 0);
  const [date, setDate] = useState(new Date(transaction?.date) || new Date());
  const [description, setDescription] = useState(
    transaction?.description || '',
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.paymentMethod || '',
  );
  const [editReason, setEditReason] = useState('');

  // Track changes
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
      paymentMethod !== transaction?.paymentMethod;
    setHasChanges(changed);
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    checkForChanges();
  };

  const handleDateChange = (value: Date) => {
    setDate(value);
    checkForChanges();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    checkForChanges();
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    checkForChanges();
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

    // Calculate changes
    const changes = {
      original: {
        amount: transaction?.amount,
        date: transaction?.date,
        description: transaction?.description,
        paymentMethod: transaction?.paymentMethod,
      },
      updated: {
        amount,
        date: date.toISOString(),
        description,
        paymentMethod,
      },
      editReason,
      editedAt: new Date().toISOString(),
      editedBy: 'Current User', // Replace with actual user
    };

    navigateToScreen('EditConfirmation', { transaction, changes });
  };

  const handleViewHistory = () => {
    navigateToScreen('EditHistory', { transaction });
  };

  const icon = getTransactionIcon(transaction?.type);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View
            style={[styles.headerIcon, { backgroundColor: icon.color + '20' }]}
          >
            <Icon name={icon.name as any} size={32} color={icon.color} />
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
          <Icon name="warning" size={20} color="#FF9500" />
          <Text style={styles.warningText}>
            Editing this transaction will update your accounts and reports. An
            audit trail will be maintained.
          </Text>
        </View>

        {/* Original vs New Comparison */}
        {hasChanges && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Changes Summary</Text>

            {amount !== transaction?.amount && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Amount</Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    PKR {transaction?.amount.toLocaleString()}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>
                    PKR {amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {date.toISOString() !==
              new Date(transaction?.date).toISOString() && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Date</Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    {new Date(transaction?.date).toLocaleDateString()}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>
                    {date.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}

            {paymentMethod !== transaction?.paymentMethod && (
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Payment Method</Text>
                <View style={styles.comparisonValues}>
                  <Text style={styles.comparisonOld}>
                    {transaction?.paymentMethod}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.comparisonNew}>{paymentMethod}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Editable Fields */}
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

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
            onChange={value => handleAmountChange(Number(value))}
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
            onChange={date => handleDateChange(new Date(date))}
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
            onChange={handleDescriptionChange}
            onBlur={() => {}}
          />

          {/* Payment Method (if applicable) */}
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
                    onPress={() => handlePaymentMethodChange(method.value)}
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
        </View>

        {/* Edit Reason */}
        <View style={styles.reasonSection}>
          <Text style={styles.sectionTitle}>Reason for Edit *</Text>
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
            <Icon name="time" size={20} color="#007AFF" />
            <Text style={styles.historyButtonText}>
              View Edit History ({transaction.editHistory.length})
            </Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#007AFF" />
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
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
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
