import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CaretLeft,
  CurrencyCircleDollar,
  CalendarBlank,
  Storefront,
  CaretRight,
} from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import {
  purchaseInvoicesApi,
  Invoice,
  GLEntry,
} from '../../services/api/invoices';
interface InvoicePayment {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  allocatedAmount: number;
  paymentMode: string;
  paidAmount?: number;
  amount?: number;
  status?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Draft: { bg: '#E0E0E0', text: '#616161' },
  Submitted: { bg: '#E3F2FD', text: '#1565C0' },
  Paid: { bg: '#E8F5E9', text: '#2E7D32' },
  'Partially Paid': { bg: '#FFF3E0', text: '#E65100' },
  Cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

const PurchaseInvoiceDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { invoiceId } = route.params;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceDetail = useCallback(async () => {
    try {
      setLoading(true);
      const invoiceRes = await purchaseInvoicesApi.getById(invoiceId);
      const invoiceData = (invoiceRes as any)?.data ?? invoiceRes;
      setInvoice(invoiceData);

      // The detail response includes payments inline from the API
      const paymentsList: InvoicePayment[] = Array.isArray(invoiceData?.payments)
        ? invoiceData.payments
        : [];
      setPayments(paymentsList);
    } catch (error) {
      console.error('Error fetching purchase invoice detail:', error);
      Alert.alert('Error', 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [fetchInvoiceDetail]);

  const formatCurrency = (amount: number | undefined | null) => {
    const safe = Number(amount) || 0;
    return `PKR ${safe.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePaymentPress = useCallback(
    (paymentId: number) => {
      // @ts-ignore
      navigation.navigate(ROUTES.PAYMENT_DETAIL, { paymentId });
    },
    [navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <CaretLeft
              size={24}
              color={theme.colors.text.primary}
              weight="bold"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <CaretLeft
              size={24}
              color={theme.colors.text.primary}
              weight="bold"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_COLORS[invoice.status] || STATUS_COLORS.Draft;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <CaretLeft
            size={24}
            color={theme.colors.text.primary}
            weight="bold"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{invoice.invoiceNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Status & Amount Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.bg },
              ]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {invoice.status}
              </Text>
            </View>
            <Text style={styles.invoiceDateText}>
              {formatDate(invoice.invoiceDate)}
            </Text>
          </View>

          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.totalAmount)}
          </Text>

          <View style={styles.amountsRow}>
            <View style={styles.amountBox}>
              <Text style={styles.amountBoxLabel}>Paid</Text>
              <Text style={[styles.amountBoxValue, { color: '#2E7D32' }]}>
                {formatCurrency(invoice.paidAmount)}
              </Text>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountBox}>
              <Text style={styles.amountBoxLabel}>Payable</Text>
              <Text style={[styles.amountBoxValue, { color: '#E65100' }]}>
                {formatCurrency(invoice.outstandingAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Supplier Info */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Storefront size={20} color={theme.colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Supplier</Text>
              <Text style={styles.infoValue}>
                {invoice.supplierName || 'Walk-in Supplier'}
              </Text>
            </View>
          </View>
          {invoice.dueDate && (
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <CalendarBlank size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Items */}
        {invoice.items && invoice.items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Items</Text>
            {invoice.items.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.itemRow,
                  index < invoice.items.length - 1 && styles.itemBorder,
                ]}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>
                    {item.itemName || item.description || `Item ${index + 1}`}
                  </Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} x {formatCurrency(item.rate)}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>
                  {formatCurrency(item.netAmount || item.amount)}
                </Text>
              </View>
            ))}

            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.subtotalAmount)}
              </Text>
            </View>
            {invoice.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
                  -{formatCurrency(invoice.discountAmount)}
                </Text>
              </View>
            )}
            {invoice.taxAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(invoice.taxAmount)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>
                Total
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { fontWeight: '700', color: theme.colors.primary },
                ]}>
                {formatCurrency(invoice.totalAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Payments Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payments</Text>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <TouchableOpacity
                key={payment.id || index}
                style={[
                  styles.paymentRow,
                  index < payments.length - 1 && styles.itemBorder,
                ]}
                onPress={() => handlePaymentPress(payment.id)}
                activeOpacity={0.7}>
                <View style={styles.paymentIcon}>
                  <CurrencyCircleDollar
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentNumber}>
                    {payment.paymentNumber || `Payment #${payment.id}`}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {formatDate(payment.paymentDate)}
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(
                    payment.allocatedAmount ?? payment.paidAmount ?? payment.amount,
                  )}
                </Text>
                <CaretRight
                  size={16}
                  color={theme.colors.text.disabled}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noPayments}>
              <CurrencyCircleDollar
                size={32}
                color={theme.colors.text.disabled}
              />
              <Text style={styles.noPaymentsText}>
                No payments recorded yet
              </Text>
            </View>
          )}
        </View>

        {/* Remarks */}
        {invoice.remarks && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <Text style={styles.remarksText}>{invoice.remarks}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.sm,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    invoiceDateText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    totalLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    totalValue: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 16,
    },
    amountsRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      overflow: 'hidden',
    },
    amountBox: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
    },
    amountDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
    },
    amountBoxLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    amountBoxValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoContent: {
      marginLeft: 12,
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemLeft: {
      flex: 1,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    itemQty: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    itemAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    paymentContent: {
      flex: 1,
    },
    paymentNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    paymentDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    paymentAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    noPayments: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    noPaymentsText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: 8,
    },
    remarksText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
  });

export default PurchaseInvoiceDetailScreen;
