// flows/editTransaction/screens/EditConfirmationScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../../../components/common/ActionButton';
import { Theme } from '../../../constants/theme';

const EditConfirmationScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();

  // @ts-ignore
  const { transaction, changes } = route.params || {};

  const handleDone = () => {
    // @ts-ignore
    navigation.navigate('TransactionList');
  };

  const handleViewTransaction = () => {
    // @ts-ignore
    navigation.navigate('TransactionDetail', { transaction });
  };

  const handleUndo = () => {
    // In real implementation, this would revert the changes
    // @ts-ignore
    navigation.navigate('TransactionList');
  };

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

  const icon = getTransactionIcon(transaction?.type);

  const hasAmountChange = changes?.original.amount !== changes?.updated.amount;
  const hasDateChange = changes?.original.date !== changes?.updated.date;
  const hasDescriptionChange =
    changes?.original.description !== changes?.updated.description;
  const hasPaymentMethodChange =
    changes?.original.paymentMethod !== changes?.updated.paymentMethod;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>✅ Transaction Updated</Text>
          <Text style={styles.successSubtitle}>Changes saved successfully</Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionCard}>
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: icon.color + '20' },
            ]}
          >
            <Ionicons name={icon.name as any} size={32} color={icon.color} />
          </View>
          <Text style={styles.transactionType}>
            {transaction?.type?.charAt(0).toUpperCase() +
              transaction?.type?.slice(1)}
          </Text>
          <Text style={styles.transactionReference}>
            {transaction?.reference}
          </Text>
        </View>

        {/* Changes Summary */}
        <View style={styles.changesCard}>
          <Text style={styles.changesTitle}>Changes Applied</Text>

          {hasAmountChange && (
            <View style={styles.changeItem}>
              <View style={styles.changeHeader}>
                <Ionicons name="cash" size={20} color="#007AFF" />
                <Text style={styles.changeLabel}>Amount</Text>
              </View>
              <View style={styles.changeValues}>
                <View style={styles.changeOldContainer}>
                  <Text style={styles.changeOldLabel}>Before</Text>
                  <Text style={styles.changeOldValue}>
                    PKR {changes?.original.amount.toLocaleString()}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
                <View style={styles.changeNewContainer}>
                  <Text style={styles.changeNewLabel}>After</Text>
                  <Text style={styles.changeNewValue}>
                    PKR {changes?.updated.amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {hasDateChange && (
            <View style={styles.changeItem}>
              <View style={styles.changeHeader}>
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <Text style={styles.changeLabel}>Date</Text>
              </View>
              <View style={styles.changeValues}>
                <View style={styles.changeOldContainer}>
                  <Text style={styles.changeOldLabel}>Before</Text>
                  <Text style={styles.changeOldValue}>
                    {new Date(changes?.original.date).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
                <View style={styles.changeNewContainer}>
                  <Text style={styles.changeNewLabel}>After</Text>
                  <Text style={styles.changeNewValue}>
                    {new Date(changes?.updated.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {hasDescriptionChange && (
            <View style={styles.changeItem}>
              <View style={styles.changeHeader}>
                <Ionicons name="document-text" size={20} color="#007AFF" />
                <Text style={styles.changeLabel}>Description</Text>
              </View>
              <View style={styles.changeValues}>
                <View style={styles.changeOldContainer}>
                  <Text style={styles.changeOldLabel}>Before</Text>
                  <Text style={styles.changeOldValue} numberOfLines={2}>
                    {changes?.original.description}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
                <View style={styles.changeNewContainer}>
                  <Text style={styles.changeNewLabel}>After</Text>
                  <Text style={styles.changeNewValue} numberOfLines={2}>
                    {changes?.updated.description}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {hasPaymentMethodChange && (
            <View style={styles.changeItem}>
              <View style={styles.changeHeader}>
                <Ionicons name="card" size={20} color="#007AFF" />
                <Text style={styles.changeLabel}>Payment Method</Text>
              </View>
              <View style={styles.changeValues}>
                <View style={styles.changeOldContainer}>
                  <Text style={styles.changeOldLabel}>Before</Text>
                  <Text style={styles.changeOldValue}>
                    {changes?.original.paymentMethod}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
                <View style={styles.changeNewContainer}>
                  <Text style={styles.changeNewLabel}>After</Text>
                  <Text style={styles.changeNewValue}>
                    {changes?.updated.paymentMethod}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Edit Details */}
        <View style={styles.editDetailsCard}>
          <Text style={styles.editDetailsTitle}>Edit Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Edited By</Text>
            <Text style={styles.detailValue}>{changes?.editedBy}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Edited At</Text>
            <Text style={styles.detailValue}>
              {new Date(changes?.editedAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason</Text>
            <Text style={styles.detailValue}>{changes?.editReason}</Text>
          </View>
        </View>

        {/* Audit Trail Notice */}
        <View style={styles.auditNotice}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.auditText}>
            This edit has been recorded in the audit trail. Original transaction
            details are preserved for compliance and can be viewed in the edit
            history.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleViewTransaction}
          >
            <Ionicons name="eye" size={24} color="#007AFF" />
            <Text style={styles.actionText}>View Updated Transaction</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="time" size={24} color="#5856D6" />
            <Text style={styles.actionText}>View Edit History</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="share-social" size={24} color="#34C759" />
            <Text style={styles.actionText}>Share Updated Receipt</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <ActionButton title="✓ Done" onPress={handleDone} variant="primary" />

        <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
          <Text style={styles.undoButtonText}>↩️ Undo Changes</Text>
        </TouchableOpacity>
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
  successHeader: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginTop: theme.spacing.sm,
  },
  successSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  transactionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  transactionType: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  transactionReference: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  changesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  changesTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  changeItem: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  changeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  changeLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  changeValues: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  changeOldContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  changeOldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
    marginBottom: 2,
  },
  changeOldValue: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  changeNewContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  changeNewLabel: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  changeNewValue: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  editDetailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  editDetailsTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'right' as const,
  },
  auditNotice: {
    flexDirection: 'row' as const,
    backgroundColor: '#34C759' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  auditText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  actionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  actionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  undoButton: {
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  undoButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
});

export default EditConfirmationScreen;
