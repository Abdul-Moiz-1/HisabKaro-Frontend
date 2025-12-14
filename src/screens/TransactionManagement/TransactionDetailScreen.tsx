// screens/transactions/TransactionDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionButton from '../../components/common/ActionButton';
import { useThemedStyles } from '../../theme';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '../../constants/routes';

const TransactionDetailScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const navigation = useNavigation();

  // @ts-ignore
  const { transaction } = route.params || {};

  const handleEdit = () => {
    navigation.navigate(ROUTES.EDIT_TRANSACTION_FLOW, {
      screen: ROUTES.EDIT_TRANSACTION,
      params: { transaction },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon');
  };

  const handlePrint = () => {
    Alert.alert('Print', 'Print functionality coming soon');
  };

  const handleDownloadPDF = () => {
    Alert.alert('Download PDF', 'PDF generation coming soon');
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

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      receipt: 'Payment Received',
      sale: 'Sale Invoice',
      purchase: 'Purchase Bill',
      expense: 'Expense',
      transfer: 'Account Transfer',
      payment: 'Supplier Payment',
    };
    return labels[type] || 'Transaction';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'partial':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const icon = getTransactionIcon(transaction?.type);
  const statusColor = getStatusColor(transaction?.status);

  // Mock additional details based on transaction type
  const getAdditionalDetails = () => {
    switch (transaction?.type) {
      case 'sale':
        return {
          items: [
            {
              name: 'Samsung Galaxy A54',
              quantity: 2,
              price: 75000,
              total: 150000,
            },
            { name: 'Screen Protector', quantity: 2, price: 500, total: 1000 },
          ],
          subtotal: 151000,
          discount: 1000,
          tax: 0,
          total: 150000,
        };
      case 'purchase':
        return {
          items: [
            {
              name: 'iPhone 15 Pro',
              quantity: 5,
              price: 450000,
              total: 2250000,
            },
          ],
          subtotal: 2250000,
          freight: 5000,
          tax: 0,
          total: 2255000,
        };
      default:
        return null;
    }
  };

  const additionalDetails = getAdditionalDetails();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View
            style={[styles.headerIcon, { backgroundColor: icon.color + '20' }]}
          >
            <Ionicons name={icon.name as any} size={40} color={icon.color} />
          </View>
          <Text style={styles.headerType}>
            {getTransactionTypeLabel(transaction?.type)}
          </Text>
          <Text style={styles.headerReference}>{transaction?.reference}</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text
            style={[
              styles.amountValue,
              {
                color:
                  transaction?.type === 'receipt' ||
                  transaction?.type === 'sale'
                    ? '#34C759'
                    : '#FF3B30',
              },
            ]}
          >
            {transaction?.type === 'receipt' || transaction?.type === 'sale'
              ? '+'
              : '-'}
            PKR {transaction?.amount?.toLocaleString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {transaction?.status?.charAt(0).toUpperCase() +
                transaction?.status?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          {transaction?.party && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {transaction?.type === 'receipt' || transaction?.type === 'sale'
                  ? 'Customer'
                  : 'Supplier'}
              </Text>
              <Text style={styles.detailValue}>{transaction.party}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction?.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(transaction?.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {transaction?.paymentMethod && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {transaction.paymentMethod}
              </Text>
            </View>
          )}

          {transaction?.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{transaction.category}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transaction?.description}</Text>
          </View>
        </View>

        {/* Items Card (for sales/purchases) */}
        {additionalDetails?.items && (
          <View style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Items</Text>

            {additionalDetails.items.map((item: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} × PKR {item.price.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  PKR {item.total.toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                PKR {additionalDetails.subtotal.toLocaleString()}
              </Text>
            </View>

            {additionalDetails.discount && additionalDetails.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                  -PKR {additionalDetails.discount.toLocaleString()}
                </Text>
              </View>
            )}

            {additionalDetails.freight && additionalDetails.freight > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Freight</Text>
                <Text style={styles.summaryValue}>
                  PKR {additionalDetails.freight.toLocaleString()}
                </Text>
              </View>
            )}

            {additionalDetails.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  PKR {additionalDetails.tax.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Total</Text>
              <Text style={styles.summaryValueBold}>
                PKR {additionalDetails.total.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Actions Card */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.actionRow} onPress={handleShare}>
            <Ionicons name="share-social" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Share Receipt</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDownloadPDF}
          >
            <Ionicons name="document" size={24} color="#5856D6" />
            <Text style={styles.actionText}>Download PDF</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handlePrint}>
            <Ionicons name="print" size={24} color="#34C759" />
            <Text style={styles.actionText}>Print</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleEdit}>
            <Ionicons name="create" size={24} color="#FF9500" />
            <Text style={styles.actionText}>Edit Transaction</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, styles.actionRowDanger]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={24} color="#FF3B30" />
            <Text style={[styles.actionText, styles.actionTextDanger]}>
              Delete Transaction
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton title="✓ Close" onPress={() => navigation.goBack()} />
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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  headerType: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  headerReference: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    ...theme.typography.h1,
    fontSize: 36,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.md,
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
  detailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
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
  itemsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
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
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
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
  actionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  actionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  actionTextDanger: {
    color: '#FF3B30',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default TransactionDetailScreen;
