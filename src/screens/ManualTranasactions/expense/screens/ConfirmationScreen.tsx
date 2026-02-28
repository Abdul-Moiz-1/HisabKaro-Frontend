// flows/expense/screens/ConfirmationScreen.tsx
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
    category,
    amount,
    paymentMethod,
    date,
    vendorName,
    billNumber,
    notes,
    billPhoto,
    bankAccount,
    walletType,
  } =
    // @ts-ignore
    route.params?.flowData || {};

  const previousBalance = 45000;
  const newBalance = previousBalance - amount;

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
    navigation.navigate('Expense');
  };

  const handleViewReport = () => {
    console.log('View expense report');
  };

  const handleViewBill = () => {
    console.log('View attached bill');
  };

  const handleAddNote = () => {
    console.log('Add note');
  };

  const getPaymentMethodDisplay = () => {
    if (paymentMethod === 'bank' && bankAccount) {
      return `${bankAccount.bankName} (${bankAccount.accountNumber})`;
    }
    if (paymentMethod === 'wallet' && walletType) {
      return walletType.charAt(0).toUpperCase() + walletType.slice(1);
    }
    return paymentMethod?.charAt(0).toUpperCase() + paymentMethod?.slice(1);
  };

  const getBalanceImpactText = () => {
    if (paymentMethod === 'cash') {
      return 'Cash in hand';
    }
    if (paymentMethod === 'bank' && bankAccount) {
      return `${bankAccount.bankName} balance`;
    }
    return 'Balance';
  };

  const formatDate = (dateValue: any) => {
    try {
      return new Date(dateValue).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Not specified';
    }
  };

  // ─── Phase 1: Review ────────────────────────────────────────────────
  if (!confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewHeaderTitle}>Review Expense</Text>
            <Text style={styles.reviewHeaderSubtitle}>
              Please review the details before confirming
            </Text>
          </View>

          {/* Category Card */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Icon name="pricetag" size={20} color="#007AFF" />
              <Text style={styles.reviewCardTitle}>Category</Text>
            </View>
            <View style={styles.reviewCategoryRow}>
              <Text style={styles.reviewCategoryIcon}>{category?.icon}</Text>
              <Text style={styles.reviewCardValue}>
                {category?.name || 'Not specified'}
              </Text>
            </View>
          </View>

          {/* Amount Card */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Icon name="cash" size={20} color="#007AFF" />
              <Text style={styles.reviewCardTitle}>Amount</Text>
            </View>
            <Text style={styles.reviewAmountValue}>
              PKR {amount?.toLocaleString()}
            </Text>
          </View>

          {/* Payment Method Card */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Icon name="card" size={20} color="#007AFF" />
              <Text style={styles.reviewCardTitle}>Payment Method</Text>
            </View>
            <Text style={styles.reviewCardValue}>
              {getPaymentMethodDisplay()}
            </Text>
          </View>

          {/* Date Card */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Icon name="calendar" size={20} color="#007AFF" />
              <Text style={styles.reviewCardTitle}>Date</Text>
            </View>
            <Text style={styles.reviewCardValue}>{formatDate(date)}</Text>
          </View>

          {/* Vendor Card */}
          {vendorName ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Icon name="storefront" size={20} color="#007AFF" />
                <Text style={styles.reviewCardTitle}>Vendor</Text>
              </View>
              <Text style={styles.reviewCardValue}>{vendorName}</Text>
            </View>
          ) : null}

          {/* Bill Number Card */}
          {billNumber ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Icon name="document-text" size={20} color="#007AFF" />
                <Text style={styles.reviewCardTitle}>Bill Number</Text>
              </View>
              <Text style={styles.reviewCardValue}>{billNumber}</Text>
            </View>
          ) : null}

          {/* Notes Card */}
          {notes ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Icon name="create" size={20} color="#007AFF" />
                <Text style={styles.reviewCardTitle}>Notes</Text>
              </View>
              <Text style={styles.reviewCardValue}>{notes}</Text>
            </View>
          ) : null}

          {/* Bill Photo Indicator */}
          {billPhoto ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Icon name="image" size={20} color="#007AFF" />
                <Text style={styles.reviewCardTitle}>Bill Photo</Text>
              </View>
              <View style={styles.reviewPhotoIndicator}>
                <Icon name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.reviewPhotoText}>Photo attached</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.reviewFooter}>
          <View style={styles.reviewFooterButtons}>
            <ActionButton
              title="Go Back"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.reviewGoBackButton}
            />
            <ActionButton
              title="Confirm Expense"
              onPress={() => setConfirmed(true)}
              variant="primary"
              style={styles.reviewConfirmButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Phase 2: Success ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Icon name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>Expense Recorded</Text>
          <Text style={styles.successSubtitle}>Your books are updated</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{category?.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryLabel}>Category</Text>
              <Text style={styles.categoryName}>{category?.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              PKR {amount?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>{getPaymentMethodDisplay()}</Text>
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

          {vendorName && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vendor</Text>
              <Text style={styles.summaryValue}>{vendorName}</Text>
            </View>
          )}

          {billNumber && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bill Number</Text>
              <Text style={styles.summaryValue}>{billNumber}</Text>
            </View>
          )}

          {notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {/* Balance Impact */}
        {(paymentMethod === 'cash' || paymentMethod === 'bank') && (
          <View style={styles.balanceImpactCard}>
            <View style={styles.balanceImpactHeader}>
              <Icon name="trending-down" size={20} color="#FF3B30" />
              <Text style={styles.balanceImpactTitle}>Balance Impact</Text>
            </View>

            <View style={styles.balanceImpactContent}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>
                  {getBalanceImpactText()}:
                </Text>
                <View style={styles.balanceChange}>
                  <Text style={styles.balancePrevious}>
                    PKR {previousBalance.toLocaleString()}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.balanceNew}>
                    PKR {newBalance.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleViewReport}>
          <Icon name="bar-chart" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Expense Report</Text>
            <Text style={styles.actionDescription}>See expense trends</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {billPhoto && (
          <TouchableOpacity style={styles.actionCard} onPress={handleViewBill}>
            <Icon name="image" size={24} color="#5856D6" />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>View Attached Bill</Text>
              <Text style={styles.actionDescription}>See bill photo</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionCard} onPress={handleAddNote}>
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
        <ActionButton title="Done" onPress={handleDone} variant="primary" />

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleUndo}>
            <Text style={styles.secondaryButtonText}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddAnother}
          >
            <Text style={styles.secondaryButtonText}>Add Another Expense</Text>
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

  // ─── Review Phase Styles ──────────────────────────────────────────
  reviewContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  reviewHeader: {
    marginBottom: theme.spacing.lg,
  },
  reviewHeaderTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  reviewHeaderSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  reviewCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
  },
  reviewCardValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  reviewCategoryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  reviewCategoryIcon: {
    fontSize: 28,
  },
  reviewAmountValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.error,
  },
  reviewPhotoIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  reviewPhotoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#34C759',
  },
  reviewFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  reviewFooterButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  reviewGoBackButton: {
    flex: 1,
  },
  reviewConfirmButton: {
    flex: 2,
  },

  // ─── Success Phase Styles ─────────────────────────────────────────
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  categoryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  categoryIcon: {
    fontSize: 48,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
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
    color: theme.colors.error,
    fontWeight: 'bold' as const,
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
    flex: 1,
    marginLeft: theme.spacing.md,
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
  balanceImpactCard: {
    backgroundColor: '#FF3B30' + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  balanceImpactHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  balanceImpactTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  balanceImpactContent: {},
  balanceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  balanceChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  balancePrevious: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  balanceNew: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '700' as const,
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
