// flows/purchase/screens/ConfirmationScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


import { useThemedStyles } from '../../../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    bill,
    totalAmount,
    // grandTotal,
    // directTotal,
    paymentStatus,
    paymentMethod,
    paidAmount,
    remainingAmount,
    dueDate,

  } =
    // @ts-ignore
    route.params?.flowData || {};





  // const totalAmount = grandTotal || directTotal || 0;                <---- totalamount direct peeche se araha hai 

  const handleDone = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleUndo = () => {
    // Show confirmation dialog
    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const handleRepeatPurchase = () => {
    // @ts-ignore
    navigation.navigate('PurchaseFlow');
  };

  const handleShareBill = () => {
    console.log('Share bill');
  };

  const handleAttachPhoto = () => {
    console.log('Attach bill photo');
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'paid':
        return '#34C759';
      case 'partial':
        return '#FF9500';
      case 'pending':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partially Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Icon name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.successTitle}>✅ Purchase Recorded</Text>
          <Text style={styles.successSubtitle}>Bill created successfully</Text>
        </View>

        {/* Bill Number */}
        <View style={styles.billNumber}>
          <Text style={styles.billLabel}>Bill #</Text>
          <Text style={styles.billValue}>
            BILL-{Date.now().toString().slice(-6)}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supplier</Text>
            <Text style={styles.summaryValue}>{supplier?.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {totalAmount?.toLocaleString()}
            </Text>
          </View>

          {bill && bill.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{bill.length} products</Text>
            </View>
          )}

          {paymentStatus === 'partial' && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paid Now</Text>
                <Text style={styles.summaryValue}>
                  PKR {paidAmount?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                  PKR {remainingAmount?.toLocaleString()}
                </Text>
              </View>
            </>
          )}

          {paymentMethod && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
              </Text>
            </View>
          )}

          {dueDate && paymentStatus !== 'paid' && (
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
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>What's next?</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleShareBill}>
          <Icon name="share-social" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Share Bill</Text>
            <Text style={styles.actionDescription}>
              Send to supplier or save
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleAttachPhoto}>
          <Icon name="camera" size={24} color="#5856D6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>📸 Attach Bill Photo</Text>
            <Text style={styles.actionDescription}>
              Upload supplier's physical bill
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="document-text" size={24} color="#34C759" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Bill Details</Text>
            <Text style={styles.actionDescription}>See complete bill</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {paymentStatus !== 'paid' && (
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="notifications" size={24} color="#FF9500" />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Set Payment Reminder</Text>
              <Text style={styles.actionDescription}>
                Remind before due date
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionCard}>
          <Icon name="create" size={24} color="#8E8E93" />
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
            onPress={handleRepeatPurchase}
          >
            <Text style={styles.secondaryButtonText}>🔄 Repeat Purchase</Text>
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
  billNumber: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  billLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  billValue: {
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
