// flows/accountTransfer/screens/ConfirmationScreen.tsx
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
import { useThemedStyles } from '../../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const ConfirmationScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();

  const { sourceAccount, destinationAccount, amount, date, notes } =
    // @ts-ignore
    route.params?.flowData || {};

  const sourceBalanceAfter = (sourceAccount?.balance || 0) - amount;
  const destinationBalanceAfter = (destinationAccount?.balance || 0) + amount;

  const handleDone = () => {
    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const handleUndo = () => {
    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const handleAddAnother = () => {
    // @ts-ignore
    navigation.navigate('AccountTransferFlow');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>✅ Transfer Complete</Text>
          <Text style={styles.successSubtitle}>
            Money transferred successfully
          </Text>
        </View>

        {/* Transaction Number */}
        <View style={styles.transactionNumber}>
          <Text style={styles.transactionLabel}>Transaction #</Text>
          <Text style={styles.transactionValue}>
            TRF-{Date.now().toString().slice(-6)}
          </Text>
        </View>

        {/* Transfer Flow Diagram */}
        <View style={styles.flowCard}>
          <View style={styles.flowRow}>
            {/* Source Account */}
            <View style={styles.flowItem}>
              <View
                style={[
                  styles.flowIcon,
                  { backgroundColor: sourceAccount?.color + '20' },
                ]}
              >
                <Ionicons
                  name={sourceAccount?.icon as any}
                  size={24}
                  color={sourceAccount?.color}
                />
              </View>
              <Text style={styles.flowLabel}>{sourceAccount?.name}</Text>
              {sourceAccount?.details && (
                <Text style={styles.flowDetails}>{sourceAccount.details}</Text>
              )}
            </View>

            {/* Arrow */}
            <View style={styles.flowArrow}>
              <Ionicons name="arrow-forward" size={32} color="#007AFF" />
              <Text style={styles.flowAmount}>
                PKR {amount?.toLocaleString()}
              </Text>
            </View>

            {/* Destination Account */}
            <View style={styles.flowItem}>
              <View
                style={[
                  styles.flowIcon,
                  { backgroundColor: destinationAccount?.color + '20' },
                ]}
              >
                <Ionicons
                  name={destinationAccount?.icon as any}
                  size={24}
                  color={destinationAccount?.color}
                />
              </View>
              <Text style={styles.flowLabel}>{destinationAccount?.name}</Text>
              {destinationAccount?.details && (
                <Text style={styles.flowDetails}>
                  {destinationAccount.details}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Transferred</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {amount?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>
              {new Date(date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {/* Balance Updates */}
        <View style={styles.balanceUpdatesCard}>
          <Text style={styles.balanceUpdatesTitle}>
            Account Balances Updated
          </Text>

          {/* Source Account Balance */}
          <View style={styles.balanceItem}>
            <View style={styles.balanceHeader}>
              <View
                style={[
                  styles.balanceIcon,
                  { backgroundColor: sourceAccount?.color + '20' },
                ]}
              >
                <Ionicons
                  name={sourceAccount?.icon as any}
                  size={16}
                  color={sourceAccount?.color}
                />
              </View>
              <Text style={styles.balanceItemTitle}>{sourceAccount?.name}</Text>
            </View>
            <View style={styles.balanceChange}>
              <Text style={styles.balanceBefore}>
                PKR {sourceAccount?.balance.toLocaleString()}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#8E8E93"
                style={styles.balanceArrow}
              />
              <Text style={[styles.balanceAfter, styles.balanceDecrease]}>
                PKR {sourceBalanceAfter.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceDiff}>
              <Ionicons name="trending-down" size={16} color="#FF3B30" />
              <Text style={[styles.balanceDiffText, { color: '#FF3B30' }]}>
                -PKR {amount?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Destination Account Balance */}
          <View style={styles.balanceItem}>
            <View style={styles.balanceHeader}>
              <View
                style={[
                  styles.balanceIcon,
                  { backgroundColor: destinationAccount?.color + '20' },
                ]}
              >
                <Ionicons
                  name={destinationAccount?.icon as any}
                  size={16}
                  color={destinationAccount?.color}
                />
              </View>
              <Text style={styles.balanceItemTitle}>
                {destinationAccount?.name}
              </Text>
            </View>
            <View style={styles.balanceChange}>
              <Text style={styles.balanceBefore}>
                PKR {destinationAccount?.balance.toLocaleString()}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#8E8E93"
                style={styles.balanceArrow}
              />
              <Text style={[styles.balanceAfter, styles.balanceIncrease]}>
                PKR {destinationBalanceAfter.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceDiff}>
              <Ionicons name="trending-up" size={16} color="#34C759" />
              <Text style={[styles.balanceDiffText, { color: '#34C759' }]}>
                +PKR {amount?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Both accounts have been updated. This transfer is recorded in your
            transaction history.
          </Text>
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="receipt" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Transfer Receipt</Text>
            <Text style={styles.actionDescription}>See complete details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="list" size={24} color="#5856D6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Transaction History</Text>
            <Text style={styles.actionDescription}>See all transfers</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="create" size={24} color="#34C759" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Add Note</Text>
            <Text style={styles.actionDescription}>Add additional details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <ActionButton title="✓ Done" onPress={handleDone} variant="primary" />

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleUndo}>
            <Text style={styles.secondaryButtonText}>↩️ Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddAnother}
          >
            <Text style={styles.secondaryButtonText}>➕ New Transfer</Text>
          </TouchableOpacity>
        </View>
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
  transactionNumber: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  transactionLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  transactionValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  flowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  flowRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  flowIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  flowLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  flowDetails: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
    textAlign: 'center' as const,
  },
  flowArrow: {
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.sm,
  },
  flowAmount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    textAlign: 'right' as const,
  },
  summaryValueLarge: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
  },
  notesSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  notesLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  balanceUpdatesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  balanceUpdatesTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  balanceItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  balanceHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  balanceIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  balanceItemTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  balanceChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.xs,
  },
  balanceBefore: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  balanceArrow: {
    marginHorizontal: theme.spacing.sm,
  },
  balanceAfter: {
    ...theme.typography.body,
    fontWeight: '700' as const,
  },
  balanceIncrease: {
    color: '#34C759',
  },
  balanceDecrease: {
    color: '#FF3B30',
  },
  balanceDiff: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  balanceDiffText: {
    ...theme.typography.caption,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  actionsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  actionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  actionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  actionDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  bottomActions: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
});

export default ConfirmationScreen;
