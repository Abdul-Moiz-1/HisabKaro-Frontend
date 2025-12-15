// flows/sales/screens/ConfirmationScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useThemedStyles } from '../../../../theme';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesFlow } from '../context/SalesFlowContext';
import Icon from '../../../../components/Icon';

const ConfirmationScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { getSaleData, resetFlow } = useSalesFlow();

  // Get sale data from context
  const { saleData, customer } = getSaleData();

  const {
    cart,
    totalAmount,
    paymentType,
    dueDate,
    notes,
    status,
  } = saleData;



  const handleDone = () => {
    resetFlow();
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleUndo = () => {
    // Show confirmation dialog then navigate
    resetFlow();
    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const handleAddAnother = () => {
    // Reset the flow data and start fresh
    resetFlow();
    // @ts-ignore
    navigation.navigate('CustomerSelection');
  };

  const handleShareInvoice = () => {
    // Navigate to share invoice screen
    console.log('Share invoice');
  };

  const handleViewInvoice = () => {
    // Navigate to invoice detail
    console.log('View invoice');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Icon name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>✅ Sale Recorded</Text>
          <Text style={styles.successSubtitle}>
            {paymentType === 'cash' ? 'Payment received' : 'Invoice created'}
          </Text>
        </View>

        {/* Invoice Number */}
        <View style={styles.invoiceNumber}>
          <Text style={styles.invoiceLabel}>Invoice #</Text>
          <Text style={styles.invoiceValue}>
            INV-{Date.now().toString().slice(-6)}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{customer?.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {totalAmount?.toLocaleString()}
            </Text>
          </View>

          {cart && cart.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{cart.length} products</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Type</Text>
            <Text style={styles.summaryValue}>
              {paymentType === 'cash' ? 'Cash Sale' : 'Credit Sale'}
            </Text>
          </View>

          {paymentType === 'credit' && dueDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Due Date</Text>
              <Text style={styles.summaryValue}>
                {new Date(dueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

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
            <Text style={styles.summaryLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status === 'paid' ? '#34C759' + '20' : '#FF9500' + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: status === 'paid' ? '#34C759' : '#FF9500',
                  },
                ]}
              >
                {status === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>What's next?</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleShareInvoice}
        >
          <Icon name="share-social" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>
              Share Invoice to {customer?.name}
            </Text>
            <Text style={styles.actionDescription}>WhatsApp / SMS / Email</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleViewInvoice}>
          <Icon name="document-text" size={24} color="#5856D6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Invoice</Text>
            <Text style={styles.actionDescription}>
              See full invoice details
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {paymentType === 'credit' && (
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="notifications" size={24} color="#FF9500" />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Set Payment Reminder</Text>
              <Text style={styles.actionDescription}>
                Remind customer before due date
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
            <Text style={styles.secondaryButtonText}>➕ Add Another Sale</Text>
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
  invoiceNumber: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  invoiceLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  invoiceValue: {
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.caption,
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
