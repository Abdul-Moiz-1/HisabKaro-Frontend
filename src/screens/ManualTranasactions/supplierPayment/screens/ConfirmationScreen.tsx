// flows/supplierPayment/screens/ConfirmationScreen.tsx
import React from 'react';
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

  const {
    supplier,
    amount,
    remaining,
    paymentMethod,
    paymentType,
    bankAccount,
    walletType,
  } =
    // @ts-ignore
    route.params?.flowData || {};




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
    navigation.navigate('SupplierPaymentFlow');
  };

  const handleShareReceipt = () => {
    console.log('Share payment receipt');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Icon name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>✅ Payment Recorded</Text>
          <Text style={styles.successSubtitle}>Payment sent successfully</Text>
        </View>

        {/* Payment Number */}
        <View style={styles.paymentNumber}>
          <Text style={styles.paymentLabel}>Payment #</Text>
          <Text style={styles.paymentValue}>
            PAY-{Date.now().toString().slice(-6)}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supplier</Text>
            <Text style={styles.summaryValue}>{supplier?.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
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
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining Balance</Text>
            <Text
              style={[
                styles.summaryValue,
                styles.summaryValueBold,
                {
                  color:
                    remaining === 0
                      ? '#34C759'
                      : remaining < 0
                        ? '#007AFF'
                        : '#FF3B30',
                },
              ]}
            >
              PKR {remaining?.toLocaleString()}
            </Text>
          </View>

          {remaining === 0 && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✅ Fully Paid</Text>
            </View>
          )}

          {remaining < 0 && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: '#007AFF' + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: '#007AFF' }]}>
                💰 Advance Payment: PKR {Math.abs(remaining).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>What's next?</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleShareReceipt}
        >
          <Icon name="share-social" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Share Payment Receipt</Text>
            <Text style={styles.actionDescription}>
              Send to {supplier?.name}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="document-text" size={24} color="#5856D6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Payment Details</Text>
            <Text style={styles.actionDescription}>
              See complete payment info
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {remaining > 0 && (
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="notifications" size={24} color="#FF9500" />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Set Reminder</Text>
              <Text style={styles.actionDescription}>
                For remaining PKR {remaining?.toLocaleString()}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="create" size={24} color="#34C759" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Add Note</Text>
            <Text style={styles.actionDescription}>Optional memo</Text>
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
              ➕ Pay Another Supplier
            </Text>
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
  paymentNumber: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  paymentLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  paymentValue: {
    ...theme.typography.h2,
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
  summaryValueBold: {
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  statusBadge: {
    backgroundColor: '#34C759' + '20',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    alignItems: 'center' as const,
  },
  statusText: {
    ...theme.typography.caption,
    color: '#34C759',
    fontWeight: '600' as const,
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
