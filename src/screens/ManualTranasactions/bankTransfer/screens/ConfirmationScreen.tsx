// flows/bankTransfer/screens/ConfirmationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useThemedStyles } from '../../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

const ConfirmationScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();
  const [confirmed, setConfirmed] = useState(false);

  const {
    transferType,
    amount,
    bankAccount,
    date,
    notes,
    cashBefore,
    cashAfter,
    bankBefore,
    bankAfter,
  } =
    // @ts-ignore
    route.params?.flowData || {};

  const isDeposit = transferType === 'deposit';

  const handleDone = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleUndo = () => {
    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const handleAddAnother = () => {
    // @ts-ignore
    navigation.navigate('BankTransferFlow');
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // ──────────────────────────────────────────────
  // Phase 1 – Review
  // ──────────────────────────────────────────────
  if (!confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Review Header */}
          <View style={styles.reviewHeader}>
            <View
              style={[
                styles.reviewIconCircle,
                { backgroundColor: isDeposit ? '#007AFF15' : '#FF950015' },
              ]}
            >
              <Icon
                name={isDeposit ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={48}
                color={isDeposit ? '#007AFF' : '#FF9500'}
              />
            </View>
            <Text style={styles.reviewTitle}>
              Review {isDeposit ? 'Deposit' : 'Withdrawal'}
            </Text>
            <Text style={styles.reviewSubtitle}>
              Please review the details before confirming
            </Text>
          </View>

          {/* Transfer Details Card */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardTitle}>Transfer Details</Text>

            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Transfer Type</Text>
              <View style={styles.reviewBadgeWrap}>
                <View
                  style={[
                    styles.reviewBadge,
                    {
                      backgroundColor: isDeposit ? '#007AFF15' : '#FF950015',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.reviewBadgeText,
                      { color: isDeposit ? '#007AFF' : '#FF9500' },
                    ]}
                  >
                    {isDeposit ? 'Deposit' : 'Withdrawal'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Amount</Text>
              <Text style={styles.reviewAmountValue}>
                PKR {amount?.toLocaleString()}
              </Text>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Bank Account</Text>
              <View style={{ alignItems: 'flex-end' as const }}>
                <Text style={styles.reviewValue}>{bankAccount?.bankName}</Text>
                <Text style={styles.reviewValueSecondary}>
                  {bankAccount?.accountNumber}
                </Text>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Date</Text>
              <Text style={styles.reviewValue}>{formattedDate}</Text>
            </View>

            {notes ? (
              <>
                <View style={styles.reviewDivider} />
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Notes</Text>
                  <Text
                    style={[styles.reviewValue, { flex: 1, textAlign: 'right' }]}
                    numberOfLines={3}
                  >
                    {notes}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Balance Preview Card */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardTitle}>Balance Preview</Text>

            {/* Cash in Hand */}
            <View style={styles.balanceItem}>
              <View style={styles.balanceHeader}>
                <Icon
                  name="wallet"
                  size={20}
                  color={isDeposit ? '#FF3B30' : '#34C759'}
                />
                <Text style={styles.balanceItemTitle}>Cash in Hand</Text>
              </View>
              <View style={styles.balanceChange}>
                <Text style={styles.balanceBefore}>
                  PKR {cashBefore?.toLocaleString()}
                </Text>
                <Icon
                  name="arrow-forward"
                  size={16}
                  color="#8E8E93"
                  style={styles.balanceArrow}
                />
                <Text
                  style={[
                    styles.balanceAfter,
                    isDeposit ? styles.balanceDecrease : styles.balanceIncrease,
                  ]}
                >
                  PKR {cashAfter?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.balanceDiff}>
                <Icon
                  name={isDeposit ? 'trending-down' : 'trending-up'}
                  size={16}
                  color={isDeposit ? '#FF3B30' : '#34C759'}
                />
                <Text
                  style={[
                    styles.balanceDiffText,
                    { color: isDeposit ? '#FF3B30' : '#34C759' },
                  ]}
                >
                  {isDeposit ? '-' : '+'}PKR {amount?.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Bank Balance */}
            <View style={[styles.balanceItem, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
              <View style={styles.balanceHeader}>
                <Icon
                  name="business"
                  size={20}
                  color={isDeposit ? '#34C759' : '#FF3B30'}
                />
                <Text style={styles.balanceItemTitle}>
                  {bankAccount?.bankName} ({bankAccount?.accountNumber})
                </Text>
              </View>
              <View style={styles.balanceChange}>
                <Text style={styles.balanceBefore}>
                  PKR {bankBefore?.toLocaleString()}
                </Text>
                <Icon
                  name="arrow-forward"
                  size={16}
                  color="#8E8E93"
                  style={styles.balanceArrow}
                />
                <Text
                  style={[
                    styles.balanceAfter,
                    isDeposit ? styles.balanceIncrease : styles.balanceDecrease,
                  ]}
                >
                  PKR {bankAfter?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.balanceDiff}>
                <Icon
                  name={isDeposit ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={isDeposit ? '#34C759' : '#FF3B30'}
                />
                <Text
                  style={[
                    styles.balanceDiffText,
                    { color: isDeposit ? '#34C759' : '#FF3B30' },
                  ]}
                >
                  {isDeposit ? '+' : '-'}PKR {amount?.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Review Footer */}
        <View style={styles.reviewFooter}>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={18} color={styles.goBackButtonText.color} />
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ActionButton
              title="Confirm"
              onPress={() => setConfirmed(true)}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────
  // Phase 2 – Success (existing UI)
  // ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Icon name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>
            ✅ {isDeposit ? 'Deposit' : 'Withdrawal'} Recorded
          </Text>
          <Text style={styles.successSubtitle}>
            {isDeposit ? 'Cash deposited to bank' : 'Cash withdrawn from bank'}
          </Text>
        </View>

        {/* Transaction Number */}
        <View style={styles.transactionNumber}>
          <Text style={styles.transactionLabel}>Transaction #</Text>
          <Text style={styles.transactionValue}>
            TXN-{Date.now().toString().slice(-6)}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              PKR {amount?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>
              {isDeposit ? 'Cash Deposit' : 'Cash Withdrawal'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bank Account</Text>
            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>{bankAccount?.bankName}</Text>
              <Text style={styles.accountNumber}>
                {bankAccount?.accountNumber}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formattedDate}</Text>
          </View>

          {notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {/* Balance Changes */}
        <View style={styles.balanceChangesCard}>
          <Text style={styles.balanceChangesTitle}>Balance Updates</Text>

          {/* Cash Balance */}
          <View style={styles.balanceItem}>
            <View style={styles.balanceHeader}>
              <Icon
                name="wallet"
                size={20}
                color={isDeposit ? '#FF3B30' : '#34C759'}
              />
              <Text style={styles.balanceItemTitle}>Cash in Hand</Text>
            </View>
            <View style={styles.balanceChange}>
              <Text style={styles.balanceBefore}>
                PKR {cashBefore?.toLocaleString()}
              </Text>
              <Icon
                name="arrow-forward"
                size={16}
                color="#8E8E93"
                style={styles.balanceArrow}
              />
              <Text
                style={[
                  styles.balanceAfter,
                  isDeposit ? styles.balanceDecrease : styles.balanceIncrease,
                ]}
              >
                PKR {cashAfter?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceDiff}>
              <Icon
                name={isDeposit ? 'trending-down' : 'trending-up'}
                size={16}
                color={isDeposit ? '#FF3B30' : '#34C759'}
              />
              <Text
                style={[
                  styles.balanceDiffText,
                  { color: isDeposit ? '#FF3B30' : '#34C759' },
                ]}
              >
                {isDeposit ? '-' : '+'}PKR {amount?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Bank Balance */}
          <View style={styles.balanceItem}>
            <View style={styles.balanceHeader}>
              <Icon
                name="business"
                size={20}
                color={isDeposit ? '#34C759' : '#FF3B30'}
              />
              <Text style={styles.balanceItemTitle}>
                {bankAccount?.bankName} ({bankAccount?.accountNumber})
              </Text>
            </View>
            <View style={styles.balanceChange}>
              <Text style={styles.balanceBefore}>
                PKR {bankBefore?.toLocaleString()}
              </Text>
              <Icon
                name="arrow-forward"
                size={16}
                color="#8E8E93"
                style={styles.balanceArrow}
              />
              <Text
                style={[
                  styles.balanceAfter,
                  isDeposit ? styles.balanceIncrease : styles.balanceDecrease,
                ]}
              >
                PKR {bankAfter?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceDiff}>
              <Icon
                name={isDeposit ? 'trending-up' : 'trending-down'}
                size={16}
                color={isDeposit ? '#34C759' : '#FF3B30'}
              />
              <Text
                style={[
                  styles.balanceDiffText,
                  { color: isDeposit ? '#34C759' : '#FF3B30' },
                ]}
              >
                {isDeposit ? '+' : '-'}PKR {amount?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            This transaction has been recorded in your books. Both cash and bank
            balances have been updated.
          </Text>
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="receipt" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Transaction Receipt</Text>
            <Text style={styles.actionDescription}>See complete details</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="document-text" size={24} color="#5856D6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Bank Statement</Text>
            <Text style={styles.actionDescription}>
              See {bankAccount?.bankName} transactions
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="create" size={24} color="#34C759" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Add Note</Text>
            <Text style={styles.actionDescription}>Add additional details</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
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
            <Text style={styles.secondaryButtonText}>
              ➕ Add Another Transfer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  // ── Shared ──
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },

  // ── Review Phase ──
  reviewHeader: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  reviewIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  reviewTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  reviewSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  reviewCardTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  reviewRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
  },
  reviewLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  reviewValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  reviewValueSecondary: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  reviewAmountValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  reviewBadgeWrap: {
    flexDirection: 'row' as const,
  },
  reviewBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  reviewBadgeText: {
    ...theme.typography.caption,
    fontWeight: '600' as const,
  },
  reviewFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  goBackButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
  },
  goBackButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },

  // ── Success Phase ──
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  amountRow: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
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
  bankDetails: {
    alignItems: 'flex-end' as const,
  },
  bankName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  accountNumber: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
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

  // ── Balance (shared by both phases) ──
  balanceChangesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  balanceChangesTitle: {
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

  // ── Info / Actions (success phase) ──
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
